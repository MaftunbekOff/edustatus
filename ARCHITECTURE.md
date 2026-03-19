# OrgStatus - Monitoring Tizimi Arxitekturasi

## 📋 Loyiha Haqida

OrgStatus - har qanday tashkilot, firma va muassasalar uchun moliyaviy monitoring tizimi. Tizim mijozlarning to'lovlarini kuzatish, qarzdorlarni boshqarish va hisobotlar yaratish imkonini beradi.

---

## 🏗️ Global-Scale Distributed Database Arxitekturasi

```
🌍 GLOBAL INFRASTRUCTURE (12M Organizations)
├── 10 Global Regions × 5 Shards per Region = 50 Database Shards
└── Geo-distributed across AWS/Azure regions worldwide

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Login     │  │  Dashboard  │  │     Super Admin         │  │
│  │   (Auth)    │  │  (Org)      │  │   (Platform Admin)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                          API Layer                               │
│                    /api/* endpoints                              │
│                HttpOnly Cookies + JWT                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST + RBAC
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS) - Sharded                     │
│                     Global Load Balancer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Shard Mgr  │ │ Query Rtr  │ │ Migration  │ │  Security   │    │
│  │  Service   │ │  Service   │ │  Service   │ │   Guards     │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │   Auth   │ │ Clients  │ │ Payments │ │  Organizations   │   │
│  │  Module  │ │  Module  │ │  Module  │ │     Module       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Departments│ │Dashboard │ │  Users   │ │  Custom Domains  │   │
│  │  Module  │ │  Module  │ │  Module  │ │     Module       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                Intelligent Query Routing                        │
│            Multi-Level Caching (L1-L4) + Auto Sharding         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Organization ID → Shard Mapping
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              DISTRIBUTED POSTGRESQL DATABASE                    │
│                   50 Shards Worldwide                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Shard 00   │  │  Shard 01   │  │  Shard 02   │ ...          │
│  │ US-East-1   │  │ US-West-1   │  │ EU-West-1   │              │
│  │ 240K Orgs   │  │ 240K Orgs   │  │ 240K Orgs   │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │              │
│  │ │ Global  │ │  │ │ Global  │ │  │ │ Global  │ │              │
│  │ │ Schema  │ │  │ │ Schema  │ │  │ │ Schema  │ │              │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │              │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │              │
│  │ │ Org     │ │  │ │ Org     │ │  │ │ Org     │ │              │
│  │ │ Schemas │ │  │ │ Schemas │ │  │ │ Schemas │ │              │
│  │ │ 240K+   │ │  │ │ 240K+   │ │  │ │ 240K+   │ │              │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│   🔒 Security: Row-Level Security + Encryption + Audit Logs      │
│   ⚡ Performance: <100ms P95, 99.99% Availability                 │
│   📊 Scale: 12M Organizations, 60PB+ Data                        │
└─────────────────────────────────────────────────────────────────┘
```

### Arxitektura Komponentlari

#### **1. Shard Manager Service**
- **50 shard**'ni boshqarish (10 region × 5 shard)
- **Organization ID parsing**: `RR-SSSS-OOOOOO` format
- **Connection pooling**: Har shard uchun optimized pool
- **Health monitoring**: Automatic failover

#### **2. Query Router Service**
- **Intelligent routing**: Org ID → Shard mapping
- **Multi-level caching**: L1 (app) → L2 (regional) → L3 (global) → L4 (CDN)
- **SQL optimization**: Dynamic query building
- **Transaction support**: Cross-shard consistency

#### **3. Migration Orchestrator**
- **Zero-downtime migration**: Single DB → Sharded
- **Parallel processing**: 10x concurrent migration
- **Data validation**: Checksum va integrity checks
- **Rollback support**: Failure recovery

#### **4. Security Guards**
- **RBAC implementation**: Role-based access control
- **Organization ownership**: Automatic data isolation
- **Input validation**: DTO-based validation
- **Audit logging**: All operations tracked

---

## 📁 Backend Modullari

### 1. Auth Module (`/backend/src/auth/`)
Foydalanuvchi autentifikatsiyasi va avtorizatsiyasi.

| Fayl | Tavsif |
|------|--------|
| `auth.controller.ts` | Login va token yangilash endpointlari |
| `auth.service.ts` | Parolni tekshirish, JWT token yaratish |
| `jwt.strategy.ts` | JWT token validatsiyasi |
| `jwt-auth.guard.ts` | Himoyalangan routelar uchun guard |

**API Endpoints:**
- `POST /api/auth/login` - Tizimga kirish
- `GET /api/auth/me` - Joriy foydalanuvchi ma'lumotlari

