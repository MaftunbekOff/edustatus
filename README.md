# OrgStatus - Tashkilotlar Monitoring Tizimi

![NestJS](https://img.shields.io/badge/Backend-NestJS-red)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)

## 🎯 Loyiha Haqida

**OrgStatus** - har qanday tashkilot, firma va muassasalar uchun mo'ljallangan moliyaviy monitoring tizimi. Tizim quyidagi imkoniyatlarni beradi:

- 📊 **Dashboard** - Real-time statistika va ko'rsatkichlar
- 👥 **Mijozlar boshqaruvi** - Mijozlarni qo'shish, tahrirlash, guruhlash
- 💰 **To'lovlar monitoringi** - To'lovlarni kuzatish, tasdiqlash, rad etish
- 📋 **Qarzdorlar ro'yxati** - Qarzdor mijozlarni aniqlash
- 🏢 **Ko'p tashkilot qo'llab-quvvatlash** - SaaS modelida ishlash
- 🌐 **Custom domainlar** - Har bir tashkilot o'z domenidan foydalanishi mumkin

---

## 🏢 Qo'llab-quvvatlanadigan Tashkilot Turlari

| Soha | Tashkilot turlari |
|------|-------------------|
| **Ta'lim** | Maktab, Kollej, Litsey, Universitet, O'quv markazi, Bog'cha, Avtomaktab, Sport maktabi |
| **Tibbiyot** | Klinika, Kasalxona, Dorixona, Tish shifokorligi, Diagnostika markazi |
| **Xizmat ko'rsatish** | Go'zallik saloni, Sartaroshxona, Fitnes markazi, Restoran, Kafe, Mehmonxona |
| **Savdo** | Do'kon, Supermarket, Ulgurji savdo, Onlayn do'kon |
| **Ishlab chiqarish** | Zavod, Ustaxona, Nonvoyxona |
| **Moliya** | Bank, Sug'urta, Buxgalteriya |
| **IT** | IT kompaniya, Dasturiy ta'minot, Veb-studiya |
| **Boshqa** | Har qanday boshqa tashkilot |

---

## 🚀 Tez Boshlash

### Talablar

- Node.js 18+
- PostgreSQL 14+
- npm yoki yarn

### O'rnatish

1. **Repository'ni klonlash**
```bash
git clone <repository-url>
cd Monitoring
```

2. **Backend sozlamalari**
```bash
cd backend
cp .env.example .env
# .env faylini tahrirlang - distributed database konfiguratsiyasi
npm install

# Distributed database initialization (50 shards)
npm run init:distributed-db

# Generate Prisma client for global schema
npx prisma generate --schema=prisma/schema.distributed.prisma

npm run start:dev
```

3. **Frontend sozlamalari** (yangi terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Tizimga kirish**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Xavfsizlik
**DIQQAT:** Production muhitda test hisoblari ko'rsatilmaydi. Barcha autentifikatsiya HttpOnly cookies orqali amalga oshiriladi. Development muhitida faqat ruxsat berilgan foydalanuvchilar uchun test hisoblari mavjud.

---

## 📁 Loyiha Tuzilishi

```
Monitoring/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Autentifikatsiya
│   │   ├── organizations/     # Tashkilotlar
│   │   ├── clients/           # Mijozlar
│   │   ├── payments/          # To'lovlar
│   │   ├── departments/       # Bo'limlar
│   │   ├── dashboard/         # Dashboard statistikasi
│   │   ├── custom-domains/    # Custom domainlar
│   │   ├── users/             # Foydalanuvchilar
│   │   └── prisma/            # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Test ma'lumotlar
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router sahifalari
│   │   │   ├── (auth)/        # Login
│   │   │   ├── dashboard/     # Tashkilot Admin
│   │   │   ├── cabinet/       # Super Admin
│   │   │   ├── client/        # Mijoz
│   │   │   └── parent/        # Vasiy
│   │   ├── components/        # React komponentlari
│   │   │   ├── ui/            # UI komponentlari
│   │   │   ├── layout/        # Layout komponentlari
│   │   │   ├── dashboard/     # Dashboard komponentlari
│   │   │   ├── clients/       # Mijoz komponentlari
│   │   │   └── payments/      # To'lov komponentlari
│   │   ├── lib/               # Utility va API
│   │   └── types/             # TypeScript tiplari
│   └── package.json
│
├── docs/                       # Hujjatlar
│   ├── api.md                 # API hujjatlari
│   ├── database.md            # Database hujjatlari
│   └── security/              # Xavfsizlik hujjatlari
│
├── ARCHITECTURE.md             # Batafsil arxitektura
└── README.md                   # Bu fayl
```

---

## 🔐 Xavfsizlik va Arxitektura

### Enterprise Security Features
- **HttpOnly Cookies**: XSS attack'lardan himoya
- **RBAC (Role-Based Access Control)**: Qat'iy ruxsatlar tizimi
- **Organization Isolation**: Har tashkilot ma'lumotlari izolyatsiya
- **Input Validation**: DTO-based validation barcha API'larda
- **Audit Logging**: Barcha operatsiyalar log qilinadi
- **Rate Limiting**: DDoS attack'lardan himoya

### Global-Scale Architecture
- **50 Database Shards**: 10 region × 5 shard worldwide
- **12M Organizations**: Bitta platformada cheksiz scaling
- **<100ms P95 Latency**: Global performance
- **99.99% Availability**: Enterprise SLA
- **60PB+ Data**: Distributed storage
- **Zero-Downtime Migration**: Live system updates

### Foydalanuvchi Rollari

| Rol | Tavsif | Ruxsatlar |
|-----|--------|-----------|
| `super_admin` | Platform administratori | Barcha tashkilotlarni boshqarish, system konfiguratsiyasi |
| `admin` | Tashkilot administratori | O'z tashkilotini to'liq boshqarish, admin qo'shish |
| `accountant` | Buxgalter | To'lovlar, hisobotlar, moliyaviy operatsiyalar |
| `manager` | Menejer | Mijozlar va bo'limlarni boshqarish |
| `operator` | Operator | Asosiy CRUD operatsiyalar |
| `client` | Mijoz | O'z ma'lumotlari va to'lovlariga kirish |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` - Tizimga kirish
- `GET /api/auth/me` - Joriy foydalanuvchi

### Organizations (Super Admin)
- `GET /api/organizations` - Tashkilotlar ro'yxati
- `POST /api/organizations` - Yangi tashkilot
- `GET /api/organizations/:id` - Tashkilot ma'lumotlari
- `PATCH /api/organizations/:id` - Tashkilotni yangilash
- `DELETE /api/organizations/:id` - Tashkilotni o'chirish

### Clients
- `GET /api/clients` - Mijozlar ro'yxati
- `POST /api/clients` - Yangi mijoz
- `GET /api/clients/:id` - Mijoz ma'lumotlari
- `PATCH /api/clients/:id` - Mijozni yangilash
- `GET /api/clients/duplicates` - Takroriy mijozlar
- `GET /api/clients/debtors` - Qarzdorlar

### Payments
- `GET /api/payments` - To'lovlar ro'yxati
- `POST /api/payments` - Yangi to'lov
- `POST /api/payments/:id/confirm` - Tasdiqlash
- `POST /api/payments/:id/reject` - Rad etish

Batafsil API hujjat: [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 🛠️ Texnologiyalar

### Backend
- **NestJS** - Enterprise Node.js framework
- **Distributed PostgreSQL** - 50 shards worldwide
- **Prisma ORM** - Multi-schema database management
- **HttpOnly Cookies + JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Redis Cluster** - Multi-level caching (L1-L4)
- **RBAC Guards** - Role-based access control
- **DTO Validation** - class-validator integration
- **Audit Logging** - Comprehensive security logging

### Distributed Architecture
- **50 Database Shards** - Geo-distributed PostgreSQL
- **Intelligent Query Router** - Automatic shard routing
- **Migration Orchestrator** - Zero-downtime migrations
- **Global Load Balancer** - Traffic distribution
- **Multi-Region Replication** - Disaster recovery

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Cookie-based Auth** - XSS protection
- **Session Storage** - Secure user data storage

### Security & Compliance
- **ISO 27001** - Information security management
- **GDPR** - Data protection compliance
- **PCI DSS** - Payment data security
- **Row-Level Security** - PostgreSQL RLS
- **Field Encryption** - Sensitive data protection

---

## 📖 Batafsil Hujjatlar

- [`ARCHITECTURE.md`](ARCHITECTURE.md) - Tizim arxitekturasi va modullar
- [`CODING_STANDARDS.md`](CODING_STANDARDS.md) - Kod yozish standartlari
- [`docs/api.md`](docs/api.md) - API hujjatlari
- [`docs/database.md`](docs/database.md) - Database hujjatlari

---

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Development mode
npm run build        # Production build
npm run test         # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production server
```

### Distributed Database
```bash
cd backend

# Initialize 50 database shards worldwide
npm run init:distributed-db

# Deploy global schema to all shards
npm run db:deploy:global

# Run data migration (single DB → sharded)
npm run migration:start

# Health check all shards
npm run health:shards

# Monitor migration progress
npm run migration:status
```

---

## 📝 Litsenziya

Bu loyiha xususiy va faqat ta'lim maqsadlarida ishlatiladi.

---

## 👥 Mualliflar

OrgStatus Development Team
