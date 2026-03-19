# 📊 Dashboard Moduli

## 📋 Umumiy Ma'lumot

Dashboard moduli kollej administratorlari uchun asosiy boshqaruv paneli. Talabalar, to'lovlar, qarzdorlar va boshqa ma'lumotlarni boshqarish.

## 📁 Fayl Tuzilishi

```
dashboard/
├── layout.tsx          # Dashboard layout (sidebar + header)
├── page.tsx            # Asosiy sahifa (statistika)
│
├── students/           # 🎓 Talabalar
│   └── page.tsx
│
├── payments/           # 💰 To'lovlar
│   └── page.tsx
│
├── debtors/            # 😰 Qarzdorlar
│   └── page.tsx
│
├── duplicates/         # 👥 Takroriy talabalar
│   └── page.tsx
│
├── bank/               # 🏦 Bank operatsiyalari
│   └── page.tsx
│
├── attendance/         # ✅ Davomat
│   └── page.tsx
│
├── contracts/          # 📄 Shartnomalar
│   └── page.tsx
│
├── reminders/          # 🔔 Eslatmalar
│   └── page.tsx
│
├── reports/            # 📈 Hisobotlar
│   └── page.tsx
│
└── settings/           # ⚙️ Sozlamalar
    └── page.tsx
```

## 🎨 Layout Tuzilishi

```tsx
// layout.tsx
<div className="flex min-h-screen bg-gray-50">
  {/* Chap sidebar - navigatsiya */}
  <Sidebar />
  
  {/* Asosiy kontent */}
  <div className="flex-1">
    {/* Yuqori header */}
    <Header />
    
    {/* Sahifa kontenti */}
    <main className="p-6">
      {children}
    </main>
  </div>
</div>
```

## 📄 Sahifalar

### 1. Asosiy Sahifa (`page.tsx`)

**Vazifasi:** Umumiy statistika va grafiklar.

**Komponentlar:**
- StatsCard - Bugungi to'lovlar, Oylik reja, Talabalar soni, Qarz
- RecentPayments - So'nggi to'lovlar jadvali
- GroupDebts - Guruh bo'yicha qarzlar

**Ma'lumotlar:**
```typescript
interface DashboardStats {
  todayPayments: number;    // Bugungi to'lovlar
  todayCount: number;       // Bugungi to'lovlar soni
  monthlyPlan: number;      // Oylik reja
  monthlyActual: number;    // Oylik fakt
  monthlyPercent: number;   // Foiz
  totalStudents: number;    // Jami talabalar
  activeStudents: number;   // Faol talabalar
  totalDebt: number;        // Jami qarz
  recentPayments: Payment[]; // So'nggi to'lovlar
  groupDebts: GroupDebt[];  // Guruh qarzlari
}
```

---

### 2. Talabalar (`/dashboard/students`)

**Vazifasi:** Talabalar ro'yxati va boshqaruvi.

**Funksiyalar:**
- Talabalar ro'yxati (jadval)
- Qidirish (ism, PINFL, shartnoma)
- Filter (guruh, status)
- Yangi talaba qo'shish (modal)
- Talabani tahrirlash
- Talabani o'chirish

**Komponentlar:**
- Table - Talabalar jadvali
- StudentFormModal - Talaba formasi
- Button, Input, Select

---

### 3. To'lovlar (`/dashboard/payments`)

**Vazifasi:** To'lovlar ro'yxati va boshqaruvi.

**Funksiyalar:**
- To'lovlar ro'yxati
- Filter (talaba, sana, status)
- Yangi to'lov qo'shish
- To'lovni tasdiqlash
- To'lovni rad etish

**Komponentlar:**
- Table - To'lovlar jadvali
- PaymentFormModal - To'lov formasi
- DatePicker - Sana tanlash

---

### 4. Qarzdorlar (`/dashboard/debtors`)

**Vazifasi:** Qarzdor talabalar ro'yxati.

**Ko'rsatiladigan ma'lumotlar:**
- Talaba ismi
- Guruh
- Shartnoma summasi
- To'langan
- Qarz
- Telefon

**Funksiyalar:**
- Qarzdorlar ro'yxati
- SMS yuborish
- Export

---

### 5. Takroriy Talabalar (`/dashboard/duplicates`)

**Vazifasi:** Boshqa kollejlarda ham ro'yxatdan o'tgan talabalarni aniqlash.

**Ishlash mantig'i:**
- Talaba PINFL si boshqa kollejlarda mavjud bo'lsa
- Ogohlantirish ko'rsatish

---

### 6. Bank (`/dashboard/bank`)

**Vazifasi:** Bank operatsiyalarini import va solishtirish.