---

### 2. Organizations Module (`/backend/src/organizations/`)
Tashkilotlarni boshqarish (Super Admin uchun).

| Fayl | Tavsif |
|------|--------|
| `organizations.controller.ts` | CRUD operatsiyalari |
| `organizations.service.ts` | Biznes mantiq |

**API Endpoints:**
- `GET /api/organizations` - Barcha tashkilotlar ro'yxati
- `POST /api/organizations` - Yangi tashkilot qo'shish
- `GET /api/organizations/:id` - Tashkilot ma'lumotlari
- `PATCH /api/organizations/:id` - Tashkilot ma'lumotlarini yangilash
- `DELETE /api/organizations/:id` - Tashkilotni o'chirish
- `POST /api/organizations/:id/tabula-rasa` - Tashkilot ma'lumotlarini tozalash

---

### 3. Clients Module (`/backend/src/clients/`)
Mijozlarni boshqarish.

| Fayl | Tavsif |
|------|--------|
| `clients.controller.ts` | CRUD operatsiyalari |
| `clients.service.ts` | Biznes mantiq |
| `dto/create-client.dto.ts` | Yangi mijoz yaratish uchun DTO |
| `dto/update-client.dto.ts` | Mijoz ma'lumotlarini yangilash uchun DTO |

**API Endpoints:**
- `GET /api/clients` - Mijozlar ro'yxati
- `POST /api/clients` - Yangi mijoz qo'shish
- `GET /api/clients/:id` - Mijoz ma'lumotlari
- `PATCH /api/clients/:id` - Mijoz ma'lumotlarini yangilash
- `DELETE /api/clients/:id` - Mijozni o'chirish
- `GET /api/clients/duplicates` - Takroriy mijozlar
- `GET /api/clients/debtors` - Qarzdor mijozlar

---

### 4. Payments Module (`/backend/src/payments/`)
To'lovlarni boshqarish.

| Fayl | Tavsif |
|------|--------|
| `payments.controller.ts` | CRUD operatsiyalari |
| `payments.service.ts` | Biznes mantiq |
| `dto/create-payment.dto.ts` | Yangi to'lov yaratish uchun DTO |

**API Endpoints:**
- `GET /api/payments` - To'lovlar ro'yxati
- `POST /api/payments` - Yangi to'lov qo'shish
- `GET /api/payments/:id` - To'lov ma'lumotlari
- `GET /api/payments/stats` - To'lovlar statistikasi
- `POST /api/payments/:id/confirm` - To'lovni tasdiqlash
- `POST /api/payments/:id/reject` - To'lovni rad etish

---

### 5. Departments Module (`/backend/src/departments/`)
Bo'limlarni boshqarish.

| Fayl | Tavsif |
|------|--------|
| `departments.controller.ts` | CRUD operatsiyalari |
| `departments.service.ts` | Biznes mantiq |

**API Endpoints:**
- `GET /api/departments` - Bo'limlar ro'yxati
- `POST /api/departments` - Yangi bo'lim qo'shish
- `GET /api/departments/:id` - Bo'lim ma'lumotlari
- `DELETE /api/departments/:id` - Bo'limni o'chirish

---

### 6. Dashboard Module (`/backend/src/dashboard/`)
Dashboard statistikasi.

| Fayl | Tavsif |
|------|--------|
| `dashboard.controller.ts` | Statistika endpointlari |
| `dashboard.service.ts` | Statistika hisoblash |

**API Endpoints:**
- `GET /api/dashboard/stats` - Umumiy statistika

---

### 7. Custom Domains Module (`/backend/src/custom-domains/`)
Custom domainlarni boshqarish.

| Fayl | Tavsif |
|------|--------|
| `custom-domains.controller.ts` | Tashkilot uchun domain boshqaruvi |
| `custom-domains.service.ts` | Domain validatsiya va boshqaruv |

**API Endpoints:**
- `GET /api/organizations/:organizationId/custom-domains` - Domainlar ro'yxati
- `POST /api/organizations/:organizationId/custom-domains` - Yangi domain qo'shish
- `GET /api/organizations/:organizationId/custom-domains/:id` - Domain ma'lumotlari
- `POST /api/organizations/:organizationId/custom-domains/:id/verify` - Domainni tasdiqlash
- `DELETE /api/organizations/:organizationId/custom-domains/:id` - Domainni o'chirish

---

### 8. Users Module (`/backend/src/users/`)
Foydalanuvchilarni boshqarish.

