# 🗄️ Ma'lumotlar Bazasi SXemasi

## 📊 Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPER ADMIN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐                                                          │
│  │  SuperAdmin   │                                                          │
│  ├───────────────┤                                                          │
│  │ id            │                                                          │
│  │ email         │                                                          │
│  │ password      │                                                          │
│  │ fullName      │                                                          │
│  │ role          │                                                          │
│  └───────────────┘                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              COLLEGE SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐      ┌───────────────────┐                          │
│  │     College       │──1:N─│   CollegeAdmin    │                          │
│  ├───────────────────┤      ├───────────────────┤                          │
│  │ id                │      │ id                │                          │
│  │ name              │      │ collegeId (FK)    │                          │
│  │ subdomain         │      │ email             │                          │
│  │ customDomain      │      │ password          │                          │
│  │ plan              │      │ fullName          │                          │
│  │ status            │      │ role              │                          │
│  │ adminEmail        │      │ status            │                          │
│  │ studentLimit      │      │ lastLogin         │                          │
│  │ groupLimit        │      └───────────────────┘                          │
│  │ subscriptionEndsAt│                                                     │
│  └────────┬──────────┘                                                     │
│           │                                                                  │
│     ┌─────┴─────┬──────────────┬──────────────┬──────────────┐            │
│     │           │              │              │              │            │
│     ▼           ▼              ▼              ▼              ▼            │
│  ┌──────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Group │  │Student  │  │Payment   │  │BankRecord│  │Reminder  │        │
│  └──┬───┘  └────┬────┘  └──────────┘  └──────────┘  └──────────┘        │
│     │           │                                                          │
│     └─────1:N───┘                                                          │
│           │                                                                  │
│     ┌─────┴─────┬──────────────┐                                           │
│     │           │              │                                           │
│     ▼           ▼              ▼                                           │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐                                  │
│  │Payment   │ │Contract  │ │Attendance │                                  │
│  └──────────┘ └──────────┘ └───────────┘                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PARENT/STUDENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐      ┌───────────────────┐                          │
│  │   ParentUser      │      │    AuditLog       │                          │
│  ├───────────────────┤      ├───────────────────┤                          │
│  │ id                │      │ id                │                          │
│  │ phone             │      │ collegeId (FK)    │                          │
│  │ password          │      │ userId            │                          │
│  │ fullName          │      │ action            │                          │
│  │ childrenPinfl[]   │      │ entity            │                          │
│  └───────────────────┘      │ entityId          │                          │
│                             │ oldValue (JSON)   │                          │
│                             │ newValue (JSON)   │                          │
│                             └───────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Jadval Tavsiflari

### 1. SuperAdmin

Tizim administratori - barcha kollejlarni boshqaradi.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID (CUID) |
| email | String | Email manzil (unique) |
| password | String | Shifrlangan parol (bcrypt) |
| fullName | String | To'liq ism |
| role | String | Rol (default: "super_admin") |
| createdAt | DateTime | Yaratilgan vaqt |
| updatedAt | DateTime | Yangilangan vaqt |

---

### 2. College

Ta'lim muassasasi.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| name | String | Kollej nomi |
| subdomain | String | Subdomain (unique) |
| customDomain | String? | O'z domeni |
| plan | String | Tarif (basic, pro, enterprise) |
| status | String | Status (trial, active, suspended) |
| adminEmail | String | Admin email |
| adminPhone | String? | Admin telefon |
| address | String? | Manzil |
| logo | String? | Logo URL |
| hasStudents | Boolean | Talabalar moduli |
| hasPayments | Boolean | To'lovlar moduli |
| hasReports | Boolean | Hisobotlar moduli |
| hasBankIntegration | Boolean | Bank integratsiyasi |
| hasTelegramBot | Boolean | Telegram bot |
| hasSmsNotifications | Boolean | SMS bildirishnomalar |
| hasExcelImport | Boolean | Excel import |
| hasPdfReports | Boolean | PDF hisobotlar |
| studentLimit | Int | Talaba limiti |
| groupLimit | Int | Guruh limiti |
| subscriptionEndsAt | DateTime? | Obuna tugash sanasi |
| trialEndsAt | DateTime? | Trial tugash sanasi |

