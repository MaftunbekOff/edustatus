#!/bin/sh
# ===========================================
# EduStatus Backend Docker Entrypoint
# ===========================================
# This script runs on container startup
# Handles migrations, seeding, and server start
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Function to handle graceful shutdown
shutdown_handler() {
    log_info "Received shutdown signal, stopping gracefully..."
    # Add cleanup logic here if needed
    exit 0
}

# Register signal handlers
trap shutdown_handler SIGTERM SIGINT

# Check required environment variables
log_info "Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL is not set!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    log_error "JWT_SECRET is not set!"
    exit 1
fi

log_info "Environment variables OK"

# Wait for database to be ready
log_info "Waiting for database connection..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    # Use a simple TCP connection test instead of prisma db pull
    if nc -z postgres 5432 2>/dev/null; then
        log_info "Database connection established"
        break
    fi
    
    retry_count=$((retry_count + 1))
    log_warn "Database not ready, retry $retry_count/$max_retries..."
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    log_error "Could not connect to database after $max_retries retries"
    exit 1
fi

# Run Prisma migrations
log_info "Running Prisma migrations..."
if npx prisma migrate deploy --schema=/app/prisma/schema.prisma; then
    log_info "Migrations completed successfully"
else
    log_error "Migration failed!"
    exit 1
fi

# Run Prisma seed (only if database is empty or seed is needed)
log_info "Running Prisma seed..."
if npx prisma db seed --schema=/app/prisma/schema.prisma; then
    log_info "Seed completed successfully"
else
    log_warn "Seed skipped or failed (this may be normal if already seeded)"
fi

# Prisma Client is already generated during build, skip in production
log_info "Prisma Client ready (pre-generated during build)"

# Display startup information
log_info "=========================================="
log_info "EduStatus Backend Starting"
log_info "Node Environment: ${NODE_ENV:-development}"
log_info "Port: ${PORT:-3001}"
log_info "=========================================="

# Start the NestJS server
# Using exec to replace the shell with node process (proper signal handling)
log_info "Starting NestJS server..."
exec npm run start:prod
