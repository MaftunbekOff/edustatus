// Package ecommerce provides a unified connector for e-commerce platform integrations
// (custom REST adapter pattern — works with Shopify-style, WooCommerce-style APIs).
package ecommerce

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Platform string

const (
	PlatformCustom     Platform = "custom"
	PlatformShopify    Platform = "shopify"
	PlatformWooCommerce Platform = "woocommerce"
)

type Connector struct {
	baseURL    string
	apiKey     string
	platform   Platform
	httpClient *http.Client
}

func New(baseURL, apiKey string, platform Platform, timeout time.Duration) *Connector {
	return &Connector{
		baseURL:  baseURL,
		apiKey:   apiKey,
		platform: platform,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// ─── Domain types ─────────────────────────────────────────────────────────────

type Order struct {
	ID          string    `json:"id"`
	ExternalID  string    `json:"external_id"`
	Status      string    `json:"status"`
	CustomerID  string    `json:"customer_id"`
	Email       string    `json:"email"`
	TotalAmount float64   `json:"total_amount"`
	Currency    string    `json:"currency"`
	Items       []OrderItem `json:"items"`
	ShippingAddr Address  `json:"shipping_address"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type OrderItem struct {
	ProductID string  `json:"product_id"`
	SKU       string  `json:"sku"`
	Name      string  `json:"name"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Discount  float64 `json:"discount"`
}

type Address struct {
	Name    string `json:"name"`
	Line1   string `json:"line1"`
	Line2   string `json:"line2"`
	City    string `json:"city"`
	Region  string `json:"region"`
	Country string `json:"country"`
	Zip     string `json:"zip"`
	Phone   string `json:"phone"`
}

type Product struct {
	ID          string    `json:"id"`
	SKU         string    `json:"sku"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	Currency    string    `json:"currency"`
	Images      []string  `json:"images"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type FulfillmentRequest struct {
	OrderID        string `json:"order_id"`
	TrackingNumber string `json:"tracking_number"`
	Carrier        string `json:"carrier"`
	Status         string `json:"status"` // "shipped" | "delivered" | "returned"
}

type SyncResult struct {
	OrdersSynced   int `json:"orders_synced"`
	ProductsSynced int `json:"products_synced"`
	Errors         int `json:"errors"`
}

// ─── API Methods ──────────────────────────────────────────────────────────────

// GetOrder fetches a single order by external ID.
func (c *Connector) GetOrder(ctx context.Context, orderID string) (*Order, error) {
	var order Order
	if err := c.get(ctx, fmt.Sprintf("/api/orders/%s", orderID), &order); err != nil {
		return nil, fmt.Errorf("ecommerce: get order: %w", err)
	}
	return &order, nil
}

// ListOrders returns orders since a specific time.
func (c *Connector) ListOrders(ctx context.Context, since time.Time, limit int) ([]Order, error) {
	path := fmt.Sprintf("/api/orders?since=%s&limit=%d", since.Format(time.RFC3339), limit)
	var orders []Order
	if err := c.get(ctx, path, &orders); err != nil {
		return nil, fmt.Errorf("ecommerce: list orders: %w", err)
	}
	return orders, nil
}

// UpdateInventory updates stock count for a product SKU.
func (c *Connector) UpdateInventory(ctx context.Context, sku string, quantity int) error {
	body := map[string]any{"sku": sku, "quantity": quantity}
	if err := c.post(ctx, "/api/inventory", body, nil); err != nil {
		return fmt.Errorf("ecommerce: update inventory: %w", err)
	}
	return nil
}

// FulfillOrder marks an order as fulfilled with tracking info.
func (c *Connector) FulfillOrder(ctx context.Context, req FulfillmentRequest) error {
	if err := c.post(ctx, fmt.Sprintf("/api/orders/%s/fulfill", req.OrderID), req, nil); err != nil {
		return fmt.Errorf("ecommerce: fulfill order: %w", err)
	}
	return nil
}

// GetProduct fetches product details by SKU.
func (c *Connector) GetProduct(ctx context.Context, sku string) (*Product, error) {
	var product Product
	if err := c.get(ctx, fmt.Sprintf("/api/products/%s", sku), &product); err != nil {
		return nil, fmt.Errorf("ecommerce: get product: %w", err)
	}
	return &product, nil
}

// SyncCatalog pulls the product catalog and syncs it.
func (c *Connector) SyncCatalog(ctx context.Context) (*SyncResult, error) {
	var result SyncResult
	if err := c.post(ctx, "/api/sync/catalog", nil, &result); err != nil {
		return nil, fmt.Errorf("ecommerce: sync catalog: %w", err)
	}
	return &result, nil
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
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		bodyReader = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bodyReader)
	if err != nil {
		return err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return c.do(req, out)
}

func (c *Connector) do(req *http.Request, out any) error {
	req.Header.Set("X-API-Key", c.apiKey)
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
