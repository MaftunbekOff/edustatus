# Frontend Modulli Arxitektura Qo'llanmasi

## Tuzilish

Loyiha modulli arxitektura asosida tuzilgan bo'lib, har bir modul o'z vazifasiga mos keladi.

```
frontend/src/
  app/                    # Next.js App Router sahifalari
    (auth)/               # Autentifikatsiya sahifalari (login)
    dashboard/            # Foydalanuvchi dashboardi
    parent/               # Ota-ona paneli
    student/              # Talaba paneli
    super-admin/          # Super Admin paneli
  components/             # Qayta ishlatiladigan komponentlar
    dashboard/            # Dashboard komponentlari
    layout/               # Layout komponentlari (header, sidebar)
    payments/             # To'lovlar komponentlari
    providers/            # React Context providerlari
    students/             # Talabalar komponentlari
    super-admin/          # Super Admin komponentlari
      AdministratorCard.tsx    # Administratorlar kartasi
      ChildOrganizationsCard.tsx  # Quyi tashkilotlar kartasi
      index.ts            # Eksport index
    ui/                   # UI komponentlari (button, card, modal...)
  lib/                    # Utilitlar va hooklar
    api.ts                # API so'rovlar funksiyalari
    auth-context.tsx      # Autentifikatsiya context
    constants/            # O'zgarmas qiymatlar
      regions.ts          # Viloyat va tumanlar
      organization.ts     # Tashkilot turlari, statuslar
      index.ts            # Eksport index
    hooks/                # Custom React hooklar
      useCollegeData.ts   # Tashkilot ma'lumotlari hooki
      usePhoneFormat.ts   # Telefon formatlash hooki
      index.ts            # Eksport index
    utils.ts              # Yordamchi funksiyalar
  types/                  # TypeScript tiplari
    index.ts              # Barcha tiplarni eksport qilish
```

## Modullar

### 1. Constants (`lib/constants/`)

O'zgarmas qiymatlar: viloyatlar, tumanlar, tashkilot turlari, statuslar va h.k.

**Foydalanish:**
```typescript
import { regions, districtsByRegion, organizationTypes } from "@/lib/constants"
```

**Fayllar:**
- `regions.ts` - O'zbekiston viloyat va tumanlari
- `organization.ts` - Tashkilot turlari, tariflar, statuslar
- `index.ts` - Barcha constantlarni bitta joydan eksport qilish

### 2. Hooks (`lib/hooks/`)

Custom React hooklar - mantiqni ajratib olish uchun.

**Foydalanish:**
```typescript
import { useCollegeData, usePhoneFormat } from "@/lib/hooks"

// Tashkilot ma'lumotlari
const { college, stats, domains, loading, error, loadData } = useCollegeData(collegeId)

// Telefon formatlash
const { formatPhoneNumber, handlePhoneChange } = usePhoneFormat()
```

**Fayllar:**
- `useCollegeData.ts` - Tashkilot ma'lumotlarini yuklash va boshqarish
- `usePhoneFormat.ts` - Telefon raqamni +998 XX XXX XX XX formatga keltirish
- `index.ts` - Barcha hooklarni eksport qilish

### 3. Components (`components/`)

Qayta ishlatiladigan UI komponentlari.

**Super Admin komponentlari:**
```typescript
import { AdministratorCard, ChildOrganizationsCard } from "@/components/super-admin"

<AdministratorCard
  admins={college.admins}
  onAddAdmin={handleOpenAdminModal}
  onEditAdmin={handleEditAdmin}
  onDeleteAdmin={handleDeleteAdmin}
/>

<ChildOrganizationsCard
  college={college}
  onAddChild={handleOpenChildModal}
  onToggleSubColleges={handleToggleSubColleges}
/>
```

## Qoidalari

### 1. Har bir fayl bir vazifa

- Har bir fayl faqat bitta vazifani bajarishi kerak
- Agar fayl 300 qatordan oshsa, uni ajratish kerak

### 2. Index fayllardan foydalanish

Har bir papkada `index.ts` fayli bo'lishi kerak:
```typescript
// lib/constants/index.ts
export * from './regions'
export * from './organization'
```

### 3. Import qisqartirish

Index fayllar orqali import qilish:
```typescript
// Yomon
import { regions } from "@/lib/constants/regions"
import { organizationTypes } from "@/lib/constants/organization"

// Yaxshi
import { regions, organizationTypes } from "@/lib/constants"
```

### 4. Komponentlarni ajratish

Katta sahifalardagi komponentlarni alohida fayllarga ajrating:

**Asl:**
```tsx
// page.tsx - 2000+ qator
function Page() {
  return (
    <Card>...admin ro'yxati...</Card>
    <Card>...quyi tashkilotlar...</Card>
    <Card>...domainlar...</Card>
  )
}
```

**Yangi:**
```tsx
// page.tsx - 200 qator
import { AdministratorCard } from "@/components/super-admin"
import { ChildOrganizationsCard } from "@/components/super-admin"

function Page() {
  return (
    <AdministratorCard ... />
    <ChildOrganizationsCard ... />
  )
}
```

### 5. Hooklar orqali mantiqni ajratish

**Asl:**
```tsx
// page.tsx
const [college, setCollege] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")

useEffect(() => {
  // 50+ qator API so'rovlar
}, [])
```

**Yangi:**
```tsx
// page.tsx
const { college, loading, error } = useCollegeData(id)

// lib/hooks/useCollegeData.ts
export function useCollegeData(id) {
  // Barcha mantiq shu yerda
}
```

## Yangi modul qo'shish

1. `lib/constants/` da constantlar yaratish
2. `lib/hooks/` da hook yaratish (agar kerak bo'lsa)
3. `components/` da komponent yaratish
4. Index fayllarga eksport qo'shish
5. Sahifada foydalanish

## Misol: Yangi "Reports" moduli

```typescript
// 1. lib/constants/reports.ts
export const reportTypes = [
  { value: "daily", label: "Kunlik" },
  { value: "monthly", label: "Oylik" },
]

// 2. lib/hooks/useReports.ts
export function useReports(collegeId: string) {
  const [reports, setReports] = useState([])
  // ...
  return { reports, loading, generateReport }
}

// 3. components/super-admin/ReportsCard.tsx
export function ReportsCard({ collegeId }) {
  const { reports, generateReport } = useReports(collegeId)
  return <Card>...</Card>
}

// 4. lib/constants/index.ts
export * from './reports'

// 5. lib/hooks/index.ts
export * from './useReports'

// 6. components/super-admin/index.ts
export * from './ReportsCard'

// 7. app/super-admin/colleges/[id]/page.tsx
import { ReportsCard } from "@/components/super-admin"
<ReportsCard collegeId={params.id} />
```

## Foydali maslahatlar

1. **DRY (Don't Repeat Yourself)** - Bir xil kodni takrorlamang, uni alohida funksiyaga ajrating
2. **Single Responsibility** - Har bir fayl/funksiya bitta vazifa bajarsin
3. **Composition over Inheritance** - Komponentlarni kichik qismlarga bo'ling
4. **Type Safety** - TypeScript tiplaridan foydalaning
5. **Testing** - Kichik modullarni test qilish osonroq