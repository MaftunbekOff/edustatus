# UI Dizayn Rejasi - Tibbiyot Texnikumi Moliyaviy Tizimi

## 🎨 Dizayn Tizimi

### Ranglar Paletti

| Rang | Hex | Foydalanish |
|------|-----|-------------|
| **Primary** | `#1890ff` | Asosiy tugmalar, linklar |
| **Success** | `#52c41a` | Muvaffaqiyat, tasdiqlangan |
| **Warning** | `#faad14` | Ogohlantirish, kutilayotgan |
| **Error** | `#ff4d4f` | Xatolik, rad etilgan |
| **Dark** | `#001529` | Sidebar, header |
| **Light** | `#f0f2f5` | Background |

### Tipografiya

| Element | Size | Weight |
|---------|------|--------|
| H1 | 32px | 700 |
| H2 | 24px | 600 |
| H3 | 20px | 600 |
| Body | 14px | 400 |
| Small | 12px | 400 |

---

## 📱 Sahifalar Strukturasi

### 1. Login Sahifasi

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🏥 Tibbiyot Texnikumi                    │
│                  Moliyaviy Tizim                            │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │  👤 Foydalanuvchi nomi      │                │
│              └─────────────────────────────┘                │
│              ┌─────────────────────────────┐                │
│              │  🔒 Parol                   │                │
│              └─────────────────────────────┘                │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │         KIRISH              │                │
│              └─────────────────────────────┘                │
│                                                             │
│                      Parolni unutdingizmi?                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏥 Tibbiyot Texnikumi                    🔔  👤 Admin ▼               │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│  📊 Dashboard│   ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│              │   │ 📈 Bugun   │ │ 📅 Oylik   │ │ 👥 Talabalar│          │
│  👥 Talabalar│   │   15,000   │ │  450,000   │ │    320     │          │
│              │   │  so'm      │ │  so'm      │ │  ta        │          │
│  💰 To'lovlar│   └────────────┘ └────────────┘ └────────────┘          │
│              │                                                          │
│  📄 Hisobotlar│  ┌─────────────────────────────────────────────────┐   │
│              │   │           📊 Oylik Tushumlar Grafigi            │   │
│  ⚙️ Sozlamalar│  │                                                  │   │
│              │   │    ▓▓▓▓▓                                         │   │
│              │   │    ▓▓▓▓▓▓▓▓▓                                     │   │
│              │   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓                                 │   │
│              │   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                            │   │
│              │   │    ───────────────────────────                  │   │
│              │   │     Yan  Feb  Mar  Apr  May  Iyn                │   │
│              │   └─────────────────────────────────────────────────┘   │
│              │                                                          │
│              │   ┌──────────────────────┐ ┌──────────────────────┐    │
│              │   │ 📋 So'nggi To'lovlar │ │ ⚠️ Qarzdorlar        │    │
│              │   │                      │ │                      │    │
│              │   │ ● Aliyev A.  500,000 │ │ • Karimov K. 2.5 mln │    │
│              │   │ ● Valiyev V. 300,000 │ │ • Rahimov R. 1.8 mln │    │
│              │   │ ● Salimov S. 450,000 │ │ • Najimov N. 1.2 mln │    │
│              │   │                      │ │                      │    │
│              │   │ [Barchasini ko'rish] │ │ [Barchasini ko'rish] │    │
│              │   └──────────────────────┘ └──────────────────────┘    │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### 3. Talabalar Ro'yxati

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Talabalar                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔍 Qidirish...          Guruh: [Barchasi ▼]   Status: [Faol ▼]        │
│                                                                         │
│  [+ Yangi talaba]  [📥 Excel Import]  [📤 Excel Export]                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ │ F.I.O              │ Guruh    │ Shartnoma │ To'langan │ Qarzdorlik│
├────┼────────────────────┼──────────┼───────────┼───────────┼───────────┤
│  ☐ │ Aliyev Anvar       │ 101-A    │ 5,000,000 │ 3,500,000 │ 1,500,000 │
│    │ anvar@gmail.com    │          │           │           │  🟡       │
├────┼────────────────────┼──────────┼───────────┼───────────┼───────────┤
│  ☐ │ Valiyeva Dilnoza   │ 102-B    │ 5,000,000 │ 5,000,000 │ 0         │
│    │ dilnoza@mail.ru    │          │           │           │  🟢       │
├────┼────────────────────┼──────────┼───────────┼───────────┼───────────┤
│  ☐ │ Karimov Bobur      │ 101-A    │ 5,000,000 │ 1,000,000 │ 4,000,000 │
│    │ bobur@gmail.com    │          │           │           │  🔴       │
├────┼────────────────────┼──────────┼───────────┼───────────┼───────────┤
│                                                                         │
│  ◀ 1 2 3 ... 10 ▶                                     Jami: 320 talaba │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. Talaba Tafsilotlari

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Ortga                                                    [✏️ Tahrirlash]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  👤 ALIYEV ANVAR ABDULLOYEVICH                                   │   │
│  │                                                                  │   │
│  │  📱 +998 90 123 45 67    📧 anvar@gmail.com                     │   │
│  │  🆔 PINFL: 50101009900321                                        │   │
│  │  📄 Shartnoma: CT-2024-00123                                     │   │
│  │  🎓 Guruh: 101-A  |  Mutaxassislik: Hamshiralik ishi            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │ 💰 Umumiy summa      │  │ ✅ To'langan         │                    │
│  │    5,000,000 so'm    │  │    3,500,000 so'm    │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │ ⚠️ Qarzdorlik        │  │ 📊 To'langan %       │                    │
│  │    1,500,000 so'm    │  │         70%          │                    │
│  │    🔴                │  │    ████████░░░░      │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📜 To'lovlar Tarixi                                             │   │
│  │                                                                  │   │
│  │ ┌──────────────────────────────────────────────────────────────┐│   │
│  │ │ Sana       │ Summa      │ Usul    │ Status    │ Amallar     ││   │
│  │ ├────────────┼────────────┼─────────┼───────────┼─────────────┤│   │
│  │ │ 15.01.2025 │ 1,000,000  │ Bank    │ ✅ Tasdiq │ 📄 🗑️      ││   │
│  │ │ 10.12.2024 │ 1,500,000  │ Bank    │ ✅ Tasdiq │ 📄 🗑️      ││   │
│  │ │ 05.11.2024 │ 1,000,000  │ Naqd    │ ✅ Tasdiq │ 📄 🗑️      ││   │
│  │ └──────────────────────────────────────────────────────────────┘││   │
│  │                                                                  │   │
│  │ [+ Yangi to'lov qo'shish]                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5. To'lovlar Ro'yxati

