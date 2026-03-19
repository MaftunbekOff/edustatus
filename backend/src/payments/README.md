# 💰 Payments Moduli

## 📋 Umumiy Ma'lumot

Payments moduli to'lovlarni boshqarish, tasdiqlash, rad etish va statistika uchun mas'ul.

## 📁 Fayl Tuzilishi

```
payments/
├── payments.module.ts       # Modul konfiguratsiyasi
├── payments.controller.ts   # API endpointlar
├── payments.service.ts      # Biznes mantiq
└── dto/
    └── create-payment.dto.ts  # Yangi to'lov DTO
```

## 🔌 API Endpointlar

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/payments` | To'lovlar ro'yxati |
| POST | `/api/payments` | Yangi to'lov qo'shish |
| GET | `/api/payments/:id` | Bitta to'lov |
| POST | `/api/payments/:id/confirm` | To'lovni tasdiqlash |
| POST | `/api/payments/:id/reject` | To'lovni rad etish |
| GET | `/api/payments/stats` | To'lovlar statistikasi |

## 📝 Kod Tahlili

### payments.service.ts

```typescript
@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // Yangi to'lov yaratish (TRANSACTION)
  async create(collegeId: string, dto: CreatePaymentDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. To'lov yaratish
      const payment = await tx.payment.create({ ... });
      
      // 2. Talaba hisobini yangilash
      await tx.student.update({
        where: { id: studentId },
        data: {
          paidAmount: { increment: amount },
          debtAmount: { decrement: amount },
        },
      });
      
      return payment;
    });
  }

  // To'lovni tasdiqlash
  async confirm(collegeId: string, id: string, userId: string) {
    // status = 'confirmed'
    // confirmedAt = now()
    // confirmedBy = userId
  }

  // To'lovni rad etish (TRANSACTION)
  async reject(collegeId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. To'lov statusini o'zgartirish
      await tx.payment.update({ status: 'rejected' });
      
      // 2. Talaba hisobini qaytarish
      await tx.student.update({
        paidAmount: { decrement: amount },
        debtAmount: { increment: amount },
      });
    });
  }

  // Statistika
  async getStats(collegeId: string) {
    // Bugungi to'lovlar
    // Oylik to'lovlar
  }
}
```

### DTO

#### CreatePaymentDto
```typescript
class CreatePaymentDto {
  studentId: string;       // Talaba ID
  amount: number;          // Summa
  paymentMethod: string;   // bank, cash, click, payme, other
  paymentDate: string;     // To'lov sanasi
  description?: string;    // Izoh
}
```

## 🔄 To'lov Jarayoni

### To'lov Statuslari

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT STATUS FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────┐                              │
│                    │   pending   │                              │
│                    └──────┬──────┘                              │
│                           │                                      │
│              ┌────────────┼────────────┐                        │
│              │            │            │                        │
│              ▼            ▼            ▼                        │
│       ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│       │ confirmed │ │ rejected  │ │ cancelled │                │
│       └───────────┘ └───────────┘ └───────────┘                │
│                                                                  │
│  pending   - Kutilmoqda                                         │
│  confirmed - Tasdiqlangan (talaba hisobi yangilandi)           │
│  rejected  - Rad etilgan (talaba hisobi qaytarildi)            │
│  cancelled - Bekor qilingan                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Transaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Talaba mavjudligini tekshirish                             │
│     │                                                            │
│     ▼                                                            │
│  2. TRANSACTION BOSHLASH                                        │
│     │                                                            │
│     ├─── a) Payment yaratish (status: pending)                  │
│     │                                                            │
│     └─── b) Student yangilash                                   │
│           paidAmount += amount                                  │
│           debtAmount -= amount                                  │
│     │                                                            │
│     ▼                                                            │
│  3. TRANSACTION YAKUNLASH                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Reject Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REJECT PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. To'lov ma'lumotlarini olish                                │
│     │                                                            │
│     ▼                                                            │
│  2. TRANSACTION BOSHLASH                                        │
│     │                                                            │
│     ├─── a) Payment status = 'rejected'                         │
│     │                                                            │
│     └─── b) Student hisobini qaytarish                         │
│           paidAmount -= amount                                  │
│           debtAmount += amount                                  │
│     │                                                            │
│     ▼                                                            │
│  3. TRANSACTION YAKUNLASH                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Ma'lumotlar Modeli

```
┌─────────────────────────────────────────────────────────────────┐
│                          PAYMENT                                 │
├─────────────────────────────────────────────────────────────────┤
│  id              │ String        │ Unikal ID                    │
│  collegeId       │ String (FK)   │ Kollej ID                    │
│  studentId       │ String (FK)   │ Talaba ID                    │
│  amount          │ Float         │ Summa                        │
│  currency        │ String        │ Valyuta (UZS)                │
│  paymentMethod   │ String        │ bank/cash/click/payme/other  │
│  status          │ String        │ pending/confirmed/rejected   │
│  transactionId   │ String?       │ Bank tranzaksiya ID          │
│  referenceNumber │ String?       │ Reference raqam              │
│  paymentDate     │ DateTime      │ To'lov sanasi                │
│  confirmedAt     │ DateTime?     │ Tasdiqlangan vaqt            │
│  confirmedBy     │ String?       │ Tasdiqlagan user ID          │
│  description     │ String?       │ Izoh                         │
│  reconciled      │ Boolean       │ Bank bilan solishtirilgan    │
└─────────────────────────────────────────────────────────────────┘
```

## 💳 To'lov Usullari

| Usul | Tavsif |
|------|--------|
| `bank` | Bank o'tkazmasi |
| `cash` | Naqd pul |
| `click` | Click tizimi |
| `payme` | Payme tizimi |
| `other` | Boshqa |

## 📈 Statistika

### getStats() Metodi

```typescript
{
  todayAmount: number,   // Bugungi to'lovlar summasi
  todayCount: number,    // Bugungi to'lovlar soni
  monthlyAmount: number, // Oylik to'lovlar summasi
}
```

### Hisoblash

```typescript
// Bugun
const today = new Date();
today.setHours(0, 0, 0, 0);

