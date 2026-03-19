# EduStatus Backend

NestJS backend API for EduStatus Monitoring System.

## 📁 Module Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
│
├── auth/                   # Authentication Module
│   ├── auth.controller.ts  # Login, me endpoints
│   ├── auth.service.ts     # JWT generation, password validation
│   ├── auth.module.ts      # Module configuration
│   ├── jwt.strategy.ts     # Passport JWT strategy
│   ├── jwt-auth.guard.ts   # Route protection guard
│   └── dto/
│       └── login.dto.ts    # Login request DTO
│
├── colleges/               # Colleges/Organizations Module
│   ├── colleges.controller.ts
│   ├── colleges.service.ts
│   └── colleges.module.ts
│
├── students/               # Students Module
│   ├── students.controller.ts
│   ├── students.service.ts
│   ├── students.module.ts
│   └── dto/
│       ├── create-student.dto.ts
│       └── update-student.dto.ts
│
├── payments/               # Payments Module
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   ├── payments.module.ts
│   └── dto/
│       └── create-payment.dto.ts
│
├── groups/                 # Groups Module
│   ├── groups.controller.ts
│   ├── groups.service.ts
│   └── groups.module.ts
│
├── dashboard/              # Dashboard Statistics Module
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.module.ts
│
├── custom-domains/         # Custom Domains Module
│   ├── custom-domains.controller.ts
│   ├── admin-custom-domains.controller.ts
│   ├── custom-domains.service.ts
│   └── custom-domains.module.ts
│
├── users/                  # Users Module
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
└── prisma/                 # Prisma Module
    ├── prisma.service.ts   # Prisma client singleton
    └── prisma.module.ts
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed test data
npx prisma db seed

# Start development server
npm run start:dev
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Colleges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/colleges` | List all colleges |
| POST | `/api/colleges` | Create new college |
| GET | `/api/colleges/:id` | Get college by ID |
| PATCH | `/api/colleges/:id` | Update college |
| DELETE | `/api/colleges/:id` | Delete college |
| GET | `/api/colleges/:id/stats` | Get college statistics |
| POST | `/api/colleges/:id/tabula-rasa` | Clear college data |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students |
| POST | `/api/students` | Create student |
| GET | `/api/students/:id` | Get student by ID |
| PATCH | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/duplicates` | Find duplicate students |
| GET | `/api/students/debtors` | List debtor students |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Create payment |
| GET | `/api/payments/:id` | Get payment by ID |
| GET | `/api/payments/stats` | Payment statistics |
| POST | `/api/payments/:id/confirm` | Confirm payment |
| POST | `/api/payments/:id/reject` | Reject payment |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | List groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group by ID |
| DELETE | `/api/groups/:id` | Delete group |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

### Custom Domains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/colleges/:collegeId/custom-domains` | List domains |
| POST | `/api/colleges/:collegeId/custom-domains` | Add domain |
| GET | `/api/colleges/:collegeId/custom-domains/:id` | Get domain |
| GET | `/api/colleges/:collegeId/custom-domains/:id/verification` | Get verification info |
| POST | `/api/colleges/:collegeId/custom-domains/:id/verify` | Verify domain |
| PUT | `/api/colleges/:collegeId/custom-domains/:id/primary` | Set as primary |
| DELETE | `/api/colleges/:collegeId/custom-domains/:id` | Delete domain |

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### User Roles

| Role | Description |
|------|-------------|
| `super_admin` | Platform administrator |
| `admin` | College administrator |
| `accountant` | Accountant |
| `student` | Student |
| `parent` | Parent |

## 🗄️ Database

Database schema is defined in `prisma/schema.prisma`.

### Models

- **College** - Educational institution
- **User** - System user
- **Student** - Student record
- **Group** - Student group
- **Payment** - Payment record
- **CustomDomain** - Custom domain for college

### Migrations

```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma db push --force-reset
```

## 📝 Environment Variables

Create `.env` file:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/edustatus?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start development server with watch |
| `npm run start:debug` | Start with debug mode |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |
