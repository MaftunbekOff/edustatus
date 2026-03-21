// Package erp integrates with 1C:Enterprise / ERP systems via HTTP REST adapters.
package erp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Connector struct {
	baseURL    string
	username   string
	password   string
	httpClient *http.Client
}

func New(baseURL, username, password string, timeout time.Duration) *Connector {
	return &Connector{
		baseURL:  baseURL,
		username: username,
		password: password,
		httpClient: &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				MaxIdleConns: 10,
			},
		},
	}
}

// ─── Domain types ─────────────────────────────────────────────────────────────

type Invoice1C struct {
	ID          string    `json:"id"`
	Number      string    `json:"number"`
	Date        time.Time `json:"date"`
	Organization string   `json:"organization"`
	Amount      float64   `json:"amount"`
	VAT         float64   `json:"vat"`
	Total       float64   `json:"total"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	Items       []InvoiceItem1C `json:"items"`
}

type InvoiceItem1C struct {
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	Quantity float64 `json:"quantity"`
	Unit     string  `json:"unit"`
	Price    float64 `json:"price"`
	Amount   float64 `json:"amount"`
	VATRate  float64 `json:"vat_rate"`
}

type Counterparty struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	INN  string `json:"inn"`
	KPP  string `json:"kpp"`
	IBAN string `json:"iban"`
}

type PaymentOrder struct {
	ID              string    `json:"id"`
	Number          string    `json:"number"`
	Date            time.Time `json:"date"`
	Organization    string    `json:"organization"`
	Counterparty    string    `json:"counterparty"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	BankAccount     string    `json:"bank_account"`
	Purpose         string    `json:"purpose"`
	Status          string    `json:"status"`
}

type GoodsReceipt struct {
	ID           string    `json:"id"`
	Date         time.Time `json:"date"`
	Supplier     string    `json:"supplier"`
	Warehouse    string    `json:"warehouse"`
	Items        []InvoiceItem1C `json:"items"`
}

// ─── API Methods ──────────────────────────────────────────────────────────────

// GetInvoice retrieves an invoice from 1C by ID.
func (c *Connector) GetInvoice(ctx context.Context, invoiceID string) (*Invoice1C, error) {
	var inv Invoice1C
	if err := c.get(ctx, "/odata/standard.odata/Document_ПоступлениеТоваровУслуг('"+invoiceID+"')", &inv); err != nil {
		return nil, fmt.Errorf("erp: get invoice: %w", err)
	}
	return &inv, nil
}

// ListInvoices fetches invoices modified after a given time.
func (c *Connector) ListInvoices(ctx context.Context, after time.Time) ([]Invoice1C, error) {
	path := fmt.Sprintf(
		"/odata/standard.odata/Document_ПоступлениеТоваровУслуг?$filter=Date gt datetime'%s'&$format=json",
		after.UTC().Format("2006-01-02T15:04:05"),
	)
	var result struct {
		Value []Invoice1C `json:"value"`
	}
	if err := c.get(ctx, path, &result); err != nil {
		return nil, fmt.Errorf("erp: list invoices: %w", err)
	}
	return result.Value, nil
}

// CreatePaymentOrder sends a payment order to 1C.
func (c *Connector) CreatePaymentOrder(ctx context.Context, order PaymentOrder) (*PaymentOrder, error) {
	var result PaymentOrder
	if err := c.post(ctx, "/odata/standard.odata/Document_ПлатежноеПоручение", order, &result); err != nil {
		return nil, fmt.Errorf("erp: create payment order: %w", err)
	}
	return &result, nil
}

// GetCounterparty retrieves a counterparty by INN.
func (c *Connector) GetCounterparty(ctx context.Context, inn string) (*Counterparty, error) {
	path := fmt.Sprintf(
		"/odata/standard.odata/Catalog_Контрагенты?$filter=ИНН eq '%s'&$format=json&$top=1",
		inn,
	)
	var result struct {
		Value []Counterparty `json:"value"`
	}
	if err := c.get(ctx, path, &result); err != nil {
		return nil, fmt.Errorf("erp: get counterparty: %w", err)
	}
	if len(result.Value) == 0 {
		return nil, fmt.Errorf("erp: counterparty not found for INN %s", inn)
	}
	return &result.Value[0], nil
}

// SyncGoodsReceipt creates a goods receipt in 1C.
func (c *Connector) SyncGoodsReceipt(ctx context.Context, receipt GoodsReceipt) error {
	if err := c.post(ctx, "/odata/standard.odata/Document_ПоступлениеТоваровУслуг", receipt, nil); err != nil {
		return fmt.Errorf("erp: sync goods receipt: %w", err)
	}
	return nil
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
	req.SetBasicAuth(c.username, c.password)
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
