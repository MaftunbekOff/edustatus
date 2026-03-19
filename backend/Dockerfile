# ===========================================
# EduStatus Backend Dockerfile
# Multi-stage build for security and size
# ===========================================

# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:24.14.0-alpine AS builder

# Labels for tracking
LABEL stage="builder"

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    openssl \
    && rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev && \
    npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build && \
    # Verify build output
    ls -la dist/

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:24.14.0-alpine AS production

# Metadata labels
LABEL maintainer="security@edustatus.uz"
LABEL version="1.0.0"
LABEL description="EduStatus Backend API"
LABEL org.opencontainers.image.title="EduStatus Backend"
LABEL org.opencontainers.image.description="Educational institution management system backend"
LABEL org.opencontainers.image.vendor="EduStatus"
LABEL org.opencontainers.image.source="https://github.com/edustatus/backend"

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    openssl \
    dumb-init \
    wget \
    netcat-openbsd \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup -h /app

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=appuser:appgroup docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /tmp && \
    chown -R appuser:appgroup /app/logs /tmp

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Use dumb-init to handle signals properly (PID 1 zombie reaping)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/docker-entrypoint.sh"]