**Funksiyalar:**
- Bank ma'lumotlarini import (Excel/CSV)
- To'lovlar bilan solishtirish
- Mos kelgan/mos kelmagan yozuvlar

---

### 7. Davomat (`/dashboard/attendance`)

**Vazifasi:** Talaba davomatini kuzatish.

**Funksiyalar:**
- Davomat jadvali
- QR kod skanerlash
- Hisobot

---

### 8. Shartnomalar (`/dashboard/contracts`)

**Vazifasi:** Shartnoma hujjatlari boshqaruvi.

**Funksiyalar:**
- Shartnomalar ro'yxati
- PDF generatsiya
- Chop etish

---

### 9. Eslatmalar (`/dashboard/reminders`)

**Vazifasi:** SMS/Email eslatmalar yuborish.

**Funksiyalar:**
- Eslatma yaratish
- Rejalashtirish
- Tarix

---

### 10. Hisobotlar (`/dashboard/reports`)

**Vazifasi:** Turli hisobotlar.

**Hisobot turlari:**
- To'lovlar hisoboti
- Qarzdorlik hisoboti
- Davomat hisoboti
- Excel/PDF export

---

### 11. Sozlamalar (`/dashboard/settings`)

**Vazifasi:** Tizim sozlamalari.

**Sozlamalar:**
- Kollej ma'lumotlari
- Foydalanuvchilar boshqaruvi
- Integratsiyalar
- Bildirishnomalar

---

## 🔐 Autentifikatsiya

Dashboard sahifalari himoyalangan. Foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yo'naltiriladi.

```tsx
// layout.tsx
const { user, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!user) redirect('/login');
```

## 🎯 Rollar

| Sahifa | admin | accountant | operator |
|--------|-------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Students | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ✅ |
| Payments/Confirm | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ |

## 📊 Ma'lumotlar Oqimi

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Sahifa yuklandi                                             │
│     │                                                            │
│     ▼                                                            │
│  2. useAuth() - Foydalanuvchi tekshirish                        │
│     │                                                            │
│     ▼                                                            │
│  3. useEffect() - API dan ma'lumot olish                        │
│     │                                                            │
│     ▼                                                            │
│  4. setState() - Ma'lumotlarni saqlash                          │
│     │                                                            │
│     ▼                                                            │
│  5. Render - Komponentlarni chizish                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📌 Foydalanish Misollari

### Dashboard Statistikasi

```tsx
// page.tsx
const [stats, setStats] = useState<DashboardStats | null>(null);

useEffect(() => {
  const fetchStats = async () => {
    const data = await dashboardApi.getStats(token, collegeId);
    setStats(data);
  };
  fetchStats();
}, []);

return (
  <div className="grid grid-cols-4 gap-4">
    <StatsCard 
      title="Bugungi to'lovlar" 
      value={stats?.todayPayments} 
    />
    {/* ... */}
  </div>
);
```

### Talabalar Ro'yxati

```tsx
// students/page.tsx
const [students, setStudents] = useState<Student[]>([]);

const handleCreate = async (data: CreateStudentDto) => {
  const newStudent = await studentsApi.create(token, {
    ...data,
    collegeId
  });
  setStudents([...students, newStudent]);
};

return (
  <>
    <Button onClick={() => setShowModal(true)}>
      Yangi talaba
    </Button>
    
    <Table data={students} columns={columns} />
    
    <StudentFormModal 
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSubmit={handleCreate}
    />
  </>
);
```

## 🔗 Bog'liq Komponentlar

| Komponent | Joylashuvi | Tavsif |
|-----------|------------|--------|
| Sidebar | `components/layout/sidebar.tsx` | Navigatsiya menyusi |
| Header | `components/layout/header.tsx` | Yuqori panel |
| StatsCard | `components/dashboard/stats-card.tsx` | Statistika kartasi |
| StudentFormModal | `components/students/student-form-modal.tsx` | Talaba formasi |
| PaymentFormModal | `components/payments/payment-form-modal.tsx` | To'lov formasi |

## 🎨 UI Komponentlari

Dashboard da quyidagi UI komponentlar ishlatiladi:

- `Button` - Tugmalar
- `Input` - Matn kiritish
- `Select` - Tanlov
- `Table` - Jadval
- `Modal` - Modal oyna
- `Card` - Karta
- `Badge` - Status belgisi
- `DatePicker` - Sana tanlash
- `Pagination` - Sahifalash
- `Toast` - Bildirishnoma

## ⚠️ E'tibor

1. **Token:** Har bir API so'rovda token kerak
2. **College ID:** Har bir so'rovda collegeId parametri kerak
3. **Loading:** Ma'lumotlar yuklanayotganda loading ko'rsatish
4. **Error:** Xatolik yuzaga kelganda xabar ko'rsatish
