package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/edustatus/go-connectors/internal/bank"
	"github.com/edustatus/go-connectors/internal/config"
	"github.com/edustatus/go-connectors/internal/ecommerce"
	"github.com/edustatus/go-connectors/internal/erp"
	"github.com/edustatus/go-connectors/internal/payme"
	"github.com/edustatus/go-connectors/internal/retry"
	"github.com/edustatus/go-connectors/internal/tax"
	"github.com/edustatus/go-connectors/internal/webhook"
)

type App struct {
	cfg     *config.Config
	payme   *payme.Connector
	bank    *bank.Connector
	erp     *erp.Connector
	tax     *tax.Connector
	ecom    *ecommerce.Connector
	webhook *webhook.Handler
	retryFn retry.Config
	logger  *slog.Logger
	httpCli *http.Client
}

func main() {
	// Docker healthcheck mode
	if len(os.Args) > 1 && os.Args[1] == "-health-check" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8090"
		}
		resp, err := http.Get("http://127.0.0.1:" + port + "/health/live")
		if err != nil || resp.StatusCode != http.StatusOK {
			os.Exit(1)
		}
		os.Exit(0)
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("config error", "err", err)
		os.Exit(1)
	}

	httpClient := &http.Client{
		Timeout: cfg.HTTPTimeout,
		Transport: &http.Transport{
			MaxIdleConns:    50,
			IdleConnTimeout: 90 * time.Second,
		},
	}

	webhookHandler := webhook.NewHandler(logger)
	// Payme webhooks always require PAYME_WEBHOOK_SECRET (empty = 503 until configured).
	webhookHandler.RegisterSecret("payme", cfg.PaymeWebhookSecret)

	// Forward all webhook events to Rust core (authenticated with INTERNAL_SECRET).
	for _, evType := range []webhook.EventType{
		webhook.EventPaymentCompleted,
		webhook.EventPaymentFailed,
		webhook.EventRefundIssued,
		webhook.EventOrderCreated,
		webhook.EventSubscriptionRenewed,
		webhook.EventSubscriptionCancelled,
	} {
		webhookHandler.On(evType, webhook.ForwardToRustCore(cfg.RustCoreURL, cfg.InternalSecret, httpClient))
	}

	app := &App{
		cfg:   cfg,
		payme: payme.New(cfg.PaymeLogin, cfg.PaymeMerchantKey, cfg.PaymeWebhookSecret, cfg.PaymeTestMode),
		bank:    bank.New(cfg.BankAPIURL, cfg.BankAPIToken, cfg.HTTPTimeout),
		erp:     erp.New(cfg.ERPBaseURL, cfg.ERPUsername, cfg.ERPPassword, cfg.HTTPTimeout),
		tax:     tax.New(cfg.TaxAPIURL, cfg.TaxAPIToken, cfg.TaxNDS, cfg.HTTPTimeout),
		ecom:    ecommerce.New(cfg.EcomBaseURL, cfg.EcomAPIKey, ecommerce.PlatformCustom, cfg.HTTPTimeout),
		webhook: webhookHandler,
		retryFn: retry.DefaultConfig(),
		logger:  logger,
		httpCli: httpClient,
	}

	r := buildRouter(app)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		logger.Info("go-connectors starting", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("shutdown error", "err", err)
	}
	logger.Info("server stopped")
}

