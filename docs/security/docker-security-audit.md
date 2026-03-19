# 🔒 Docker Security Audit Report

## 📋 Hujjat Ma'lumotlari

| Maydon | Qiymat |
|--------|--------|
| Hujjat nomi | Docker Security Audit |
| Sana | 2026-02-20 |
| Tekshiruvchi | Security Team |
| Status | 🔴 CRITICAL ISSUES FOUND |

---

## 📊 Executive Summary

| Daraja | Soni |
|--------|------|
| 🔴 CRITICAL | 4 |
| 🟠 HIGH | 5 |
| 🟡 MEDIUM | 4 |
| 🟢 LOW | 4 |

**Umumiy baholash:** Docker konfiguratsiyasida jiddiy xavfsizlik muammolari mavjud. Production muhitida foydalanishdan oldin tuzatish kerak.

---

## 🔴 CRITICAL Issues

### 1. Hardcoded Credentials in docker-compose.yml

**Fayl:** [`docker-compose.yml`](docker-compose.yml:6-9)

```yaml
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres  # ❌ CRITICAL: Hardcoded password
  POSTGRES_DB: edustatus
```

**Xavf:** Parollar kodda ochiq ko'rsatilgan. Git repositoryga tushib qolsa, hech kim bilmasdan parollarni olishi mumkin.

**Yechim:**
```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB}
```

`.env` fayl yarating (Git'ga qo'shmang):
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=edustatus
```

---

### 2. PostgreSQL Trust Authentication

**Fayl:** [`docker-compose.yml`](docker-compose.yml:10-11)

```yaml
POSTGRES_HOST_AUTH_METHOD: trust
POSTGRES_INITDB_ARGS: "--auth=trust"
```

**Xavf:** `trust` autentifikatsiyasi har qanday foydalanuvchiga parolsiz ulanishga ruxsat beradi. Bu JUD XAVFLI!

**Yechim:**
```yaml
# Olib tashlang:
# POSTGRES_HOST_AUTH_METHOD: trust
# POSTGRES_INITDB_ARGS: "--auth=trust"

# O'rniga:
POSTGRES_HOST_AUTH_METHOD: scram-sha-256
```

---

### 3. Hardcoded JWT Secret

**Fayl:** [`docker-compose.yml`](docker-compose.yml:35)

```yaml
JWT_SECRET: your-super-secret-jwt-key-change-in-production
```

**Xavf:** JWT secret ochiq ko'rsatilgan. Hujumchi bu secret orqali har qanday token yaratishi mumkin.

**Yechim:**
```yaml
JWT_SECRET: ${JWT_SECRET}
```

Generate strong secret:
```bash
openssl rand -base64 64
```

---

### 4. Hardcoded Super Admin Credentials

**Fayl:** [`docker-compose.yml`](docker-compose.yml:39-40)

```yaml
SUPER_ADMIN_EMAIL: admin@edustatus.uz
SUPER_ADMIN_PASSWORD: Admin123!
```

**Xavf:** Super admin paroli kodda ochiq ko'rsatilgan.

**Yechim:**
```yaml
SUPER_ADMIN_EMAIL: ${SUPER_ADMIN_EMAIL}
SUPER_ADMIN_PASSWORD: ${SUPER_ADMIN_PASSWORD}
```

---

## 🟠 HIGH Issues

### 5. Ports Exposed to Host

**Fayl:** [`docker-compose.yml`](docker-compose.yml:12-13)

```yaml
ports:
  - "5432:5432"  # PostgreSQL
```

**Xavf:** PostgreSQL porti butun tizimga ochiq. Faqat Docker network ichida bo'lishi kerak.

**Yechim:**
```yaml
# Agar faqat Docker ichida kerak bo'lsa:
expose:
  - "5432"

# Agar tashqaridan kerak bo'lsa, faqat localhost:
ports:
  - "127.0.0.1:5432:5432"
```

---

### 6. No Resource Limits

**Fayl:** [`docker-compose.yml`](docker-compose.yml:25-45)

**Xavf:** Containerlar uchun resurs limitlari yo'q. DoS hujumi xavfi mavjud.

**Yechim:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

### 7. Running as Root in Container

**Fayl:** [`backend/Dockerfile`](backend/Dockerfile:1-35)

**Xavf:** Container root user sifatida ishlaydi. Bu xavfsizlik riski.

**Yechim:**
```dockerfile
# Dockerfile oxiriga qo'shing:
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# ownership o'zgartiring
RUN chown -R appuser:appgroup /app

# user o'zgartiring
USER appuser
```

---

### 8. No Health Check for Backend

**Fayl:** [`docker-compose.yml`](docker-compose.yml:25-45)

**Xavf:** Backend uchun health check yo'q. Container ishlamay qolsa, avtomatik qayta ishga tushmaydi.

**Yechim:**
```yaml
backend:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

---

### 9. No Network Segmentation

**Fayl:** [`docker-compose.yml`](docker-compose.yml:47-49)

**Xavf:** Barcha servicelar bitta networkda. Database va application ajratilishi kerak.

**Yechim:**
```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # Internetga chiqish yo'q

services:
  postgres:
    networks:
      - backend-network
  
  backend:
    networks:
      - frontend-network
      - backend-network
```

---

## 🟡 MEDIUM Issues

### 10. No Multi-stage Build

**Fayl:** [`backend/Dockerfile`](backend/Dockerfile:1-35)

