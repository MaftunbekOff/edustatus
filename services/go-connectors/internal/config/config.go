package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port string

	// Payment providers
	PaymeLogin           string
	PaymeMerchantKey     string
	PaymeWebhookSecret   string // HMAC-SHA256 secret for verifying Payme callbacks
	PaymeTestMode        bool

	// Bank API
	BankAPIURL   string
	BankAPIToken string

	// 1C / ERP
	ERPBaseURL  string
	ERPUsername string
	ERPPassword string

	// Tax / MXIK (Soliqlar Davlat Qo'mitasi)
	TaxAPIURL   string
	TaxAPIToken string
	TaxNDS      float64 // VAT rate, default 0.12

	// E-commerce
	EcomBaseURL   string
	EcomAPIKey    string

	// Internal
	RustCoreURL    string
	InternalSecret string
	HTTPTimeout    time.Duration
	MaxRetries     int
	RetryBackoff   time.Duration
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:       getEnv("PORT", "8090"),
		PaymeLogin:          getEnv("PAYME_LOGIN", ""),
		PaymeMerchantKey:    getEnv("PAYME_MERCHANT_KEY", ""),
		PaymeWebhookSecret:  getEnv("PAYME_WEBHOOK_SECRET", ""),
		PaymeTestMode:       getEnvBool("PAYME_TEST_MODE", true),
		BankAPIURL:          getEnv("BANK_API_URL", ""),
		BankAPIToken:        getEnv("BANK_API_TOKEN", ""),
		ERPBaseURL:          getEnv("ERP_BASE_URL", ""),
		ERPUsername:         getEnv("ERP_USERNAME", ""),
		ERPPassword:         getEnv("ERP_PASSWORD", ""),
		TaxAPIURL:           getEnv("TAX_API_URL", "https://api.soliq.uz"),
		TaxAPIToken:         getEnv("TAX_API_TOKEN", ""),
		TaxNDS:              getEnvFloat("TAX_NDS", 0.12),
		EcomBaseURL:         getEnv("ECOM_BASE_URL", ""),
		EcomAPIKey:          getEnv("ECOM_API_KEY", ""),
		RustCoreURL:         getEnv("RUST_CORE_URL", "http://rust-core:8080"),
		InternalSecret:      getEnv("INTERNAL_SECRET", ""),
		HTTPTimeout:         getEnvDuration("HTTP_TIMEOUT_SECS", 15) * time.Second,
		MaxRetries:          getEnvInt("MAX_RETRIES", 3),
		RetryBackoff:        getEnvDuration("RETRY_BACKOFF_MS", 500) * time.Millisecond,
	}

	if cfg.InternalSecret == "" {
		return nil, fmt.Errorf("INTERNAL_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

func getEnvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}

func getEnvFloat(key string, def float64) float64 {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	f, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return def
	}
	return f
}

func getEnvDuration(key string, def time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return def
	}
	return time.Duration(n)
}