// requireInternalSecret rejects any request whose X-Internal-Secret header does
// not match the shared secret configured via INTERNAL_SECRET. Health endpoints
// are explicitly excluded so Docker healthchecks continue to work.
func requireInternalSecret(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get("X-Internal-Secret") != secret {
				respond(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func buildRouter(app *App) http.Handler {
	r := chi.NewRouter()

	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Compress(5))
	r.Use(retry.TimeoutMiddleware(25 * time.Second))
	// go-connectors is an internal service — only rust-core should call it.
	// Wildcard origin is safe here because AllowCredentials is false and the
	// service is not on the frontend network.
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Internal-Secret"},
		AllowCredentials: false,
	}))

	// Health — no auth required (used by Docker healthcheck)
	r.Get("/health/live",  liveness)
	r.Get("/health/ready", readiness)

	// All connector and webhook routes require the internal shared secret.
	r.Group(func(r chi.Router) {
		r.Use(requireInternalSecret(app.cfg.InternalSecret))

	// Payme
	r.Route("/connectors/payme", func(r chi.Router) {
		r.Post("/check",   app.paymeCheckPerform)
		r.Post("/create",  app.paymeCreateTransaction)
		r.Post("/perform", app.paymePerformTransaction)
		r.Post("/cancel",  app.paymeCancelTransaction)
		r.Post("/check-transaction", app.paymeCheckTransaction)
		r.Get("/payment-url", app.paymePaymentURL)
	})

	// Bank
	r.Route("/connectors/bank", func(r chi.Router) {
		r.Post("/transfer",           app.bankTransfer)
		r.Get("/balance/{accountId}", app.bankBalance)
		r.Get("/statement/{accountId}", app.bankStatement)
	})

	// ERP
	r.Route("/connectors/erp", func(r chi.Router) {
		r.Get("/invoices",           app.erpListInvoices)
		r.Get("/invoices/{id}",      app.erpGetInvoice)
		r.Post("/payment-orders",    app.erpCreatePaymentOrder)
		r.Get("/counterparty/{inn}", app.erpGetCounterparty)
	})

	// Tax / MXIK
	r.Route("/connectors/tax", func(r chi.Router) {
		r.Get("/mxik/search",         app.taxMXIKSearch)
		r.Get("/mxik/{code}",         app.taxMXIKByCode)
		r.Post("/fiscal-receipt",     app.taxIssueFiscalReceipt)
		r.Post("/vat/calculate",      app.taxCalculateVAT)
		r.Get("/vat/report",          app.taxVATReport)
	})

	// E-commerce
	r.Route("/connectors/ecommerce", func(r chi.Router) {
		r.Get("/orders",          app.ecomListOrders)
		r.Get("/orders/{id}",     app.ecomGetOrder)
		r.Post("/orders/{id}/fulfill", app.ecomFulfillOrder)
		r.Put("/inventory",       app.ecomUpdateInventory)
		r.Post("/sync/catalog",   app.ecomSyncCatalog)
	})

	// Webhooks (all sources handled by the webhook handler)
	r.Mount("/webhooks", app.webhook)

	}) // end r.Group (requireInternalSecret)

	return r
}

// ─── Health ───────────────────────────────────────────────────────────────────

func liveness(w http.ResponseWriter, r *http.Request) {
	respond(w, http.StatusOK, map[string]string{"status": "ok", "service": "go-connectors"})
}

func readiness(w http.ResponseWriter, r *http.Request) {
	respond(w, http.StatusOK, map[string]string{"status": "ready"})
}

// ─── Payme handlers ───────────────────────────────────────────────────────────