// Oy boshi
const monthStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

// Aggregatsiya
await this.prisma.payment.aggregate({
  where: {
    collegeId,
    paymentDate: { gte: today },
    status: 'confirmed',
  },
  _sum: { amount: true },
  _count: true,
});
```

## 🔗 Bog'liq Modullar

| Modul | Aloqa |
|-------|-------|
| **Students** | Talaba hisobini yangilash |
| **Bank Records** | Bank bilan solishtirish |
| **Dashboard** | Statistika |

## 🛡️ Huquqlar

| Rol | Create | Confirm | Reject | View |
|-----|--------|---------|--------|------|
| super_admin | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |
| accountant | ✅ | ✅ | ✅ | ✅ |
| operator | ✅ | ❌ | ❌ | ✅ |

## ⚠️ Muhim Eslatmalar

### 1. Transaction Muhim

To'lov yaratish va rad etish **transaction** ichida amalga oshirilishi kerak. Aks holda, ma'lumotlar nomutanosib bo'lishi mumkin.

```typescript
// TO'G'RI ✅
await this.prisma.$transaction(async (tx) => {
  await tx.payment.create({ ... });
  await tx.student.update({ ... });
});

// NOTO'G'RI ❌
await this.prisma.payment.create({ ... });
await this.prisma.student.update({ ... }); // Xatolik bo'lsa, nomutanosiblik!
```

### 2. Status O'zgartirish

Faqat `pending` statusidagi to'lovlarni tasdiqlash yoki rad etish mumkin.

### 3. Filterlar

```typescript
// Sana bo'yicha filter
if (filters.dateFrom || filters.dateTo) {
  where.paymentDate = {};
  if (filters.dateFrom) {
    where.paymentDate.gte = new Date(filters.dateFrom);
  }
  if (filters.dateTo) {
    where.paymentDate.lte = new Date(filters.dateTo);
  }
}
```

## 📌 Foydalanish Misollari

### Yangi To'lov Qo'shish

```typescript
const payment = await paymentsApi.create(token, {
  studentId: 'clx123',
  amount: 500000,
  paymentMethod: 'bank',
  paymentDate: '2024-01-20',
  description: 'Yanvar oyi to\'lovi'
});

// Talaba hisobi avtomatik yangilanadi:
// paidAmount += 500000
// debtAmount -= 500000
```

### To'lovni Tasdiqlash

```typescript
await paymentsApi.confirm(token, paymentId);

// Payment:
// status = 'confirmed'
// confirmedAt = now()
// confirmedBy = currentUserId
```

### To'lovni Rad Etish

```typescript
await paymentsApi.reject(token, paymentId);

// Payment:
// status = 'rejected'

// Student:
// paidAmount -= amount
// debtAmount += amount
```

### Statistika Olish

```typescript
const stats = await paymentsApi.getStats(token, collegeId);

// {
//   todayAmount: 5000000,
//   todayCount: 12,
//   monthlyAmount: 150000000
// }
```

## 🔍 Qidirish va Filter

```typescript
// Barcha to'lovlar
const payments = await paymentsApi.getAll(token, collegeId);

// Talaba bo'yicha
const payments = await paymentsApi.getAll(token, collegeId, {
  studentId: 'clx123'
});

// Sana oralig'i
const payments = await paymentsApi.getAll(token, collegeId, {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
});

// Status bo'yicha
const payments = await paymentsApi.getAll(token, collegeId, {
  status: 'pending'
});
```
