# 👑 Super Admin Moduli

## 📋 Umumiy Ma'lumot

Super Admin moduli tizim administratori uchun barcha kollejlarni boshqarish paneli.

## 📁 Fayl Tuzilishi

```
super-admin/
├── layout.tsx          # Super Admin layout
├── page.tsx            # Asosiy sahifa (umumiy statistika)
│
├── colleges/           # 🏫 Kollejar boshqaruvi
│   ├── page.tsx        # Kollejar ro'yxati
│   └── [id]/           # Dinamik route
│       └── page.tsx    # Bitta kollej tahrirlash
│
├── subscriptions/      # 📋 Obunalar
│   └── page.tsx
│
├── billing/            # 💳 Hisob-kitob
│   └── page.tsx
│
└── settings/           # ⚙️ Tizim sozlamalari
    └── page.tsx
```

## 🎨 Layout Tuzilishi

```tsx
// layout.tsx
<div className="flex min-h-screen bg-gray-50">
  {/* Super Admin sidebar */}
  <SuperAdminSidebar />
  
  {/* Asosiy kontent */}
  <div className="flex-1">
    {/* Super Admin header */}
    <SuperAdminHeader />
    
    {/* Sahifa kontenti */}
    <main className="p-6">
      {children}
    </main>
  </div>
</div>
```

## 📄 Sahifalar

### 1. Asosiy Sahifa (`page.tsx`)

**Vazifasi:** Tizim bo'yicha umumiy statistika.

**Ko'rsatiladigan ma'lumotlar:**
- Jami kollejlar soni
- Faol kollejlar
- Jami talabalar
- Jami daromad

**Ma'lumotlar:**
```typescript
interface SuperAdminStats {
  totalColleges: number;     // Jami kollejlar
  activeColleges: number;    // Faol kollejlar
  totalStudents: number;     // Jami talabalar
  totalRevenue: number;      // Jami daromad
}
```

---

### 2. Kollejar (`/super-admin/colleges`)

**Vazifasi:** Barcha kollejlarni ro'yxati va boshqaruvi.

**Funksiyalar:**
- Kollejar ro'yxati (jadval)
- Qidirish (nom, subdomain)
- Filter (status, plan)
- Yangi kollej qo'shish
- Kollejni tahrirlash
- Kollejni o'chirish

**Jadval ustunlari:**
| Ustun | Tavsif |
|-------|--------|
| Nomi | Kollej nomi |
| Subdomain | subdomain.example.com |
| Plan | basic, pro, enterprise |
| Status | trial, active, suspended |
| Talabalar | Talabalar soni |
| Guruhlar | Guruhlar soni |
| Amallar | Tahrirlash, O'chirish |

---

### 3. Kollej Tahrirlash (`/super-admin/colleges/[id]`)

**Vazifasi:** Bitta kollej ma'lumotlarini tahrirlash.

**Tahrirlanadigan maydonlar:**

#### Asosiy ma'lumotlar
- Kollej nomi
- Subdomain
- Custom domain
- Admin email
- Admin telefon
- Manzil

#### Tarif va Status
- Plan (basic, pro, enterprise)
- Status (trial, active, suspended)
- Obuna muddati
- Trial muddati

#### Modullar (Features)
| Modul | Tavsif |
|-------|--------|
| hasStudents | Talabalar moduli |
| hasPayments | To'lovlar moduli |
| hasReports | Hisobotlar moduli |
| hasBankIntegration | Bank integratsiyasi |
| hasTelegramBot | Telegram bot |
| hasSmsNotifications | SMS bildirishnomalar |
| hasExcelImport | Excel import |
| hasPdfReports | PDF hisobotlar |

#### Cheklovlar
- Talabalar limiti
- Guruhlar limiti

---

### 4. Obunalar (`/super-admin/subscriptions`)

**Vazifasi:** Kollejar obunalarini boshqarish.

**Ko'rsatiladigan ma'lumotlar:**
- Obuna holati
- To'lov tarixi
- Yangilash muddati

---

### 5. Hisob-kitob (`/super-admin/billing`)

**Vazifasi:** Tizim daromadlari va hisob-kitob.

**Ko'rsatiladigan ma'lumotlar:**
- Oylik daromad
- To'lov tarixi
- Invoice lar

---

### 6. Sozlamalar (`/super-admin/settings`)

**Vazifasi:** Tizim sozlamalari.

**Sozlamalar:**
- Super Admin parolini o'zgartirish
- Email sozlamalari
- SMS sozlamalari
- Tizim sozlamalari

---

## 🔐 Autentifikatsiya

Super Admin sahifalari faqat `super_admin` roli uchun.

```tsx
// layout.tsx
const { user, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!user || user.role !== 'super_admin') {
  redirect('/login');
}
```

## 📊 Ma'lumotlar Modeli

### College

```typescript
interface College {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'trial' | 'active' | 'suspended';
  adminEmail: string;
  adminPhone?: string;
  address?: string;
  logo?: string;
  
  // Features
  hasStudents: boolean;
  hasPayments: boolean;
  hasReports: boolean;
  hasBankIntegration: boolean;
  hasTelegramBot: boolean;
  hasSmsNotifications: boolean;
  hasExcelImport: boolean;
  hasPdfReports: boolean;
  
  // Limits
  studentLimit: number;
  groupLimit: number;
  
  // Subscription
  subscriptionEndsAt?: Date;
  trialEndsAt?: Date;
  
  // Stats
  _count?: {
    students: number;
    groups: number;
  };
}
```

