// Package payme integrates with Payme Business API (Uzbekistan payment system).
// API docs: https://developer.help.paycom.uz/
package payme

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	liveURL = "https://checkout.paycom.uz/api"
	testURL = "https://test.paycom.uz/api"
)

// Method names per Payme API
const (
	MethodCheckPerformTransaction = "CheckPerformTransaction"
	MethodCreateTransaction       = "CreateTransaction"
	MethodPerformTransaction      = "PerformTransaction"
	MethodCancelTransaction       = "CancelTransaction"
	MethodCheckTransaction        = "CheckTransaction"
	MethodGetStatement            = "GetStatement"
)

type Connector struct {
	merchantID     string
	merchantKey    string
	webhookSecret  string // separate secret for HMAC-SHA256 callback verification
	testMode       bool
	httpClient     *http.Client
}

// New creates a Payme connector.
// webhookSecret is the shared secret used to verify incoming webhook callbacks
// (distinct from merchantKey, which authenticates outbound API calls).
func New(merchantID, merchantKey, webhookSecret string, testMode bool) *Connector {
	return &Connector{
		merchantID:    merchantID,
		merchantKey:   merchantKey,
		webhookSecret: webhookSecret,
		testMode:      testMode,
		httpClient:    &http.Client{Timeout: 15 * time.Second},
	}
}

// ─── RPC request / response types ────────────────────────────────────────────

type RPCRequest struct {
	Method  string         `json:"method"`
	ID      int64          `json:"id"`
	Params  map[string]any `json:"params"`
}

type RPCResponse struct {
	ID     int64            `json:"id"`
	Result map[string]any   `json:"result,omitempty"`
	Error  *PaymeError      `json:"error,omitempty"`
}

type PaymeError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func (e *PaymeError) Error() string {
	return fmt.Sprintf("payme error %d: %s", e.Code, e.Message)
}

// ─── Domain types ─────────────────────────────────────────────────────────────

type CheckResult struct {
	AllowCreate bool
	Detail      map[string]any
}

type TransactionResult struct {
	TransactionID string
	State         int
	CreateTime    int64
	PerformTime   int64
	CancelTime    int64
	Reason        *int
}

// ─── API methods ──────────────────────────────────────────────────────────────

// CheckPerformTransaction validates an order before transaction creation.
func (c *Connector) CheckPerformTransaction(ctx context.Context, orderID string, amountTiyin int64, account map[string]any) (*CheckResult, error) {
	params := map[string]any{
		"amount":  amountTiyin,
		"account": account,
	}
	resp, err := c.call(ctx, MethodCheckPerformTransaction, 1, params)
	if err != nil {
		return nil, err
	}

	allow, _ := resp["allow"].(bool)
	return &CheckResult{AllowCreate: allow, Detail: resp}, nil
}

// CreateTransaction initiates a Payme transaction.
func (c *Connector) CreateTransaction(
	ctx context.Context,
	paycomTransactionID string,
	orderID string,
	amountTiyin int64,
	account map[string]any,
	createTime int64,
) (*TransactionResult, error) {
	params := map[string]any{
		"id":      paycomTransactionID,
		"time":    createTime,
		"amount":  amountTiyin,
		"account": account,
	}

	resp, err := c.call(ctx, MethodCreateTransaction, 2, params)
	if err != nil {
		return nil, err
	}

	return parseTransaction(resp), nil
}

// PerformTransaction marks a transaction as completed.
func (c *Connector) PerformTransaction(ctx context.Context, paycomTransactionID string) (*TransactionResult, error) {
	params := map[string]any{"id": paycomTransactionID}
	resp, err := c.call(ctx, MethodPerformTransaction, 3, params)
	if err != nil {
		return nil, err
	}
	return parseTransaction(resp), nil
}

// CancelTransaction cancels a transaction with a reason code.
func (c *Connector) CancelTransaction(ctx context.Context, paycomTransactionID string, reason int) (*TransactionResult, error) {
	params := map[string]any{
		"id":     paycomTransactionID,
		"reason": reason,
	}
	resp, err := c.call(ctx, MethodCancelTransaction, 4, params)
	if err != nil {
		return nil, err
	}
	return parseTransaction(resp), nil
}

// CheckTransaction retrieves transaction state.
func (c *Connector) CheckTransaction(ctx context.Context, paycomTransactionID string) (*TransactionResult, error) {
	params := map[string]any{"id": paycomTransactionID}
	resp, err := c.call(ctx, MethodCheckTransaction, 5, params)
	if err != nil {
		return nil, err
	}
	return parseTransaction(resp), nil
}

// GeneratePaymentURL builds the Payme checkout URL for redirect.
func (c *Connector) GeneratePaymentURL(
	merchantID string,
	amountTiyin int64,
	orderID string,
	returnURL string,
) string {
	payload := fmt.Sprintf("m=%s;ac.order_id=%s;a=%d;c=%s", merchantID, orderID, amountTiyin, returnURL)
	encoded := base64.StdEncoding.EncodeToString([]byte(payload))
	base := liveURL
	if c.testMode {
		base = testURL
	}
	return fmt.Sprintf("%s/%s", base, encoded)
}

// VerifySignature validates an incoming Payme callback using HMAC-SHA256.
// The signature header is expected in the format "sha256=<hex>".
func (c *Connector) VerifySignature(body []byte, signature string) bool {
	mac := hmac.New(sha256.New, []byte(c.webhookSecret))
	mac.Write(body)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

// ─── Internal ─────────────────────────────────────────────────────────────────

func (c *Connector) call(ctx context.Context, method string, id int64, params map[string]any) (map[string]any, error) {
	apiURL := liveURL
	if c.testMode {
		apiURL = testURL
	}

	rpcReq := RPCRequest{Method: method, ID: id, Params: params}
	body, err := json.Marshal(rpcReq)
	if err != nil {
		return nil, fmt.Errorf("payme: marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("payme: create request: %w", err)
	}

	token := base64.StdEncoding.EncodeToString([]byte(c.merchantID + ":" + c.merchantKey))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+token)
	req.Header.Set("Cache-Control", "no-cache")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("payme: HTTP error: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("payme: read body: %w", err)
	}

	var rpcResp RPCResponse
	if err := json.Unmarshal(data, &rpcResp); err != nil {
		return nil, fmt.Errorf("payme: unmarshal response: %w", err)
	}

	if rpcResp.Error != nil {
		return nil, rpcResp.Error
	}

	return rpcResp.Result, nil
}

func parseTransaction(m map[string]any) *TransactionResult {
	r := &TransactionResult{}
	if v, ok := m["transaction"].(string); ok {
		r.TransactionID = v
	}
	if v, ok := m["state"].(float64); ok {
		r.State = int(v)
	}
	if v, ok := m["create_time"].(float64); ok {
		r.CreateTime = int64(v)
	}
	if v, ok := m["perform_time"].(float64); ok {
		r.PerformTime = int64(v)
	}
	if v, ok := m["cancel_time"].(float64); ok {
		r.CancelTime = int64(v)
	}
	return r
}