**Xavf:** Single-stage build ishlatilgan. Image katta va dev dependencies bor.

**Yechim:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

---

### 11. Missing .dockerignore Entries

**Fayl:** [`backend/.dockerignore`](backend/.dockerignore:1-5)

**Xavf:** Ba'zi keraksiz fayllar imagega tushib qolishi mumkin.

**Yechim:**
```
node_modules
dist
.env
.env.*
*.log
.DS_Store
.git
.gitignore
README.md
.vscode
coverage
.nyc_output
*.md
!prisma/README.md
```

---

### 12. No Read-only Root Filesystem

**Xavf:** Container filesystemga yozish mumkin. Hujumchi fayllarni o'zgartirishi mumkin.

**Yechim:**
```yaml
backend:
  read_only: true
  tmpfs:
    - /tmp
    - /app/logs
```

---

### 13. No Security Options

**Xavf:** Container uchun security options yo'q.

**Yechim:**
```yaml
backend:
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE
```

---

## 🟢 LOW Issues

### 14. Hadolint Warnings

**Fayl:** [`backend/Dockerfile`](backend/Dockerfile:7)

```
DL3018 warning: Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`
DL3059 info: Multiple consecutive `RUN` instructions. Consider consolidation.
```

**Yechim:**
```dockerfile
# Pin OpenSSL version
RUN apk add --no-cache openssl=3.1.4-r0

# Consolidate RUN instructions
RUN npm install && \
    npx prisma generate
```

---

### 15. No Image Pinning with Digest

**Fayl:** [`backend/Dockerfile`](backend/Dockerfile:2)

```dockerfile
FROM node:20-alpine
```

**Xavf:** Image versiyasi aniq emas. Yangi image chiqsa, build buzilishi mumkin.

**Yechim:**
```dockerfile
FROM node:20-alpine@sha256:abc123...
```

---

### 16. Missing Labels

**Xavf:** Docker image uchun metadata/labels yo'q.

**Yechim:**
```dockerfile
LABEL maintainer="security@edustatus.uz"
LABEL version="1.0"
LABEL description="EduStatus Backend API"
LABEL org.opencontainers.image.source="https://github.com/edustatus/backend"
```

---

### 17. Entrypoint Script Error Handling

**Fayl:** [`backend/docker-entrypoint.sh`](backend/docker-entrypoint.sh:1-10)

**Xavf:** Scriptda error handling yo'q.

**Yechim:**
```bash
#!/bin/sh
set -e  # Exit on error

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running Prisma seed..."
npx prisma db seed

echo "Starting NestJS server..."
exec npm run start:prod  # exec ishlatish
```

---

## ✅ Tavsiya Etilgan docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: edustatus-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_HOST_AUTH_METHOD: scram-sha-256
    expose:
      - "5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    security_opt:
      - no-new-privileges:true
    read_only: false  # PostgreSQL needs write access

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edustatus-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3001"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
      - PORT=3001
      - FRONTEND_URL=${FRONTEND_URL}
      - SUPER_ADMIN_EMAIL=${SUPER_ADMIN_EMAIL}
      - SUPER_ADMIN_PASSWORD=${SUPER_ADMIN_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - frontend-network
      - backend-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    read_only: true
    tmpfs:
      - /tmp

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true

volumes:
  postgres_data:
```

---

## ✅ Tavsiya Etilgan Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Labels
LABEL maintainer="security@edustatus.uz"
LABEL version="1.0"
LABEL description="EduStatus Backend API"

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl dumb-init

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy from builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Copy entrypoint
COPY --chown=appuser:appgroup docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
```

---

## ✅ Tavsiya Etilgan .env.example

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here-min-32-chars
POSTGRES_DB=edustatus

# JWT
JWT_SECRET=your-jwt-secret-min-64-chars-use-openssl-rand-base64-64

# Application
FRONTEND_URL=https://your-domain.com

# Super Admin
SUPER_ADMIN_EMAIL=admin@your-domain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
```

---

## 📋 Action Items

### Birinchi Ustuvorlik (1 hafta)
- [ ] `.env` fayl yaratish va environment variables ishlatish
- [ ] PostgreSQL trust authentication o'zgartirish
- [ ] JWT secret va admin parollarini o'zgartirish
- [ ] `.env` faylni `.gitignore` ga qo'shish

### Ikkinchi Ustuvorlik (2 hafta)
- [ ] Non-root user ishlatish Dockerfile'da
- [ ] Multi-stage build qo'shish
- [ ] Resource limits qo'shish
- [ ] Health checks qo'shish

### Uchinchi Ustuvorlik (1 oy)
- [ ] Network segmentation
- [ ] Read-only filesystem
- [ ] Security options
- [ ] Docker image scanning (Trivy, Snyk)

---

## 🔧 Docker Security Scanning Tools

```bash
# Trivy - vulnerability scanner
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image edustatus-backend:latest

# Docker Bench Security
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --net=host docker/docker-bench-security

# Hadolint - Dockerfile linter
docker run --rm -i hadolint/hadolint < backend/Dockerfile
```

---

## 📚 References

1. [Docker Security Best Practices](https://docs.docker.com/engine/security/)
2. [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
3. [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
4. [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## Imzolar

| Lavozim | Ism | Imzo | Sana |
|---------|-----|------|------|
| Security Auditor | | | |
| DevOps Engineer | | | |
| Tech Lead | | | |