| Fayl | Tavsif |
|------|--------|
| `users.controller.ts` | Foydalanuvchilar endpointlari |
| `users.service.ts` | Foydalanuvchilar biznes mantiq |

---

### 9. Prisma Module (`/backend/src/prisma/`)
Database connection va Prisma client.

| Fayl | Tavsif |
|------|--------|
| `prisma.service.ts` | Prisma client singleton |
| `prisma.module.ts` | Prisma module |

---

## 📁 Frontend Tuzilishi

### App Router Tuzilishi (`/frontend/src/app/`)

```
app/
├── (auth)/                    # Autentifikatsiya sahifalari
│   └── login/
│       └── page.tsx           # Login sahifasi
│
├── dashboard/                 # Tashkilot Admin paneli
│   ├── layout.tsx             # Dashboard layout
│   ├── page.tsx               # Asosiy dashboard
│   ├── clients/               # Mijozlar
│   ├── payments/              # To'lovlar
│   ├── debtors/               # Qarzdorlar
│   ├── attendance/            # Davomat
│   ├── contracts/             # Shartnomalar
│   ├── reminders/             # Eslatmalar
│   ├── reports/               # Hisobotlar
│   ├── duplicates/            # Takroriy yozuvlar
│   ├── bank/                  # Bank operatsiyalari
│   └── settings/              # Sozlamalar
│
├── cabinet/                   # Super Admin paneli
│   ├── layout.tsx             # Super Admin layout
│   ├── page.tsx               # Super Admin dashboard
│   ├── organizations/         # Tashkilotlar
│   │   ├── page.tsx           # Tashkilotlar ro'yxati
│   │   └── [id]/              # Tashkilot tafsilotlari
│   ├── subscriptions/         # Obunalar
│   ├── billing/               # Hisob-kitob
│   └── settings/              # Sozlamalar
│
├── client/                    # Mijoz paneli
│   ├── page.tsx               # Mijoz dashboard
│   ├── notifications/         # Bildirishnomalar
│   └── payment/               # To'lovlar
│
├── layout.tsx                 # Root layout
├── page.tsx                   # Bosh sahifa
└── globals.css                # Global stillar
```

### Components Tuzilishi (`/frontend/src/components/`)

```
components/
├── ui/                        # UI komponentlari
│   ├── button.tsx             # Tugma
│   ├── input.tsx              # Input
│   ├── select.tsx             # Select
│   ├── modal.tsx              # Modal oyna
│   ├── table.tsx              # Jadval
│   ├── card.tsx               # Karta
│   ├── badge.tsx              # Badge
│   ├── tabs.tsx               # Tablar
│   ├── dropdown.tsx           # Dropdown
│   ├── pagination.tsx         # Sahifalash
│   ├── date-picker.tsx        # Sana tanlash
│   ├── file-upload.tsx        # Fayl yuklash
│   ├── confirm-dialog.tsx     # Tasdiqlash dialogi
│   ├── empty-state.tsx        # Bo'sh holat
│   ├── skeleton.tsx           # Skeleton loader
│   ├── toast.tsx              # Toast xabarlari
│   ├── avatar.tsx             # Avatar
│   └── offline-indicator.tsx  # Offline ko'rsatkich
│
├── layout/                    # Layout komponentlari
│   ├── header.tsx             # Header
│   ├── sidebar.tsx            # Sidebar
│   ├── super-admin-header.tsx # Super Admin header
│   └── super-admin-sidebar.tsx# Super Admin sidebar
│
├── dashboard/                 # Dashboard komponentlari
│   └── stats-card.tsx         # Statistika kartasi
│
├── clients/                   # Mijozlar komponentlari
│   └── client-form-modal.tsx  # Mijoz formasi
│
├── payments/                  # To'lovlar komponentlari
│   └── payment-form-modal.tsx # To'lov formasi
│
└── providers/                 # Provider komponentlari
    └── toast-provider.tsx     # Toast provider
```

### Lib Tuzilishi (`/frontend/src/lib/`)

```
lib/
├── api.ts                     # API client
├── auth-context.tsx           # Auth context
├── constants/                 # O'zgarmaslar
│   ├── organization.ts        # Tashkilot turlari, statuslar
│   ├── common.ts              # Umumiy constants
│   └── regions.ts             # Viloyat va tumanlar
├── hooks/                     # Custom hooks
│   ├── useOrganizationData.ts # Tashkilot ma'lumotlari
│   └── usePhoneFormat.ts      # Telefon formatlash
└── utils/                     # Utility funksiyalar
    └── organization.ts        # Tashkilot utilitlari
```

