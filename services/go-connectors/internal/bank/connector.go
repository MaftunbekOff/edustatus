// Package bank provides a generic Bank API connector with retry and timeout support.
package bank

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
	token      string
	httpClient *http.Client
}

func New(baseURL, token string, timeout time.Duration) *Connector {
	return &Connector{
		baseURL: baseURL,
		token:   token,
		httpClient: &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				MaxIdleConns:    20,
				IdleConnTimeout: 90 * time.Second,
			},
		},
	}
}

// ─── Domain types ─────────────────────────────────────────────────────────────

type TransferRequest struct {
	FromAccount string  `json:"from_account"`
	ToAccount   string  `json:"to_account"`
	AmountUZS   float64 `json:"amount_uzs"`
	Currency    string  `json:"currency"`
	Reference   string  `json:"reference"`
	Description string  `json:"description"`
}

type TransferResult struct {
	TransactionID string    `json:"transaction_id"`
	Status        string    `json:"status"`
	ProcessedAt   time.Time `json:"processed_at"`
	Fee           float64   `json:"fee"`
}

type BalanceResult struct {
	AccountID   string  `json:"account_id"`
	BalanceUZS  float64 `json:"balance_uzs"`
	Available   float64 `json:"available"`
	Currency    string  `json:"currency"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StatementEntry struct {
	ID          string    `json:"id"`
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	Direction   string    `json:"direction"` // "credit" | "debit"
	Description string    `json:"description"`
	Balance     float64   `json:"balance"`
	Date        time.Time `json:"date"`
}

// ─── API Methods ──────────────────────────────────────────────────────────────

// Transfer initiates a bank transfer.
func (c *Connector) Transfer(ctx context.Context, req TransferRequest) (*TransferResult, error) {
	var result TransferResult
	if err := c.post(ctx, "/v1/transfers", req, &result); err != nil {
		return nil, fmt.Errorf("bank: transfer: %w", err)
	}
	return &result, nil
}

// GetBalance returns current balance for an account.
func (c *Connector) GetBalance(ctx context.Context, accountID string) (*BalanceResult, error) {
	var result BalanceResult
	if err := c.get(ctx, fmt.Sprintf("/v1/accounts/%s/balance", accountID), &result); err != nil {
		return nil, fmt.Errorf("bank: get balance: %w", err)
	}
	return &result, nil
}

// GetStatement fetches a date-range statement.
func (c *Connector) GetStatement(ctx context.Context, accountID string, from, to time.Time) ([]StatementEntry, error) {
	path := fmt.Sprintf(
		"/v1/accounts/%s/statement?from=%s&to=%s",
		accountID,
		from.Format(time.RFC3339),
		to.Format(time.RFC3339),
	)
	var entries []StatementEntry
	if err := c.get(ctx, path, &entries); err != nil {
		return nil, fmt.Errorf("bank: get statement: %w", err)
	}
	return entries, nil
}

// CheckTransactionStatus polls a transaction status by ID.
func (c *Connector) CheckTransactionStatus(ctx context.Context, transactionID string) (string, error) {
	var result struct {
		Status string `json:"status"`
	}
	if err := c.get(ctx, fmt.Sprintf("/v1/transactions/%s", transactionID), &result); err != nil {
		return "", fmt.Errorf("bank: check transaction: %w", err)
	}
	return result.Status, nil
}

// ─── Internal HTTP helpers ────────────────────────────────────────────────────

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
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(data))
	}

	if out != nil {
		if err := json.Unmarshal(data, out); err != nil {
			return fmt.Errorf("unmarshal response: %w", err)
		}
	}
	return nil
}
