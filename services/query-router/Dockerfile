# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o query-router .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the binary
COPY --from=builder /app/query-router .

# Expose port
EXPOSE 8080

# Run
CMD ["./query-router"]