## 🎯 Tarif Rejasi

| Plan | Talabalar | Guruhlar | Features |
|------|-----------|----------|----------|
| Basic | 100 | 5 | Students, Payments |
| Pro | 500 | 20 | + Reports, Bank, Telegram |
| Enterprise | ∞ | ∞ | + SMS, Excel, PDF |

## 🔄 Ishlash Jarayoni

### Yangi Kollej Qo'shish

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE COLLEGE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Forma to'ldirish                                            │
│     - Nomi, subdomain, admin email                              │
│     │                                                            │
│     ▼                                                            │
│  2. API ga so'rov yuborish                                      │
│     │                                                            │
│     ▼                                                            │
│  3. Backend da:                                                  │
│     - College yaratish                                          │
│     - Trial boshlash (14 kun)                                   │
│     - CollegeAdmin yaratish                                     │
│     │                                                            │
│     ▼                                                            │
│  4. Muvaffaqiyatli javob                                        │
│     - Ro'yxatga qo'shish                                        │
│     - Toast ko'rsatish                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Kollej Status O'zgartirish

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  trial ──▶ active ──▶ suspended                                 │
│    │          │           │                                      │
│    │          │           └──▶ To'lov to'xtatilganda            │
│    │          │                                                  │
│    │          └──▶ To'lov qilinganda                            │
│    │                                                             │
│    └──▶ Yangi kollej (14 kun trial)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📌 Foydalanish Misollari

### Kollejar Ro'yxati

```tsx
// colleges/page.tsx
const [colleges, setColleges] = useState<College[]>([]);

useEffect(() => {
  const fetchColleges = async () => {
    const data = await collegesApi.getAll(token);
    setColleges(data);
  };
  fetchColleges();
}, []);

return (
  <Table
    data={colleges}
    columns={[
      { key: 'name', label: 'Nomi' },
      { key: 'subdomain', label: 'Subdomain' },
      { key: 'plan', label: 'Plan' },
      { key: 'status', label: 'Status' },
    ]}
  />
);
```

### Kollej Tahrirlash

```tsx
// colleges/[id]/page.tsx
const { id } = useParams();
const [college, setCollege] = useState<College | null>(null);

const handleUpdate = async (data: Partial<College>) => {
  const updated = await collegesApi.update(token, id, data);
  setCollege(updated);
  toast.success('Saqlandi');
};

return (
  <form onSubmit={handleSubmit(handleUpdate)}>
    <Input {...register('name')} label="Nomi" />
    <Select {...register('plan')} options={planOptions} />
    <Select {...register('status')} options={statusOptions} />
    
    {/* Features */}
    <Checkbox {...register('hasStudents')} label="Talabalar moduli" />
    <Checkbox {...register('hasPayments')} label="To'lovlar moduli" />
    
    <Button type="submit">Saqlash</Button>
  </form>
);
```

### Yangi Kollej Qo'shish

```tsx
const handleCreate = async (data: CreateCollegeDto) => {
  const college = await collegesApi.create(token, {
    name: data.name,
    subdomain: data.subdomain,
    adminEmail: data.adminEmail,
    plan: 'basic',
  });
  
  // College avtomatik 14 kun trial oladi
  router.push(`/super-admin/colleges/${college.id}`);
};
```

## 🔗 Bog'liq Komponentlar

| Komponent | Joylashuvi | Tavsif |
|-----------|------------|--------|
| SuperAdminSidebar | `components/layout/super-admin-sidebar.tsx` | Navigatsiya |
| SuperAdminHeader | `components/layout/super-admin-header.tsx` | Header |
| Table | `components/ui/table.tsx` | Jadval |
| Modal | `components/ui/modal.tsx` | Modal |
| Toast | `components/ui/toast.tsx` | Bildirishnoma |

## 🛡️ Huquqlar

| Sahifa | super_admin |
|--------|-------------|
| Dashboard | ✅ |
| Colleges | ✅ |
| Subscriptions | ✅ |
| Billing | ✅ |
| Settings | ✅ |

## ⚠️ E'tibor

1. **Faqat super_admin** - Boshqa rollar kira olmaydi
2. **Trial muddati** - Yangi kollej 14 kun trial oladi
3. **Limitlar** - Har bir tarif o'z limitlariga ega
4. **Subdomain unique** - Har bir subdomain noyob bo'lishi kerak

## 📈 Statistika

### Kollej Statistikasi

```typescript
interface CollegeStats {
  studentsCount: number;   // Talabalar soni
  totalRevenue: number;    // Jami daromad
  groupsCount: number;     // Guruhlar soni
}

// API
const stats = await collegesApi.getStats(token, collegeId);
```

### Tizim Statistikasi

```typescript
interface SystemStats {
  totalColleges: number;
  activeColleges: number;
  totalStudents: number;
  totalRevenue: number;
}

// API
const stats = await dashboardApi.getSuperAdminStats(token);
```