```
┌─────────────────────────────────────────────────────────────────────────┐
│ To'lovlar                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📅 Sana: [01.01.2025] - [31.01.2025]   Status: [Barchasi ▼]           │
│                                                                         │
│  [+ Yangi to'lov]  [📤 Excel Export]                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ │ Sana       │ Talaba           │ Summa     │ Usul  │ Status       │
├────┼────────────┼──────────────────┼───────────┼───────┼──────────────┤
│  ☐ │ 15.01.2025 │ Aliyev Anvar     │ 1,000,000 │ Bank  │ ✅ Tasdiqlang│
│    │            │ CT-2024-00123    │           │       │              │
├────┼────────────┼──────────────────┼───────────┼───────┼──────────────┤
│  ☐ │ 15.01.2025 │ Valiyeva Dilnoza │ 500,000   │ Bank  │ ⏳ Kutilmoqda│
│    │            │ CT-2024-00145    │           │       │              │
├────┼────────────┼──────────────────┼───────────┼───────┼──────────────┤
│  ☐ │ 14.01.2025 │ Karimov Bobur    │ 1,500,000 │ Naqd  │ ✅ Tasdiqlang│
│    │            │ CT-2024-00098    │           │       │              │
├────┼────────────┼──────────────────┼───────────┼───────┼──────────────┤
│                                                                         │
│  ◀ 1 2 3 ... 50 ▶                                    Jami: 1,245 to'lov │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6. Yangi To'lov Qo'shish (Modal)

```
┌─────────────────────────────────────────────────────────┐
│ Yangi To'lov Qo'shish                            [✕]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Talaba *                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔍 Qidirish yoki tanlang...                    ▼│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  To'lov summasi *                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 0                                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  To'lov usuli *                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ Bank orqali  ○ Naqd  ○ Click  ○ Payme        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  To'lov sanasi                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📅 15.01.2025                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Izoh                                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           [Bekor qilish]  [Saqlash]             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Responsive Dizayn

