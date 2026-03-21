// Package retry provides exponential-backoff retry logic and circuit breaker patterns.
package retry

import (
	"context"
	"errors"
	"fmt"
	"math"
	"net/http"
	"sync"
	"time"
)

// Config controls retry behaviour.
type Config struct {
	MaxAttempts  int
	BaseDelay    time.Duration
	MaxDelay     time.Duration
	Multiplier   float64
	Jitter       bool
	RetryOn      func(err error, statusCode int) bool
}

func DefaultConfig() Config {
	return Config{
		MaxAttempts: 3,
		BaseDelay:   500 * time.Millisecond,
		MaxDelay:    10 * time.Second,
		Multiplier:  2.0,
		Jitter:      true,
		RetryOn:     defaultRetryPredicate,
	}
}

func defaultRetryPredicate(err error, statusCode int) bool {
	if err != nil {
		return true
	}
	return statusCode == 429 || statusCode >= 500
}

// Do executes fn with retry logic according to cfg.
func Do(ctx context.Context, cfg Config, fn func() (int, error)) error {
	var lastErr error
	for attempt := 0; attempt < cfg.MaxAttempts; attempt++ {
		if ctx.Err() != nil {
			return fmt.Errorf("context cancelled: %w", ctx.Err())
		}

		code, err := fn()
		if err == nil && (code == 0 || (code >= 200 && code < 300)) {
			return nil
		}

		if !cfg.RetryOn(err, code) {
			if err != nil {
				return err
			}
			return fmt.Errorf("non-retryable status: %d", code)
		}

		lastErr = err
		if err == nil {
			lastErr = fmt.Errorf("HTTP %d", code)
		}

		if attempt < cfg.MaxAttempts-1 {
			delay := backoff(cfg, attempt)
			select {
			case <-ctx.Done():
				return fmt.Errorf("context cancelled during backoff: %w", ctx.Err())
			case <-time.After(delay):
			}
		}
	}
	return fmt.Errorf("all %d attempts failed: %w", cfg.MaxAttempts, lastErr)
}

func backoff(cfg Config, attempt int) time.Duration {
	delay := float64(cfg.BaseDelay) * math.Pow(cfg.Multiplier, float64(attempt))
	if delay > float64(cfg.MaxDelay) {
		delay = float64(cfg.MaxDelay)
	}
	if cfg.Jitter {
		// Add ±25% jitter
		delay = delay * (0.75 + 0.5*pseudoRandom(attempt))
	}
	return time.Duration(delay)
}

func pseudoRandom(seed int) float64 {
	return math.Mod(float64(seed*2654435761), 1.0)
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

type CBState int

const (
	CBClosed CBState = iota
	CBOpen
	CBHalfOpen
)

type CircuitBreaker struct {
	mu           sync.Mutex
	state        CBState
	failures     int
	successes    int
	threshold    int
	resetTimeout time.Duration
	lastOpen     time.Time
}

func NewCircuitBreaker(threshold int, resetTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		threshold:    threshold,
		resetTimeout: resetTimeout,
	}
}

func (cb *CircuitBreaker) Call(fn func() error) error {
	cb.mu.Lock()
	switch cb.state {
	case CBOpen:
		if time.Since(cb.lastOpen) > cb.resetTimeout {
			cb.state = CBHalfOpen
			cb.successes = 0
		} else {
			cb.mu.Unlock()
			return errors.New("circuit breaker open")
		}
	}
	cb.mu.Unlock()

	err := fn()

	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		cb.failures++
		cb.successes = 0
		if cb.state == CBHalfOpen || cb.failures >= cb.threshold {
			cb.state = CBOpen
			cb.lastOpen = time.Now()
		}
		return err
	}

	cb.successes++
	if cb.state == CBHalfOpen && cb.successes >= 2 {
		cb.state = CBClosed
		cb.failures = 0
	}
	return nil
}

// ─── Timeout Middleware ───────────────────────────────────────────────────────

func TimeoutMiddleware(timeout time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), timeout)
			defer cancel()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