---

## 🗄️ Database Schema

### Asosiy Modellar

```prisma
// Tashkilot
model Organization {
  id            String   @id
  name          String
  inn           String   @unique
  type          String   // school, clinic, shop, factory, etc.
  industry      String   // education, medical, retail, etc.
  region        String
  district      String
  plan          String   @default("basic")
  status        String   @default("trial")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  admins         OrganizationAdmin[]
  departments    Department[]
  clients        Client[]
  payments       Payment[]
  customDomains  CustomDomain[]
}

// Foydalanuvchi
model OrganizationAdmin {
  id             String   @id
  email          String   @unique
  password       String
  fullName       String
  role           String   // admin, accountant, manager, operator
  organizationId String
  organization   Organization @relation(...)
}

// Mijoz
model Client {
  id             String   @id
  fullName       String
  phone          String?
  pinfl          String?
  organizationId String
  departmentId   String?
  totalAmount    Float    @default(0)
  paidAmount     Float    @default(0)
  debtAmount     Float    @default(0)
  status         String   @default("active")
  
  organization   Organization @relation(...)
  department     Department?  @relation(...)
  payments       Payment[]
}

// Bo'lim
model Department {
  id             String   @id
  name           String
  organizationId String
  organization   Organization @relation(...)
  clients        Client[]
}

// To'lov
model Payment {
  id             String   @id
  amount         Float
  status         String   // pending, confirmed, rejected
  paymentMethod  String   // bank, cash, click, payme, other
  clientId       String
  organizationId String
  client         Client  @relation(...)
  organization   Organization @relation(...)
}

// Custom Domain
model CustomDomain {
  id             String   @id
  domain         String   @unique
  isVerified     Boolean  @default(false)
  isPrimary      Boolean  @default(false)
  organizationId String
  organization   Organization @relation(...)
}
```

---

## 🔐 Foydalanuvchi Rollari

| Rol | Tavsif | Huquqlar |
|-----|--------|----------|
| `super_admin` | Platform administratori | Barcha tashkilotlarni boshqarish |
| `admin` | Tashkilot administratori | O'z tashkilotini to'liq boshqarish |
| `accountant` | Buxgalter | To'lovlar va hisobotlar |
| `manager` | Menejer | Mijozlar va bo'limlar |
| `client` | Mijoz | O'z ma'lumotlari va to'lovlari |

---

## 🚀 Ishga Tushirish

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Xavfsizlik
**DIQQAT:** Production muhitda test hisoblari ko'rsatilmaydi. Barcha autentifikatsiya HttpOnly cookies orqali amalga oshiriladi. Development muhitida faqat ruxsat berilgan foydalanuvchilar uchun test hisoblari mavjud.

---

## 📡 API Qo'llanma

### Autentifikatsiya

```typescript
// Login - HttpOnly Cookies
POST /api/auth/login
Body: { username: string, password: string }
Response: { user: User, message: string }
Cookies: accessToken, refreshToken (HttpOnly, Secure)

// Joriy foydalanuvchi - Cookie-based
GET /api/auth/me
Cookies: accessToken (automatic)
Response: User

// Logout
POST /api/auth/logout
Response: { message: string }
Action: Clears httpOnly cookies
```

### Mijozlar

```typescript
// Mijozlar ro'yxati
GET /api/clients?organizationId=<id>
Response: Client[]

// Yangi mijoz
POST /api/clients
Body: { fullName, phone, departmentId, organizationId }
Response: Client

// Mijozni yangilash
PATCH /api/clients/:id
Body: { fullName?, phone?, departmentId? }
Response: Client
```

### To'lovlar

```typescript
// To'lovlar ro'yxati
GET /api/payments?organizationId=<id>
Response: Payment[]

// Yangi to'lov
POST /api/payments
Body: { amount, type, clientId, organizationId }
Response: Payment

// To'lovni tasdiqlash
POST /api/payments/:id/confirm
Response: Payment
```

---

## 📝 Qo'shimcha Hujjatlar

- [`CODING_STANDARDS.md`](CODING_STANDARDS.md) - Kod yozish standartlari
- [`docs/api.md`](docs/api.md) - API hujjatlari
- [`docs/database.md`](docs/database.md) - Database hujjatlari

---

## 🔧 Texnologiyalar

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Autentifikatsiya
- **bcrypt** - Parolni hash qilish

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Tip xavfsizlik
- **Tailwind CSS** - Styling
- **React Context** - State management

---

## 📞 Aloqa

Loyiha haqida savollar bo'lsa, GitHub Issues orqali murojaat qiling.