### Mobile Navigation

```
┌─────────────────────┐
│ ☰  Tibbiyot Texnikumi│
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │ 📈 Bugun      │  │
│  │   15,000 so'm │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 📅 Oylik      │  │
│  │   450,000     │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 📋 So'nggi    │  │
│  │   to'lovlar   │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│ 🏠 👥 💰 📄 👤     │
└─────────────────────┘
```

### Mobile Talaba Kartochkasi

```
┌─────────────────────┐
│ 👤 Aliyev Anvar     │
│ 📱 +998 90 123 45 67│
│                     │
│ ┌─────────────────┐ │
│ │ 💰 Umumiy:      │ │
│ │   5,000,000     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ✅ To'langan:   │ │
│ │   3,500,000     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ⚠️ Qarzdorlik:  │ │
│ │   1,500,000 🔴  │ │
│ └─────────────────┘ │
│                     │
│ [📋 To'lovlar]      │
│ [✏️ Tahrirlash]     │
└─────────────────────┘
```

---

## 🧩 UI Komponentlari Ro'yxati

### Common Components

| Komponent | Tavsif |
|-----------|--------|
| `Button` | Tugmalar (primary, secondary, danger, etc.) |
| `Input` | Matn kiritish maydonlari |
| `Select` | Dropdown tanlov |
| `DatePicker` | Sana tanlash |
| `Table` | Ma'lumotlar jadvali |
| `Card` | Karta konteyner |
| `Modal` | Modal oyna |
| `Drawer` | Yon panel |
| `Badge` | Status belgisi |
| `Avatar` | Foydalanuvchi rasmi |
| `Spinner` | Yuklash indikatori |
| `Empty` | Bo'sh holat |

### Layout Components

| Komponent | Tavsif |
|-----------|--------|
| `MainLayout` | Asosiy layout (sidebar + content) |
| `Sidebar` | Chap menyu |
| `Header` | Yuqori panel |
| `Footer` | Pastki panel |
| `MobileNav` | Mobil navigatsiya |

### Business Components

| Komponent | Tavsif |
|-----------|--------|
| `StatsCard` | Statistika kartasi |
| `StudentCard` | Talaba kartochkasi |
| `PaymentRow` | To'lov qatori |
| `PaymentModal` | To'lov qo'shish modal |
| `StudentFilter` | Talaba filtri |
| `PaymentFilter` | To'lov filtri |
| `RevenueChart` | Tushumlar grafigi |
| `DebtChart` | Qarzdorlik grafigi |
| `RecentPayments` | So'nggi to'lovlar |
| `DebtorsList` | Qarzdorlar ro'yxati |
| `ImportModal` | Excel import modal |
| `ExportButton` | Excel eksport tugmasi |

---

## 📁 Frontend Fayl Strukturasi

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── students/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   └── (student)/
│   │       └── [pinfl]/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/
│   │   │   ├── main-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── recent-payments.tsx
│   │   │   └── debtors-list.tsx
│   │   ├── students/
│   │   │   ├── student-card.tsx
│   │   │   ├── student-table.tsx
│   │   │   ├── student-filter.tsx
│   │   │   └── student-import.tsx
│   │   └── payments/
│   │       ├── payment-table.tsx
│   │       ├── payment-modal.tsx
│   │       └── payment-filter.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── api.ts
│   │   └── validators.ts
│   ├── hooks/
│   │   ├── use-students.ts
│   │   ├── use-payments.ts
│   │   └── use-auth.ts
│   └── types/
│       ├── student.ts
│       ├── payment.ts
│       └── api.ts
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🛠️ Texnologiyalar

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Next.js | 14.x | React framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | UI components |
| Recharts | 2.x | Charts |
| React Hook Form | 7.x | Forms |
| Zod | 3.x | Validation |
| TanStack Query | 5.x | Data fetching |
| Lucide React | latest | Icons |

---

## 📱 Responsive Breakpoints

| Breakpoint | Min Width | Qurilma |
|------------|-----------|---------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |
