# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM golang:1.26.1-alpine AS builder

RUN apk add --no-cache ca-certificates git

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w -extldflags=-static" \
    -trimpath -o /go-connectors ./cmd/server

# ─── Final Stage ──────────────────────────────────────────────────────────────
FROM scratch AS final

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /go-connectors /go-connectors

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/go-connectors", "-health-check"]

ENTRYPOINT ["/go-connectors"]
