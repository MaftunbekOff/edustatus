# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM rust:1.94-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev openssl-libs-static

WORKDIR /build

# Cache dependencies first
COPY Cargo.toml Cargo.lock* ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true
RUN rm -rf src

# Build real source
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs
RUN cargo build --release --locked

# ─── Final Stage ──────────────────────────────────────────────────────────────
FROM alpine:3.21 AS final

RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /build/target/release/rust-core /app/rust-core

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/api/v1/health/live || exit 1

CMD ["/app/rust-core"]