**Aloqalar:**
- `admins` → CollegeAdmin[] (1:N)
- `groups` → Group[] (1:N)
- `students` → Student[] (1:N)
- `payments` → Payment[] (1:N)
- `bankRecords` → BankRecord[] (1:N)
- `contracts` → Contract[] (1:N)
- `reminders` → Reminder[] (1:N)
- `attendance` → Attendance[] (1:N)

---

### 3. CollegeAdmin

Kollej administratori/buxgalter/operator.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| email | String | Email (unique) |
| password | String | Shifrlangan parol |
| fullName | String | To'liq ism |
| role | String | Rol (admin, accountant, operator) |
| status | String | Status (active, blocked) |
| lastLogin | DateTime? | Oxirgi kirish |

**Rollar:**
- `admin` - To'liq huquqli administrator
- `accountant` - Buxgalter (to'lovlar va hisobotlar)
- `operator` - Operator (ma'lumot kiritish)

---

### 4. Group

O'quv guruhi.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| name | String | Guruh nomi |
| specialty | String | Mutaxassislik |
| course | Int | Kurs (1-4) |
| year | Int | O'quv yili |

**Unique constraint:** `[collegeId, name, year]`

---

### 5. Student

Talaba.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| pinfl | String | PINFL (14 raqam) |
| contractNumber | String | Shartnoma raqami (unique) |
| fullName | String | To'liq ism |
| phone | String? | Telefon |
| email | String? | Email |
| address | String? | Manzil |
| birthDate | DateTime? | Tug'ilgan sana |
| groupId | String | Guruh ID (FK) |
| totalAmount | Float | Shartnoma summasi |
| paidAmount | Float | To'langan summa |
| debtAmount | Float | Qarz summasi |
| status | String | Status (active, graduated, expelled, transferred) |
| parentPhone | String? | Ota-ona telefoni |
| parentName | String? | Ota-ona ismi |

**Statuslar:**
- `active` - Faol talaba
- `graduated` - Bitirgan
- `expelled` - Chiqarilgan
- `transferred` - Ko'chirilgan

**Aloqalar:**
- `group` → Group (N:1)
- `payments` → Payment[] (1:N)
- `contracts` → Contract[] (1:N)
- `attendance` → Attendance[] (1:N)

---

### 6. Payment

To'lov.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| studentId | String | Talaba ID (FK) |
| amount | Float | Summa |
| currency | String | Valyuta (default: "UZS") |
| paymentMethod | String | To'lov usuli (bank, cash, click, payme, other) |
| status | String | Status (pending, confirmed, rejected, cancelled) |
| transactionId | String? | Bank tranzaksiya ID |
| referenceNumber | String? | Reference raqam |
| bankAccount | String? | Bank hisob raqami |
| bankMfo | String? | Bank MFO |
| bankName | String? | Bank nomi |
| paymentDate | DateTime | To'lov sanasi |
| confirmedAt | DateTime? | Tasdiqlangan vaqt |
| confirmedBy | String? | Tasdiqlagan foydalanuvchi ID |
| description | String? | Izoh |
| reconciled | Boolean | Bank bilan solishtirilgan |
| reconciledAt | DateTime? | Solishtirilgan vaqt |
| reconciledWith | String? | Bank record ID |

**To'lov usullari:**
- `bank` - Bank o'tkazmasi
- `cash` - Naqd pul
- `click` - Click
- `payme` - Payme
- `other` - Boshqa

**Statuslar:**
- `pending` - Kutilmoqda
- `confirmed` - Tasdiqlangan
- `rejected` - Rad etilgan
- `cancelled` - Bekor qilingan

---

### 7. BankRecord

Bank operatsiyalari (import qilingan).

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| transactionId | String | Bank tranzaksiya ID (unique) |
| amount | Float | Summa |
| currency | String | Valyuta |
| senderAccount | String? | Yuboruvchi hisob raqami |
| senderName | String? | Yuboruvchi ismi |
| senderMfo | String? | Yuboruvchi bank MFO |
| receiverAccount | String? | Qabul qiluvchi hisob raqami |
| receiverMfo | String? | Qabul qiluvchi bank MFO |
| purpose | String? | To'lov maqsadi |
| transactionDate | DateTime | Tranzaksiya sanasi |
| status | String | Status (new, matched, unmatched, ignored) |
| matchedWith | String? | Mos kelgan Payment ID |
| matchedAt | DateTime? | Mos kelgan vaqt |
| importedFrom | String? | Import manbai |
| importedAt | DateTime | Import vaqt |

---

### 8. Contract

Shartnoma.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| studentId | String | Talaba ID (FK) |
| contractNumber | String | Shartnoma raqami (unique) |
| contractDate | DateTime | Shartnoma sanasi |
| startDate | DateTime | Boshlanish sanasi |
| endDate | DateTime? | Tugash sanasi |
| amount | Float | Shartnoma summasi |
| paymentSchedule | String? | To'lov jadvali (JSON) |
| documentUrl | String? | Hujjat URL |
| status | String | Status (active, completed, cancelled) |

---

### 9. Reminder

Eslatma.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| type | String | Turi (payment, debt, deadline, custom) |
| title | String | Sarlavha |
| message | String | Xabar |
| targetType | String | Qabul qiluvchi turi (all, group, student) |
| targetId | String? | Group yoki Student ID |
| scheduledAt | DateTime | Rejalashtirilgan vaqt |
| sentAt | DateTime? | Yuborilgan vaqt |
| status | String | Status (pending, sent, failed) |
| sendSms | Boolean | SMS yuborish |
| sendEmail | Boolean | Email yuborish |
| sendTelegram | Boolean | Telegram yuborish |

---

### 10. Attendance

Davomat.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String | Kollej ID (FK) |
| studentId | String | Talaba ID (FK) |
| date | DateTime | Sana |
| status | String | Status (present, absent, late, excused) |
| note | String? | Izoh |
| scannedAt | DateTime? | Skan qilingan vaqt |
| scannedBy | String? | Skan qilgan foydalanuvchi |

**Unique constraint:** `[studentId, date]`

---

### 11. ParentUser

Ota-ona foydalanuvchisi.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| phone | String | Telefon (unique) |
| password | String | Shifrlangan parol |
| fullName | String? | To'liq ism |
| childrenPinfl | String[] | Farzandlar PINFL ro'yxati |

---

### 12. AuditLog

Audit log.

| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | String | Unikal ID |
| collegeId | String? | Kollej ID |
| userId | String? | Foydalanuvchi ID |
| action | String | Amal (create, update, delete, login) |
| entity | String | Entity (Student, Payment, etc.) |
| entityId | String? | Entity ID |
| oldValue | String? | Eski qiymat (JSON) |
| newValue | String? | Yangi qiymat (JSON) |
| ipAddress | String? | IP manzil |
| userAgent | String? | User agent |

---

## 🔍 Indexlar

### Student
- `collegeId` - Kollej bo'yicha qidirish
- `pinfl` - PINFL bo'yicha qidirish
- `groupId` - Guruh bo'yicha qidirish
- `[collegeId, pinfl]` - Unique

### Payment
- `collegeId` - Kollej bo'yicha
- `studentId` - Talaba bo'yicha
- `status` - Status bo'yicha
- `paymentDate` - Sana bo'yicha

### BankRecord
- `collegeId` - Kollej bo'yicha
- `status` - Status bo'yicha
- `transactionDate` - Sana bo'yicha

### Attendance
- `collegeId` - Kollej bo'yicha
- `studentId` - Talaba bo'yicha
- `date` - Sana bo'yicha

### AuditLog
- `collegeId` - Kollej bo'yicha
- `userId` - Foydalanuvchi bo'yicha
- `createdAt` - Vaqt bo'yicha

---

## 🔄 Triggers va Constraints

### Student Debt Auto-calculate
```sql
-- Trigger: debtAmount = totalAmount - paidAmount
-- Prisma da service orqali amalga oshiriladi
```

### Payment Cascade
```sql
-- College o'chirilganda:
ON DELETE CASCADE
-- Barcha bog'liq ma'lumotlar o'chiriladi
```

---

## 📊 Hisoblash Formulalari

### Talaba Qarzi
```
debtAmount = totalAmount - paidAmount
```

### Oylik Reja Foizi
```
monthlyPercent = (monthlyActual / monthlyPlan) * 100
```

### Guruh O'rtacha Qarzi
```
averageDebt = totalDebt / studentCount
```
