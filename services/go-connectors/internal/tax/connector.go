// Package tax integrates with the Uzbekistan Tax Committee API (Soliqlar Davlat Qo'mitasi)
// and the MXIK (Milliy Mahsulot Xizmatlari Identifikator Kodlari) product catalog.
package tax

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	defaultTaxAPIURL  = "https://api.soliq.uz"
	mxikLookupPath    = "/api/mxik/search"
	fiscalReceiptPath = "/api/fiscal/receipt"
	vatReportPath     = "/api/vat/report"
)

type Connector struct {
	baseURL    string
	apiToken   string
	ndsRate    float64 // default 0.12 (12%)
	httpClient *http.Client
}

func New(baseURL, apiToken string, ndsRate float64, timeout time.Duration) *Connector {
	if baseURL == "" {
		baseURL = defaultTaxAPIURL
	}
	if ndsRate == 0 {
		ndsRate = 0.12
	}
	return &Connector{
		baseURL:  baseURL,
		apiToken: apiToken,
		ndsRate:  ndsRate,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// ─── Domain types ─────────────────────────────────────────────────────────────

type MXIKProduct struct {
	Code        string `json:"code"`
	NameUz      string `json:"name_uz"`
	NameRu      string `json:"name_ru"`
	Unit        string `json:"unit"`
	PackageCode string `json:"package_code"`
	VATCode     string `json:"vat_code"`
}

type FiscalReceiptItem struct {
	MXIKCode    string  `json:"mxik_code"`
	Name        string  `json:"name"`
	Barcode     string  `json:"barcode,omitempty"`
	Quantity    float64 `json:"quantity"`
	Price       int64   `json:"price"`    // tiyin
	Amount      int64   `json:"amount"`   // tiyin
	VAT         int64   `json:"vat"`      // tiyin
	PackageCode string  `json:"package_code"`
}

type FiscalReceiptRequest struct {
	TerminalID  string              `json:"terminal_id"`
	Time        time.Time           `json:"time"`
	Type        int                 `json:"type"` // 0=sale, 1=return
	PaymentType int                 `json:"payment_type"` // 0=cash, 1=card, 2=credit
	TotalAmount int64               `json:"total_amount"` // tiyin
	Items       []FiscalReceiptItem `json:"items"`
}

type FiscalReceiptResult struct {
	ReceiptID   string    `json:"receipt_id"`
	QRCode      string    `json:"qr_code"`
	FiscalSign  string    `json:"fiscal_sign"`
	IssuedAt    time.Time `json:"issued_at"`
}

type VATCalculation struct {
	AmountExcluding int64   `json:"amount_excluding_vat"` // tiyin
	VATAmount       int64   `json:"vat_amount"`           // tiyin
	AmountIncluding int64   `json:"amount_including_vat"` // tiyin
	Rate            float64 `json:"rate"`
}

type VATReport struct {
	Period      string         `json:"period"` // YYYY-MM
	OrgTIN      string         `json:"org_tin"`
	TotalSales  int64          `json:"total_sales"`
	TotalVAT    int64          `json:"total_vat"`
	Lines       []VATReportLine `json:"lines"`
}

type VATReportLine struct {
	OperationDate time.Time `json:"operation_date"`
	DocNumber     string    `json:"doc_number"`
	Counterparty  string    `json:"counterparty"`
	TaxableAmount int64     `json:"taxable_amount"`
	VATAmount     int64     `json:"vat_amount"`
}

// ─── API Methods ──────────────────────────────────────────────────────────────

// SearchMXIK looks up a product in the national catalog by name or barcode.
func (c *Connector) SearchMXIK(ctx context.Context, query string) ([]MXIKProduct, error) {
	path := fmt.Sprintf("%s?q=%s&limit=10", mxikLookupPath, query)
	var products []MXIKProduct
	if err := c.get(ctx, path, &products); err != nil {
		return nil, fmt.Errorf("tax: mxik search: %w", err)
	}
	return products, nil
}

// GetMXIKByCode retrieves a specific MXIK product by its code.
func (c *Connector) GetMXIKByCode(ctx context.Context, code string) (*MXIKProduct, error) {
	var product MXIKProduct
	if err := c.get(ctx, fmt.Sprintf("%s/%s", mxikLookupPath, code), &product); err != nil {
		return nil, fmt.Errorf("tax: get mxik by code: %w", err)
	}
	return &product, nil
}

// IssueFiscalReceipt sends a fiscal receipt to the tax authority terminal.
func (c *Connector) IssueFiscalReceipt(ctx context.Context, req FiscalReceiptRequest) (*FiscalReceiptResult, error) {
	var result FiscalReceiptResult
	if err := c.post(ctx, fiscalReceiptPath, req, &result); err != nil {
		return nil, fmt.Errorf("tax: issue fiscal receipt: %w", err)
	}
	return &result, nil
}

// CalculateVAT computes VAT breakdown for a given amount.
func (c *Connector) CalculateVAT(amountIncludingTiyin int64) VATCalculation {
	// VAT-inclusive amount: net = amount / (1 + rate)
	rate := c.ndsRate
	netTiyin := int64(float64(amountIncludingTiyin) / (1 + rate))
	vatTiyin := amountIncludingTiyin - netTiyin
	return VATCalculation{
		AmountExcluding: netTiyin,
		VATAmount:       vatTiyin,
		AmountIncluding: amountIncludingTiyin,
		Rate:            rate,
	}
}

// GetVATReport retrieves the VAT report for a given period (YYYY-MM).
func (c *Connector) GetVATReport(ctx context.Context, orgTIN, period string) (*VATReport, error) {
	path := fmt.Sprintf("%s?tin=%s&period=%s", vatReportPath, orgTIN, period)
	var report VATReport
	if err := c.get(ctx, path, &report); err != nil {
		return nil, fmt.Errorf("tax: get vat report: %w", err)
	}
	return &report, nil
}

// ─── Internal ─────────────────────────────────────────────────────────────────

func (c *Connector) get(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return err
	}
	return c.do(req, out)
}

func (c *Connector) post(ctx context.Context, path string, body any, out any) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	return c.do(req, out)
}

func (c *Connector) do(req *http.Request, out any) error {
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP error: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(data))
	}

	if out != nil && len(data) > 0 {
		return json.Unmarshal(data, out)
	}
	return nil
}
