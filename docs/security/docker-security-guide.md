# 🐳 Docker Xavfsizligi Bo'yicha Qo'llanma

## 📋 Mundarija

1. [Kirish](#kirish)
2. [Environment Variables](#environment-variables)
3. [Docker Compose Xavfsizligi](#docker-compose-xavfsizligi)
4. [Dockerfile Xavfsizligi](#dockerfile-xavfsizligi)
5. [Network Xavfsizligi](#network-xavfsizligi)
6. [Monitoring va Logging](#monitoring-va-logging)
7. [Tez-tez So'raladigan Savollar](#tez-tez-soraladigan-savollar)

---

## Kirish

Bu qo'llanma EduStatus loyihasida Docker xavfsizligini ta'minlash uchun yaratilgan. Quyidagi asosiy tamoyillarga amal qilamiz:

### 🎯 Asosiy Tamoyillar

1. **Least Privilege** - Faqat kerakli huquqlarni berish
2. **Defense in Depth** - Ko'p qatlamli himoya
3. **Immutable Infrastructure** - O'zgartirib bo'lmaydigan infrastructure
4. **Zero Trust** - Hech narsaga ishonmaslik, hamma narsani tekshirish

---

## Environment Variables

### ✅ To'g'ri Usul

```yaml
# docker-compose.yml
environment:
  - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  - JWT_SECRET=${JWT_SECRET}
```

```env
# .env fayl (Git'ga qo'shmang!)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-min-32-chars
POSTGRES_DB=edustatus
JWT_SECRET=your-jwt-secret-min-64-chars
```

### ❌ Noto'g'ri Usul

```yaml
# HECH QACHON BUNAQA QILMANG!
environment:
  - POSTGRES_PASSWORD=postgres123
  - JWT_SECRET=secret
```

### 🔐 Parol Yaratish

```bash
# JWT Secret yaratish (64 bayt)
openssl rand -base64 64

# Parol yaratish (32 belgi)
openssl rand -base64 32

# Yoki Node.js orqali
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Docker Compose Xavfsizligi

### 1. Portlarni Cheklash

```yaml
# ✅ To'g'ri - faqat localhost
ports:
  - "127.0.0.1:5432:5432"

# ❌ Noto'g'ri - butun dunyoga ochiq
ports:
  - "5432:5432"
```

### 2. Resurs Limitlari

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

### 3. Security Options

```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true  # Yangi huquqlar olishni taqiqlash
    cap_drop:
      - ALL                      # Barcha capabilities ni olib tashlash
    read_only: true              # Fayl tizimini faqat o'qish uchun
    tmpfs:
      - /tmp                     # Vaqtinchalik fayllar uchun
```

### 4. Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

---

## Dockerfile Xavfsizligi

### 1. Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
COPY --from=builder /app/dist ./dist
# ... qolgan konfiguratsiya
```

**Foydasi:**
- Image hajmi kamayadi
- Dev dependencies yo'q
- Build tools yo'q

### 2. Non-Root User

```dockerfile
# Foydalanuvchi yaratish
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Fayllar egaligini o'zgartirish
COPY --chown=appuser:appgroup . .

# Foydalanuvchini o'zgartirish
USER appuser
```

### 3. Package Version Pinning

```dockerfile
# ✅ To'g'ri - versiya aniq ko'rsatilgan
RUN apk add --no-cache openssl=3.3.2-r0

# ❌ Noto'g'ri - versiya ko'rsatilmagan
RUN apk add --no-cache openssl
```

### 4. Labels

```dockerfile
LABEL maintainer="security@edustatus.uz"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/edustatus/backend"
```

---

## Network Xavfsizligi

### 1. Internal Network

Database faqat backend bilan bog'lanishi uchun:

```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # Internetga chiqish yo'q!

services:
  postgres:
    networks:
      - backend-network  # Faqat internal
  
  backend:
    networks:
      - frontend-network  # Tashqi dunyo
      - backend-network   # Database bilan
```

### 2. Network Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Internet                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend Network (Public)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Backend (Port 3001)                 │    │
│  └─────────────────────┬───────────────────────────┘    │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Network (Internal)                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │           PostgreSQL (Port 5432)                 │    │
│  │         (Internetga chiqish yo'q!)               │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Monitoring va Logging

### 1. Docker Logs

```bash
# Container loglarini ko'rish
docker logs edustatus-backend

# Real-time loglar
docker logs -f edustatus-backend

# Oxirgi 100 qator
docker logs --tail 100 edustatus-backend
```

### 2. Container Status

```bash
# Barcha containerlarni ko'rish
docker ps -a

# Resurslarni ko'rish
docker stats

# Container detallari
docker inspect edustatus-backend
```

### 3. Security Scanning

```bash
# Trivy bilan scan qilish
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image edustatus-backend:latest

# Dockerfile linter
docker run --rm -i hadolint/hadolint < backend/Dockerfile
```

---

## Tez-tez So'raladigan Savollar

### 1. Nega .env faylini Git'ga qo'shmaslik kerak?

**Javob:** .env faylda maxfiy ma'lumotlar (parollar, API kalitlari) saqlanadi. Agar bu fayl Git'ga tushib qolsa, har kim sizning parollaringizni ko'ra oladi.

```bash
# .gitignore ga qo'shing
.env
.env.*
```

### 2. Nega root user ishlatmaslik kerak?

**Javob:** Agar container buzilsa, hujumchi host tizimda root huquqlariga ega bo'lishi mumkin. Non-root user ishlatish xavfni kamaytiradi.

### 3. Nega multi-stage build kerak?

**Javob:** 
- Image hajmi 50-70% gacha kamayadi
- Dev dependencies production'da bo'lmaydi
- Build tools (gcc, make, etc.) yo'q
- Hujum yuzasi kamayadi

### 4. Port qanday himoyalangan?

**Javob:**
```yaml
# Faqat localhost (127.0.0.1) dan kirish mumkin
ports:
  - "127.0.0.1:5432:5432"

# Bu bilan tarmoqdagi boshqa kompyuterlar
# sizning database'ingizga ulana olmaydi
```

### 5. Health check nima uchun kerak?

**Javob:**
- Container ishlamay qolsa, avtomatik qayta ishga tushadi
- Load balancer sog'lom containerlarga yo'naltiradi
- Monitoring tizimi holatni kuzatadi

---

## 📚 Qo'shimcha Resurslar

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [NestJS Security](https://docs.nestjs.com/security/helmet)

---

## 🚨 Xavfsizlik Incident Response

Agar xavfsizlik hodisasi yuz bersa:

1. **Tezkor choralar:**
   ```bash
   # Containerlarni to'xtatish
   docker-compose down
   
   # Tarmoqni ajratish
   docker network disconnect monitoring_edustatus-network edustatus-backend
   ```

2. **Tekshirish:**
   ```bash
   # Loglarni saqlash
   docker logs edustatus-backend > incident-logs.txt
   
   # Container holatini tekshirish
   docker inspect edustatus-backend
   ```

3. **Xabar berish:**
   - security@edustatus.uz
   - Incident Response Team

---

## ✅ Checklist

Loyihani production'ga chiqarishdan oldin:

- [ ] `.env` fayl yaratilgan va to'ldirilgan
- [ ] Barcha parollar kuchli va noyob
- [ ] JWT secret kamida 64 belgi
- [ ] PostgreSQL `scram-sha-256` autentifikatsiya ishlatilgan
- [ ] Portlar faqat localhost'ga ochiq
- [ ] Non-root user ishlatilgan
- [ ] Resurs limitlari qo'yilgan
- [ ] Health checks sozlangan
- [ ] Network segmentatsiya qilingan
- [ ] Security scan o'tkazilgan
- [ ] Backup strategiya mavjud

---

*Oxirgi yangilanish: 2026-02-20*