func (app *App) paymeCheckPerform(w http.ResponseWriter, r *http.Request) {
	var body struct {
		OrderID     string         `json:"order_id"`
		AmountTiyin int64          `json:"amount_tiyin"`
		Account     map[string]any `json:"account"`
	}
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.payme.CheckPerformTransaction(r.Context(), body.OrderID, body.AmountTiyin, body.Account)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) paymeCreateTransaction(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PaycomID    string         `json:"paycom_id"`
		OrderID     string         `json:"order_id"`
		AmountTiyin int64          `json:"amount_tiyin"`
		Account     map[string]any `json:"account"`
		CreateTime  int64          `json:"create_time"`
	}
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.payme.CreateTransaction(r.Context(), body.PaycomID, body.OrderID, body.AmountTiyin, body.Account, body.CreateTime)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) paymePerformTransaction(w http.ResponseWriter, r *http.Request) {
	var body struct{ PaycomID string `json:"paycom_id"` }
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.payme.PerformTransaction(r.Context(), body.PaycomID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) paymeCancelTransaction(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PaycomID string `json:"paycom_id"`
		Reason   int    `json:"reason"`
	}
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.payme.CancelTransaction(r.Context(), body.PaycomID, body.Reason)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) paymeCheckTransaction(w http.ResponseWriter, r *http.Request) {
	var body struct{ PaycomID string `json:"paycom_id"` }
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.payme.CheckTransaction(r.Context(), body.PaycomID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) paymePaymentURL(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	merchantID := q.Get("merchant_id")
	orderID := q.Get("order_id")
	returnURL := q.Get("return_url")
	var amount int64
	fmt.Sscanf(q.Get("amount"), "%d", &amount)

	url := app.payme.GeneratePaymentURL(merchantID, amount, orderID, returnURL)
	respond(w, http.StatusOK, map[string]string{"url": url})
}

// ─── Bank handlers ────────────────────────────────────────────────────────────

func (app *App) bankTransfer(w http.ResponseWriter, r *http.Request) {
	var req bank.TransferRequest
	if err := decodeJSON(w, r, &req); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.bank.Transfer(r.Context(), req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) bankBalance(w http.ResponseWriter, r *http.Request) {
	accountID := chi.URLParam(r, "accountId")
	result, err := app.bank.GetBalance(r.Context(), accountID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) bankStatement(w http.ResponseWriter, r *http.Request) {
	accountID := chi.URLParam(r, "accountId")
	from, _ := time.Parse(time.RFC3339, r.URL.Query().Get("from"))
	to, _ := time.Parse(time.RFC3339, r.URL.Query().Get("to"))
	if to.IsZero() {
		to = time.Now()
	}
	if from.IsZero() {
		from = to.AddDate(0, -1, 0)
	}
	entries, err := app.bank.GetStatement(r.Context(), accountID, from, to)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": entries})
}

// ─── ERP handlers ─────────────────────────────────────────────────────────────

func (app *App) erpListInvoices(w http.ResponseWriter, r *http.Request) {
	since, _ := time.Parse(time.RFC3339, r.URL.Query().Get("since"))
	if since.IsZero() {
		since = time.Now().AddDate(0, -1, 0)
	}
	invoices, err := app.erp.ListInvoices(r.Context(), since)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": invoices})
}

func (app *App) erpGetInvoice(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	inv, err := app.erp.GetInvoice(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": inv})
}

func (app *App) erpCreatePaymentOrder(w http.ResponseWriter, r *http.Request) {
	var req erp.PaymentOrder
	if err := decodeJSON(w, r, &req); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.erp.CreatePaymentOrder(r.Context(), req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) erpGetCounterparty(w http.ResponseWriter, r *http.Request) {
	inn := chi.URLParam(r, "inn")
	cp, err := app.erp.GetCounterparty(r.Context(), inn)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": cp})
}

// ─── Tax handlers ─────────────────────────────────────────────────────────────

func (app *App) taxMXIKSearch(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	products, err := app.tax.SearchMXIK(r.Context(), q)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": products})
}

func (app *App) taxMXIKByCode(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	product, err := app.tax.GetMXIKByCode(r.Context(), code)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": product})
}

func (app *App) taxIssueFiscalReceipt(w http.ResponseWriter, r *http.Request) {
	var req tax.FiscalReceiptRequest
	if err := decodeJSON(w, r, &req); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result, err := app.tax.IssueFiscalReceipt(r.Context(), req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) taxCalculateVAT(w http.ResponseWriter, r *http.Request) {
	var body struct {
		AmountIncludingTiyin int64 `json:"amount_including_tiyin"`
	}
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	result := app.tax.CalculateVAT(body.AmountIncludingTiyin)
	respond(w, http.StatusOK, map[string]any{"data": result})
}

func (app *App) taxVATReport(w http.ResponseWriter, r *http.Request) {
	tin := r.URL.Query().Get("tin")
	period := r.URL.Query().Get("period")
	report, err := app.tax.GetVATReport(r.Context(), tin, period)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": report})
}

// ─── E-commerce handlers ──────────────────────────────────────────────────────

func (app *App) ecomListOrders(w http.ResponseWriter, r *http.Request) {
	since, _ := time.Parse(time.RFC3339, r.URL.Query().Get("since"))
	if since.IsZero() {
		since = time.Now().Add(-24 * time.Hour)
	}
	orders, err := app.ecom.ListOrders(r.Context(), since, 50)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": orders})
}

func (app *App) ecomGetOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	order, err := app.ecom.GetOrder(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": order})
}

func (app *App) ecomFulfillOrder(w http.ResponseWriter, r *http.Request) {
	var req ecommerce.FulfillmentRequest
	if err := decodeJSON(w, r, &req); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	req.OrderID = chi.URLParam(r, "id")
	if err := app.ecom.FulfillOrder(r.Context(), req); err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]string{"status": "fulfilled"})
}

func (app *App) ecomUpdateInventory(w http.ResponseWriter, r *http.Request) {
	var body struct {
		SKU      string `json:"sku"`
		Quantity int    `json:"quantity"`
	}
	if err := decodeJSON(w, r, &body); err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	if err := app.ecom.UpdateInventory(r.Context(), body.SKU, body.Quantity); err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]string{"status": "updated"})
}

func (app *App) ecomSyncCatalog(w http.ResponseWriter, r *http.Request) {
	result, err := app.ecom.SyncCatalog(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"data": result})
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func decodeJSON(w http.ResponseWriter, r *http.Request, v any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	return json.NewDecoder(r.Body).Decode(v)
}

func respond(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func respondError(w http.ResponseWriter, status int, err error) {
	respond(w, status, map[string]string{"error": err.Error()})
}
