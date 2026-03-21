// Package webhook handles incoming webhook events from payment providers and other services.
package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

type EventType string

const (
	EventPaymentCompleted EventType = "payment.completed"
	EventPaymentFailed    EventType = "payment.failed"
	EventRefundIssued     EventType = "refund.issued"
	EventOrderCreated     EventType = "order.created"
	EventOrderUpdated     EventType = "order.updated"
	EventSubscriptionRenewed EventType = "subscription.renewed"
	EventSubscriptionCancelled EventType = "subscription.cancelled"
)

type WebhookEvent struct {
	ID        string         `json:"id"`
	Type      EventType      `json:"type"`
	Source    string         `json:"source"`
	Payload   map[string]any `json:"payload"`
	Timestamp time.Time      `json:"timestamp"`
}

type EventHandler func(event WebhookEvent) error

type Handler struct {
	secrets  map[string]string // source → HMAC secret
	handlers map[EventType][]EventHandler
	logger   *slog.Logger
}

func NewHandler(logger *slog.Logger) *Handler {
	if logger == nil {
		logger = slog.Default()
	}
	return &Handler{
		secrets:  make(map[string]string),
		handlers: make(map[EventType][]EventHandler),
		logger:   logger,
	}
}

// RegisterSecret registers an HMAC secret for a webhook source (e.g., "stripe", "payme").
func (h *Handler) RegisterSecret(source, secret string) {
	h.secrets[source] = secret
}

// On registers an event handler for a specific event type.
func (h *Handler) On(eventType EventType, fn EventHandler) {
	h.handlers[eventType] = append(h.handlers[eventType], fn)
}

// ServeHTTP implements http.Handler — handles all incoming webhook POSTs.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract source from URL: /webhooks/{source}
	source := strings.TrimPrefix(r.URL.Path, "/webhooks/")
	source = strings.Split(source, "/")[0]

	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20)) // 1MB limit
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Signature verification: if a source is registered, a non-empty secret is required.
	secret, registered := h.secrets[source]
	if registered {
		if secret == "" {
			h.logger.Warn("webhook rejected: HMAC secret not configured", "source", source)
			http.Error(w, "webhook not configured for this source", http.StatusServiceUnavailable)
			return
		}
		sig := r.Header.Get("X-Webhook-Signature")
		if sig == "" {
			sig = r.Header.Get("X-Signature-256")
		}
		if !h.verifyHMAC(body, sig, secret) {
			h.logger.Warn("webhook signature mismatch", "source", source)
			http.Error(w, "invalid signature", http.StatusUnauthorized)
			return
		}
	}

	var event WebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		// Attempt to wrap raw payload
		var raw map[string]any
		if jsonErr := json.Unmarshal(body, &raw); jsonErr != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		event = WebhookEvent{
			Source:    source,
			Payload:   raw,
			Timestamp: time.Now(),
		}
		// Try to extract event type
		if t, ok := raw["type"].(string); ok {
			event.Type = EventType(t)
		}
	}

	event.Source = source
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	h.logger.Info("webhook received",
		"source", source,
		"event", event.Type,
		"id", event.ID,
	)

	handlers, ok := h.handlers[event.Type]
	if !ok {
		h.logger.Debug("no handlers for event type", "type", event.Type)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var errs []string
	for _, fn := range handlers {
		if err := fn(event); err != nil {
			h.logger.Error("webhook handler error",
				"event", event.Type,
				"error", err,
			)
			errs = append(errs, err.Error())
		}
	}

	if len(errs) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"errors": errs,
		})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) verifyHMAC(payload []byte, sig, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(sig))
}

// ForwardToRustCore forwards the event to rust-core using the shared internal secret.
func ForwardToRustCore(rustCoreURL, internalSecret string, client *http.Client) EventHandler {
	return func(event WebhookEvent) error {
		body, err := json.Marshal(event)
		if err != nil {
			return fmt.Errorf("marshal event: %w", err)
		}

		url := strings.TrimRight(rustCoreURL, "/") + "/api/v1/events/incoming"
		req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			return fmt.Errorf("create request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Internal-Secret", internalSecret)

		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("forward to rust-core: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			return fmt.Errorf("rust-core responded with %d", resp.StatusCode)
		}
		return nil
	}
}
