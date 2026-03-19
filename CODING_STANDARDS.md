# EduStatus - Kod Yozish Standartlari

> Bu hujjat loyihada ishlayotgan barcha dasturchilar uchun majburiy qoidalar to'plamidir. Har qanday kod yozishdan oldin bu qoidalarni o'qib chiqish shart.

## Mundarija

1. [Asosiy Tamoyillar](#1-asosiy-tamoyillar)
2. [Fayl Tuzilmasi](#2-fayl-tuzilmasi)
3. [Komponent Yozish Qoidalari](#3-komponent-yozish-qoidalari)
4. [Modullarga Ajratish Qoidalari](#4-modullarga-ajratish-qoidalari)
5. [Chunking Qoidalari](#5-chunking-qoidalari)
6. [Refaktoring Qoidalari](#6-refaktoring-qoidalari)
7. [Hook Yozish Qoidalari](#7-hook-yozish-qoidalari)
8. [Constants va Utils Qoidalari](#8-constants-va-utils-qoidalari)
9. [TypeScript Qoidalari](#9-typescript-qoidalari)
10. [API va Service Qoidalari](#10-api-va-service-qoidalari)
11. [Code Review Checklist](#11-code-review-checklist)
12. [Xavfsizlik (Security) Qoidalari](#12-xavfsizlik-security-qoidalari)
13. [Server va Client API Farqlari (Next.js)](#13-server-va-client-api-farqlari-nextjs)
14. [API Contract Testing (Zod)](#14-api-contract-testing-zod)
15. [Form Management Standarti](#15-form-management-standarti)
16. [Testing Standartlari](#16-testing-standartlari)
17. [Git Commit Konvensiyalari](#17-git-commit-konvensiyalari)
18. [Environment Variables Qoidalari](#18-environment-variables-qoidalari)
19. [Accessibility (a11y) Qoidalari](#19-accessibility-a11y-qoidalari)
20. [Xatolarni Boshqarish (Error Handling)](#20-xatolarni-boshqarish-error-handling)
21. [Logging va Monitoring](#21-logging-va-monitoring)
22. [Performance Optimizatsiyasi](#22-performance-optimizatsiyasi)
23. [Agent Decision Tree (Tezkor Qarorlar)](#23-agent-decision-tree-tezkor-qarorlar)

---

## 1. Asosiy Tamoyillar

### 1.1 SOLID Tamoyillari

Har bir kod quyidagi SOLID tamoyillariga mos kelishi kerak:

| Tamoyil | Tavsif | Misol |
|---------|--------|-------|
| **S** - Single Responsibility | Har bir klass/funksiya bitta mas'uliyatga ega bo'lishi kerak | `formatInn()` faqat INN formatlaydi, boshqa hech narsa qilmaydi |
| **O** - Open/Closed | Kod yangi funksiyalar uchun ochiq, o'zgartirish uchun yopiq bo'lishi kerak | Yangi feature qo'shish uchun mavjud kodni o'zgartirmaslik |
| **L** - Liskov Substitution | Derived klasslar base klass o'rniga ishlashi kerak | |
| **I** - Interface Segregation | Katta interfeyslarni kichiklarga bo'lish | |
| **D** - Dependency Inversion | Yuqori modullar pastki modullarga bog'lanmasligi kerak | |

### 1.2 DRY (Don't Repeat Yourself)

```typescript
// ❌ Yomon - Takroriy kod
const formatInn1 = (inn: string) => {
  const cleaned = inn.replace(/\D/g, "")
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}

const formatInn2 = (inn: string) => {
  const cleaned = inn.replace(/\D/g, "")
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}

// ✅ Yaxshi - Bitta funksiya, ko'p joyda ishlatiladi
// lib/utils/organization.ts
export const formatInn = (inn: string): string => {
  const cleaned = inn.replace(/\D/g, "")
  if (cleaned.length !== 9) return inn
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}
```

### 1.3 KISS (Keep It Simple, Stupid)

```typescript
// ❌ Yomon - Murakkab yechim
const getActiveCount = (org: any) => {
  let count = 0
  if (org.hasStudents) count++
  if (org.hasPayments) count++
  if (org.hasReports) count++
  if (org.hasExcelImport) count++
  if (org.hasPdfReports) count++
  return count
}

// ✅ Yaxshi - Oddiy yechim
const getActiveFeaturesCount = (org: OrganizationFeatures): number => {
  return [
    org.hasStudents,
    org.hasPayments,
    org.hasReports,
    org.hasExcelImport,
    org.hasPdfReports,
  ].filter(Boolean).length
}
```

---

## 2. Fayl Tuzilmasi

### 2.1 Frontend Fayl Tuzilmasi

> **Tavsiya:** Katta loyihalar uchun Feature-Sliced Design (FSD) metodologiyasining soddalashtirilgan variantidan foydalaning. Bu `components/` papkasining "axlatxonaga" aylanishini oldini oladi.

#### FSD-ga asoslangan tuzilma

```
frontend/src/
├── app/                          # Next.js App Router (routes only)
│   └── [route]/
│       ├── page.tsx              # Sahifa (150-200 qator)
│       ├── layout.tsx            # Layout
│       ├── error.tsx             # Error boundary
│       └── loading.tsx           # Loading state
│
├── shared/                       # Umumiy, feature'siz kodlar
│   ├── ui/                       # Atomik UI komponentlar (Button, Input)
│   ├── lib/                      # Utility funksiyalar
│   ├── hooks/                    # Umumiy hooks (useDebounce, useLocalStorage)
│   └── constants/                # Global constants
│
├── entities/                     # Ma'lumotlarni ko'rsatish (Data Display)
│   ├── organization/
│   │   ├── ui/                   # OrganizationCard, OrganizationList
│   │   ├── api/                  # organizationApi
│   │   ├── hooks/                # useOrganization
│   │   └── types.ts
│   └── user/
│       └── ...
│
├── features/                     # Foydalanuvchi amallari (User Actions)
│   ├── auth/
│   │   ├── ui/                   # LoginForm, RegisterForm
│   │   ├── api/                  # authApi
│   │   └── hooks/                # useAuth
│   └── organization-create/
│       └── ...
│
└── widgets/                      # Katta, mustaqil UI bloklari
    ├── header/
    ├── sidebar/
    └── dashboard-stats/
```

#### Qatlam Qoidalari

| Qatlam | Maqsad | Import qilish mumkin |
|--------|--------|---------------------|
| `app` | Routes, layouts | shared, entities, features, widgets |
| `widgets` | Katta UI bloklar | shared, entities, features |
| `features` | User actions | shared, entities |
| `entities` | Data display | shared |
| `shared` | Umumiy kodlar | hech kim (faqam tashqi kutubxonalar) |

> **Muhim:** Yuqori qatlam pastki qatlamni import qiladi, aksincha emas!

### 2.2 Backend Fayl Tuzilmasi

```
backend/src/
├── [module]/                     # Modul nomi
│   ├── [module].module.ts       # NestJS modul
│   ├── [module].controller.ts   # Controller
│   ├── [module].service.ts      # Service
│   └── dto/                      # Data Transfer Objects
│       ├── create-[entity].dto.ts
│       └── update-[entity].dto.ts
├── common/                       # Umumiy kodlar
│   ├── interceptors/
│   ├── middleware/
│   └── decorators/
└── prisma/                       # Prisma bog'lanish
```

### 2.3 Fayl Nomlash Qoidalari

| Tur | Format | Misol |
|-----|--------|-------|
| Komponent | PascalCase | `OrganizationCard.tsx` |
| Hook | camelCase with "use" prefix | `useOrganizationData.ts` |
| Utility | camelCase | `organization.ts` |
| Constants | camelCase | `organization-detail.ts` |
| Type/Interface | PascalCase | `OrganizationTypes.ts` |
| API | camelCase | `api.ts` |

---

## 3. Komponent Yozish Qoidalari

### 3.1 Komponent Hajmi Chegarasi

> **Muhim:** Qator soni — sifatning **ko'rsatkichi**, maqsad emas. 150 qatorlik chalkash kod 300 qatorlik toza koddan yomonroq. Asosiy mezonlar quyidagilar:

#### 3.1.1 Komponent Sifat Mezonlari

| Mezon | Savol | Yaxshi | Yomon |
|-------|-------|--------|-------|
| **Mas'uliyat** | Sahifa nechta mas'uliyatni bajaradi? | 1 ta | 2+ ta |
| **O'qilish** | Bitta funksiyani bir nafasda tushunsa bo'ladimi? | Ha | Yo'q |
| **Abstraksiya** | Nechta daraja aralashgan? | 1 daraja | 2+ daraja |

```typescript
// ❌ Yomon - 100 qator, lekin 3 ta mas'uliyat aralashgan
function UserPage() {
  // Data fetching (1-mas'uliyat)
  const [users, setUsers] = useState([])
  useEffect(() => { fetchUsers() }, [])
  
  // Form logic (2-mas'uliyat)
  const [form, setForm] = useState({})
  const handleSubmit = () => { ... }
  
  // UI rendering (3-mas'uliyat)
  return (
    <div>
      <UserForm form={form} onSubmit={handleSubmit} />
      <UserList users={users} />
    </div>
  )
}

// ✅ Yaxshi - 250 qator, lekin 1 ta mas'uliyat (orchestration)
function UserPage() {
  // Faqat orchestration - hook'lar mantiqni o'z ichiga oladi
  const { users, loading } = useUsers()
  const { form, handleSubmit } = useUserForm()
  
  return (
    <div>
      <UserForm form={form} onSubmit={handleSubmit} />
      <UserList users={users} loading={loading} />
    </div>
  )
}
```

#### 3.1.2 Qator Soni Ko'rsatkichlari

| Komponent turi | Ko'rsatkich | Tahlil |
|----------------|-------------|--------|
| Sahifa (page.tsx) | 150-200 | ⚠️ Tekshirish kerak - ehtimol ajratish lozim |
| Sahifa (page.tsx) | 200+ | 🔴 Majburiy tahlil - mas'uliyatlar ajratilishi kerak |
| Tab komponenti | 150+ | ⚠️ Tekshirish kerak |
| Card komponenti | 80-120 | ✅ Normal |
| Modal komponenti | 120-150 | ⚠️ Form maydonlarini ajratish kerakmi? |

> **Tavsiya:** 200 qatordan oshganda, quyidagi savollarni bering:
> 1. Bu sahifa nechta mas'uliyatni bajaradi?
> 2. Qaysi qismlarni hook'ga chiqarish mumkin?
> 3. Qaysi qismlarni sub-komponentga ajratish mumkin?

#### 3.1.3 Qachon Ajratmaslik Kerak?

```
✅ Ajratmaslik kerak, agar:
- Kod bir nafasda tushunarli
- Bitta mas'uliyat (orchestration)
- Abstraksiya darajalari aralashmagan
- Ajratish kodni murakkablashtiradi

❌ Majburiy ajratish kerak, agar:
- 2+ ta mas'uliyat mavjud
- Hook'lar orasiga kommentariya kerak (// --- State ---)
- JSX ichida murakkab mantiq
- useEffect'lar bir-biriga bog'liq emas
```

### 3.2 Sahifa Tuzilmasi

```
app/cabinet/organization/[id]/
├── page.tsx                    # 150-200 qator (Layout + Data Fetching)
├── components/
│   ├── index.ts                # Barrel export (ixtiyoriy)
│   ├── OverviewTab.tsx         # Tab komponentlari
│   ├── FinanceTab.tsx
│   └── SettingsTab.tsx
├── hooks/
│   └── useOrganizationData.ts  # Data fetching logic
└── types.ts                    # Sahifa tiplari
```

### 3.2 Komponent Tuzilmasi Shabloni

```typescript
/**
 * ComponentName Component
 * 
 * Brief description of what this component does.
 * Following Single Responsibility Principle - handles only [specific task].
 * 
 * @example
 * <ComponentName
 *   prop1="value"
 *   prop2={data}
 *   onAction={handleAction}
 * />
 */

"use client"  // Faqat client komponentlar uchun

// 1. Imports - tartib bilan
import { useState } from "react"                    // 1. React
import { useRouter } from "next/navigation"         // 2. Next.js
import { z } from "zod"                             // 3. Tashqi kutubxonalar
import { Card, CardContent } from "@/components/ui" // 4. UI components
import { Button } from "@/components/ui/button"     // 5. Individual UI
import { useAuth } from "@/lib/hooks"               // 6. Custom hooks
import { organizationApi } from "@/lib/api"         // 7. API modules
import { formatDate } from "@/lib/utils"            // 8. Utilities
import { CONSTANT } from "@/lib/constants"          // 9. Constants
import type { Organization } from "@/types"         // 10. Types (import type)

// 2. Types/Interfaces
export interface ComponentNameProps {
  organization: Organization
  onAction: (id: string) => void
}

// 3. Constants (komponent ichida ishlatiladigan)
const LOCAL_CONSTANT = "value"

// 4. Helper functions (faqat shu komponentda ishlatiladigan)
const helperFunction = (value: string): string => {
  return value.toUpperCase()
}

// 5. Main Component
export function ComponentName({ organization, onAction }: ComponentNameProps) {
  // 5.1 Hooks
  const router = useRouter()
  const { token } = useAuth()
  
  // 5.2 State
  const [isOpen, setIsOpen] = useState(false)
  
  // 5.3 Derived state
  const displayName = organization.name.toUpperCase()
  
  // 5.4 Callbacks
  const handleClick = () => {
    onAction(organization.id)
  }
  
  // 5.5 Effects
  useEffect(() => {
    // Side effects
  }, [])
  
  // 5.6 Early returns
  if (!organization) {
    return <div>Loading...</div>
  }
  
  // 5.7 Render
  return (
    <Card>
      <CardContent>
        {/* JSX content */}
      </CardContent>
    </Card>
  )
}
```

### 3.3 Props Interface Qoidalari

```typescript
// ✅ Yaxshi - Aniq tiplar va JSDoc
export interface OrganizationCardProps {
  /** Tashkilot ma'lumotlari */
  organization: Organization
  /** Tashkilotni tanlaganda chaqiriladigan funksiya */
  onSelect?: (id: string) => void
  /** Tahrirlash tugmasini ko'rsatish */
  showEdit?: boolean
}

// ❌ Yomon - Noma'lum tiplar
export interface OrganizationCardProps {
  organization: any
  onSelect: Function
  showEdit: boolean
}
```

---

## 4. Modullarga Ajratish Qoidalari

### 4.1 Qachon Ajratish Kerak?

Ajratish kerak, agar:
- ✅ **Page.tsx** 200+ qatordan oshgan (3.1.2 bo'lim)
- ✅ **Boshqa fayllar** 300+ qatordan oshgan
- ✅ Bir nechta tab yoki section mavjud
- ✅ Takroriy kod mavjud
- ✅ Logic va UI aralashgan
- ✅ State management murakkablashgan

### 4.2 Ajratish Bosqichlari

```
1. Constants ajratish
   └── lib/constants/[domain].ts

2. Utility funksiyalarni ajratish
   └── lib/utils/[domain].ts

3. Types/Interfaces ajratish
   └── types/[domain].ts

4. Custom Hook yaratish
   └── lib/hooks/use[Domain].ts

5. Tab/Section komponentlarini ajratish
   └── components/[ComponentName]Tab.tsx

6. Kichik komponentlarga bo'lish
   └── components/[ComponentName]Card.tsx
```

### 4.3 Misol: Katta Sahifani Ajratish

**Oldin (1259 qator):**
```
page.tsx
├── Constants (50 qator)
├── Helper functions (40 qator)
├── State management (100 qator)
├── Overview Tab (200 qator)
├── Finance Tab (200 qator)
├── Settings Tab (400 qator)
└── Modals (200 qator)
```

**Keyin:**
```
lib/
├── constants/
│   └── organization-detail.ts     # Constants
├── utils/
│   └── organization.ts            # Helper functions
└── hooks/
    └── useOrganizationSettings.ts # State management

components/
├── OverviewTab.tsx                # Overview tab
├── FinanceTab.tsx                 # Finance tab
├── SettingsTab.tsx                # Settings tab
└── index.ts                       # Barrel export

page.tsx                           # Main page (~150-200 qator)
```

### 4.4 Barrel Export (index.ts) Xavflari

> **Ogohlantirish:** Katta loyihalarda Barrel export'lar quyidagi muammolarga olib kelishi mumkin:
> - **Circular Dependency** - Aylanma bog'liqlik xatolari
> - **Bundle Size** - Bitta komponent import qilganda hammasi yuklanishi mumkin

#### Barrel Export Qoidalari

| Papka turi | Barrel Export | Sabab |
|------------|---------------|-------|
| `components/ui/` | ✅ Ruxsat | Kichik, UI komponentlar |
| `lib/utils/` | ✅ Ruxsat | Utility funksiyalar |
| `lib/hooks/` | ✅ Ruxsat | Custom hooks |
| `lib/constants/` | ✅ Ruxsat | Constants |
| `app/[route]/components/` | ⚠️ Ehtiyotkorlik | Sahifa komponentlari |
| Cross-module import | ❌ To'g'ridan-to'g'ri | Modullararo import |

```typescript
// ❌ Yomon - Barrel export orqali cross-module import
// features/users/index.ts
export { UserCard } from "./UserCard"
export { UserList } from "./UserList"

// features/posts/page.tsx
import { UserCard } from "@/features/users"  // Circular dependency xavfi!

// ✅ Yaxshi - To'g'ridan-to'g'ri import
import { UserCard } from "@/features/users/UserCard"

// ✅ Yaxshi - UI komponentlar uchun barrel export
// components/ui/index.ts
export { Button } from "./button"
export { Card } from "./card"
export { Input } from "./input"

// Sahifada ishlatish
import { Button, Card, Input } from "@/components/ui"
```

#### Qat'iyan Taqiqlanadi

```typescript
// ❌ TAQIQLANADI - Papka ichidagi fayllar bir-birini index.ts orqali import qilishi
// features/auth/hooks/useAuth.ts
import { LoginForm } from "../index"  // Circular dependency!

// ✅ To'g'ri - To'g'ridan-to'g'ri import
import { LoginForm } from "../ui/LoginForm"
```

---

## 5. Chunking Qoidalari

### 5.1 Chunking Nima?

**Chunking** - katta kod bloklarini kichik, boshqariladigan va tushunarli qismlarga (chunk'larga) bo'lish usuli. Bu psixologik tamoyilga asoslangan: inson miyasi kichik ma'lumotlarni osonroq qabul qiladi.

> **Cognitive Load (Kognitiv Yuklama):** Inson miyasi bir vaqtning o'zida 7±2 elementni qabul qila oladi. Kodni chunk'larga bo'lish kognitiv yuklamani kamaytiradi va kodni tushunishni osonlashtiradi.

### 5.2 Chunking Qoidalari

| Qoida | Tavsif | Misol |
|-------|--------|-------|
| **7±2 qoidasi** | Bir vaqtning o'zida 5-9 element | 7 ta gacha prop, 7 ta gacha state |
| **Vizual chunking** | Kodni bo'shliqlar bilan ajratish | Har bir logic blokidan keyin bo'sh qator |
| **Mantiqiy chunking** | Bog'liq kodlarni birga guruhlash | State, callbacks, effects alohida |
| **Abstraksiya chunking** | Detallarni yashirish | Helper funksiyalar, sub-komponentlar |

### 5.3 Vizual Chunking Misoli

```typescript
// ❌ Yomon - Chunking yo'q
export function Component() {
  const [state1, setState1] = useState()
  const [state2, setState2] = useState()
  const router = useRouter()
  const { token } = useAuth()
  const [state3, setState3] = useState()
  const handleClick = () => {}
  const handleDelete = () => {}
  useEffect(() => {}, [])
  const data = useMemo(() => {}, [])
  if (!token) return null
  return <div>...</div>
}

// ✅ Yaxshi - To'g'ri chunking
export function Component() {
  // --- Hooks ---
  const router = useRouter()
  const { token } = useAuth()

  // --- State ---
  const [state1, setState1] = useState()
  const [state2, setState2] = useState()
  const [state3, setState3] = useState()

  // --- Derived State ---
  const data = useMemo(() => {}, [])

  // --- Callbacks ---
  const handleClick = useCallback(() => {}, [])
  const handleDelete = useCallback(() => {}, [])

  // --- Effects ---
  useEffect(() => {}, [])

  // --- Early Returns ---
  if (!token) return null

  // --- Render ---
  return <div>...</div>
}
```

### 5.4 Komponent Ichida Chunking

```typescript
export function OrganizationCard({ organization }: Props) {
  // ========================================
  // 1. HOOKS CHUNK
  // ========================================
  const router = useRouter()
  const { token } = useAuth()
  const { mutate } = useSWRConfig()

  // ========================================
  // 2. STATE CHUNK
  // ========================================
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<Organization>>({})

  // ========================================
  // 3. DERIVED STATE CHUNK
  // ========================================
  const isActive = organization.status === 'active'
  const displayName = organization.name.toUpperCase()
  const canEdit = token && isActive

  // ========================================
  // 4. CALLBACKS CHUNK
  // ========================================
  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setFormData(organization)
  }, [organization])

  const handleSave = useCallback(async () => {
    await organizationApi.update(token, organization.id, formData)
    mutate(`/api/colleges/${organization.id}`)
    setIsEditing(false)
  }, [token, organization.id, formData, mutate])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await organizationApi.delete(token, organization.id)
      router.push('/cabinet/organization')
    } finally {
      setIsDeleting(false)
    }
  }, [token, organization.id, router])

  // ========================================
  // 5. EFFECTS CHUNK
  // ========================================
  useEffect(() => {
    // Analytics tracking
    trackView(organization.id)
  }, [organization.id])

  // ========================================
  // 6. EARLY RETURNS CHUNK
  // ========================================
  if (!organization) {
    return <Skeleton />
  }

  if (organization.isArchived) {
    return <ArchivedBanner />
  }

  // ========================================
  // 7. RENDER CHUNK
  // ========================================
  return (
    <Card>
      {/* Card content */}
    </Card>
  )
}
```

### 5.5 JSX Chunking

```typescript
// ❌ Yomon - Katta JSX blok
return (
  <Card>
    <CardHeader>
      <CardTitle>{organization.name}</CardTitle>
      <CardDescription>{organization.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5" />
          <div>
            <p className="text-sm text-muted-foreground">Turi</p>
            <p>{organization.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5" />
          <div>
            <p className="text-sm text-muted-foreground">Manzil</p>
            <p>{organization.address}</p>
          </div>
        </div>
        {/* ... ko'p qatorlar ... */}
      </div>
    </CardContent>
  </Card>
)

// ✅ Yaxshi - JSX chunking (sub-komponentlar)
return (
  <Card>
    <CardHeader>
      <CardTitle>{organization.name}</CardTitle>
      <CardDescription>{organization.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <OrganizationInfo organization={organization} />
      <OrganizationStats stats={stats} />
      <OrganizationActions
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </CardContent>
  </Card>
)

// Sub-komponentlar
function OrganizationInfo({ organization }: { organization: Organization }) {
  return (
    <div className="space-y-4">
      <InfoItem icon={<Building2 />} label="Turi" value={organization.type} />
      <InfoItem icon={<MapPin />} label="Manzil" value={organization.address} />
    </div>
  )
}
```

### 5.6 Props Chunking

```typescript
// ❌ Yomon - Ko'p prop'lar (prop drilling)
<OrganizationCard
  id={id}
  name={name}
  type={type}
  status={status}
  address={address}
  phone={phone}
  email={email}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onArchive={handleArchive}
  onRestore={handleRestore}
  showEdit={showEdit}
  showDelete={showDelete}
  showArchive={showArchive}
  isLoading={isLoading}
  hasError={hasError}
/>

// ✅ Yaxshi - Props chunking (obyekt sifatida)
<OrganizationCard
  organization={organization}           // Ma'lumotlar
  actions={{
    onEdit: handleEdit,
    onDelete: handleDelete,
    onArchive: handleArchive,
  }}
  options={{
    showEdit,
    showDelete,
    showArchive,
  }}
  state={{
    isLoading,
    hasError,
  }}
/>
```

### 5.7 State Chunking

```typescript
// ❌ Yomon - Bitta katta state obyekti
const [state, setState] = useState({
  isEditing: false,
  isDeleting: false,
  formData: {},
  errors: {},
  touched: {},
  isValid: false,
  isSubmitting: false,
})

// ✅ Yaxshi - State chunking
// Form state
const [formData, setFormData] = useState<FormData>(initialData)
const [errors, setErrors] = useState<Errors>({})
const [touched, setTouched] = useState<Touched>({})

// UI state
const [isEditing, setIsEditing] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

// Derived state
const isValid = useMemo(() => {
  return Object.keys(errors).length === 0
}, [errors])
```

### 5.8 Function Chunking

```typescript
// ❌ Yomon - Katta funksiya
const handleSubmit = async () => {
  // Validation
  if (!formData.name) {
    setError('name', 'Nom kiritilishi shart')
    return
  }
  if (!formData.email) {
    setError('email', 'Email kiritilishi shart')
    return
  }
  
  // API call
  setIsSubmitting(true)
  try {
    const response = await api.post('/organizations', formData)
    // Success handling
    toast.success('Muvaffaqiyatli saqlandi')
    router.push(`/organizations/${response.id}`)
  } catch (error) {
    // Error handling
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        setErrors(error.response.data.errors)
      } else {
        toast.error('Xatolik yuz berdi')
      }
    }
  } finally {
    setIsSubmitting(false)
  }
}

// ✅ Yaxshi - Function chunking
const validateForm = useCallback((): boolean => {
  const newErrors: Errors = {}
  
  if (!formData.name) newErrors.name = 'Nom kiritilishi shart'
  if (!formData.email) newErrors.email = 'Email kiritilishi shart'
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}, [formData])

const submitForm = useCallback(async () => {
  setIsSubmitting(true)
  try {
    const response = await api.post('/organizations', formData)
    handleSuccess(response)
  } catch (error) {
    handleError(error)
  } finally {
    setIsSubmitting(false)
  }
}, [formData])

const handleSuccess = useCallback((response: Response) => {
  toast.success('Muvaffaqiyatli saqlandi')
  router.push(`/organizations/${response.id}`)
}, [router])

const handleError = useCallback((error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 400) {
      setErrors(error.response.data.errors)
    } else {
      toast.error('Xatolik yuz berdi')
    }
  }
}, [])

const handleSubmit = useCallback(async () => {
  if (!validateForm()) return
  await submitForm()
}, [validateForm, submitForm])
```

### 5.9 Chunking Checklist

```markdown
- [ ] Kod vizual ravishda bo'shliqlar bilan ajratilgan
- [ ] Har bir chunk uchun izoh (comment) mavjud
- [ ] State'lar mantiqiy guruhlangan
- [ ] Props'lar obyekt sifatida guruhlangan
- [ ] Katta JSX bloklari sub-komponentlarga bo'lingan
- [ ] Katta funksiyalar kichik funksiyalarga bo'lingan
- [ ] Har bir chunk 7±2 elementdan oshmaydi
- [ ] Early returns ishlatilgan
- [ ] Derived state ajratilgan
```

---

## 6. Refaktoring Qoidalari

### 6.1 Refaktoringdan Oldin

1. ✅ Testlar yozilganmi? (agar mavjud bo'lsa)
2. ✅ Git branch yaratilganmi?
3. ✅ Mavjud kod tushunilganmi?
4. ✅ Refaktoring maqsadi aniqmi?

### 6.2 Refaktoring Qadamlari

```
1. Kodni tahlil qilish
   ├── Qaysi qismlar takrorlanmoqda?
   ├── Qaysi funksiyalar bog'liq emas?
   └── Qaysi state'lar ajratilishi mumkin?

2. Ajratish rejasini tuzish
   ├── Constants → lib/constants/
   ├── Utils → lib/utils/
   ├── Hooks → lib/hooks/
   └── Components → components/

3. Incremental refaktoring
   ├── Bir vaqtning o'zida bitta narsa
   ├── Har bir o'zgartirishdan keyin test
   └── Commit after each step

4. Tekshirish
   ├── TypeScript xatolar yo'qmi?
   ├── Lint xatolar yo'qmi?
   ├── Funksional test o'tdimi?
   └── Code review qilindimi?
```

### 6.3 Refaktoring Checklist

```markdown
- [ ] Constants ajratildi
- [ ] Utility funksiyalar ajratildi
- [ ] Types aniq belgilandi
- [ ] Custom hook yaratildi
- [ ] Komponentlar kichiklarga bo'lindi
- [ ] Barrel export (index.ts) yaratildi
- [ ] Import'lar yangilandi
- [ ] TypeScript xatolar yo'q
- [ ] Lint xatolar yo'q
- [ ] Funksionallik saqlanib qoldi
```

---

## 7. Hook Yozish Qoidalari

### 7.1 Hook Tuzilmasi

```typescript
/**
 * use[Domain] Hook
 * 
 * Description of what this hook does.
 * Following Single Responsibility Principle - handles only [specific logic].
 * 
 * @param param1 - Description
 * @returns Object with state and functions
 * 
 * @example
 * const { data, loading, error, fetchData } = useDomain(id)
 */

import { useState, useCallback, useEffect } from "react"

// Types
export interface HookReturn {
  data: DataType | null
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
}

export const useDomain = (id: string): HookReturn => {
  // State
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Callbacks
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch logic
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [id])

  // Effects
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    fetchData,
  }
}
```

### 7.2 Hook Qoidalari

| Qoida | Tavsif |
|-------|--------|
| `use` prefiksi | Hook nomi `use` bilan boshlanishi kerak |
| Bitta mas'uliyat | Hook faqat bitta logic'ni boshqarishi kerak |
| Return type | Aniq return type belgilanishi kerak |
| JSDoc | Hook va parametrlar tavsiflangan bo'lishi kerak |
| useCallback | Funksiyalar `useCallback` bilan o'ralgan bo'lishi kerak |

### 7.3 "Fat Hooks" Muammosi

> **Ogohlantirish:** Ko'pincha dasturchilar hamma narsani (state, fetching, handlers, validation) bitta hookka tiqib yuborishadi. Bu hook'ni sinab ko'rish (test qilish) va qayta ishlatishni qiyinlashtiradi.

#### Hook'larni Ajratish

```typescript
// ❌ Yomon - "Fat Hook" (hamma narsa bitta joyda)
export const useOrganization = (id: string) => {
  // State (5 ta)
  const [data, setData] = useState()
  const [loading, setLoading] = useState()
  const [error, setError] = useState()
  const [formData, setFormData] = useState()
  const [errors, setErrors] = useState()

  // Fetching logic
  const fetchData = async () => { /* ... */ }
  
  // Form handlers
  const handleChange = () => { /* ... */ }
  const handleSubmit = async () => { /* ... */ }
  
  // Validation
  const validate = () => { /* ... */ }
  
  // Effects
  useEffect(() => { fetchData() }, [id])
  
  return { data, loading, error, formData, errors, handleChange, handleSubmit }
}

// ✅ Yaxshi - Ajratilgan hook'lar

// 1. API hook - faqat fetching
export const useOrganizationApi = (id: string) => {
  const [data, setData] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await organizationApi.getById(id)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// 2. Form hook - faqat form state
export const useOrganizationForm = (initialData?: Organization) => {
  const [formData, setFormData] = useState<Partial<Organization>>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }, [])

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Nom kiritilishi shart"
    if (!formData.inn) newErrors.inn = "INN kiritilishi shart"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  return { formData, errors, handleChange, validate, setFormData }
}

// 3. Sahifada ishlatish
const OrganizationPage = ({ id }: Props) => {
  const { data, loading, error } = useOrganizationApi(id)
  const { formData, errors, handleChange, validate } = useOrganizationForm(data)

  const handleSubmit = async () => {
    if (!validate()) return
    await organizationApi.update(id, formData)
  }

  // ...
}
```

#### Hook Ajratish Qoidalari

| Hook turi | Mas'uliyat | Misol |
|-----------|------------|-------|
| API hook | Faqat fetching, caching | `useOrganizationApi` |
| Form hook | Form state, validation | `useOrganizationForm` |
| UI hook | UI state (modal, tabs) | `useModal`, `useTabs` |
| Domain hook | Domain logic | `useOrganizationPermissions` |

---

## 8. Constants va Utils Qoidalari

### 8.1 Constants Fayli Tuzilmasi

```typescript
/**
 * [Domain] Constants
 * 
 * This file contains all constants related to [domain].
 * Following Single Responsibility Principle - constants are separated from logic.
 */

/**
 * Plan color mappings for Badge component
 */
export const PLAN_COLORS: Record<string, string> = {
  basic: "outline",
  pro: "secondary",
  enterprise: "default",
}

/**
 * Status color mappings for Badge component
 */
export const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "secondary"> = {
  active: "success",
  trial: "warning",
  suspended: "error",
}

/**
 * Feature configuration
 * Defines which features can be toggled and their display properties
 */
export const FEATURE_CONFIG = {
  hasStudents: {
    label: "Talabalar",
    description: "Talabalar boshqaruvi",
    color: "blue",
  },
  // ...
} as const
```

### 8.2 Magic Numbers va Strings Taqiqlanadi

> **Muhim:** Kodda "magic numbers" va "magic strings" ishlatish taqiqlanadi. Barcha qiymatlar constant'larga chiqarilishi kerak.

```typescript
// ❌ Yomon - Magic number
if (status === 1) {
  // ...
}

// ❌ Yomon - Magic string
if (role === "admin") {
  // ...
}

// ❌ Yomon - Magic number (timeout)
setTimeout(() => {}, 5000)

// ✅ Yaxshi - Named constant
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  SUSPENDED: 2,
} as const

if (status === USER_STATUS.ACTIVE) {
  // ...
}

// ✅ Yaxshi - Named constant
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const

if (role === USER_ROLES.ADMIN) {
  // ...
}

// ✅ Yaxshi - Timeout constant
export const TIMEOUTS = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 10000,
} as const

setTimeout(() => {}, TIMEOUTS.TOAST_DURATION)
```

#### Qaysi Qiymatlar Constant'ga Chiqarilishi Kerak

| Tur | Misol | Joy |
|-----|-------|-----|
| Status codes | `200, 401, 404` | `constants/http.ts` |
| User roles | `"admin", "user"` | `constants/roles.ts` |
| Timeouts | `5000, 300` | `constants/timeouts.ts` |
| Limits | `MAX_ITEMS = 100` | `constants/limits.ts` |
| Colors | `"#FF0000"` | `constants/colors.ts` |
| API paths | `"/api/users"` | `constants/api.ts` |

### 8.2 Utils Fayli Tuzilmasi

```typescript
/**
 * [Domain] Utility Functions
 * 
 * This file contains utility functions for [domain]-related operations.
 * Following Single Responsibility Principle - utilities are pure functions.
 */

/**
 * Formats INN (Individual Taxpayer Number) string
 * @param inn - The INN string to format
 * @returns Formatted INN string (XXX XXX XXX) or original if invalid
 * @example
 * formatInn("123456789") // "123 456 789"
 */
export const formatInn = (inn: string): string => {
  const cleaned = inn.replace(/\D/g, "")
  if (cleaned.length !== 9) return inn
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}
```

### 8.3 Utils Qoidalari

| Qoida | Tavsif |
|-------|--------|
| Pure functions | Utils funksiyalar side effect'siz bo'lishi kerak |
| JSDoc | Har bir funksiya uchun JSDoc yozish |
| @example | Misol bilan tavsiflash |
| Type safety | Aniq tiplar belgilash |
| Single responsibility | Har bir funksiya bitta ish qilishi kerak |

---

## 9. TypeScript Qoidalari

### 9.1 Type vs Interface

```typescript
// Interface - obyektlar uchun (extend qilinadi)
export interface Organization {
  id: string
  name: string
}

// Type - union, intersection, primitive uchun
export type Status = "active" | "trial" | "suspended"
export type OrganizationWithStats = Organization & { stats: Stats }
```

### 9.2 Any Turi va Type Assertion Qoidalari

#### 9.2.1 Any Taqiqlanadi

> **Muhim:** `any` turi TypeScript'ning asosiy maqsadini yo'q qiladi - xavfsizlik. `any` ishlatish o'rniga, to'g'ri yechimni tanlang.

```typescript
// ❌ Yomon - any ishlatish
const processData = (data: any) => {
  return data.value  // Runtime error xavfi!
}

// ✅ Yaxshi - Aniq tip
interface DataType {
  value: string
}

const processData = (data: DataType) => {
  return data.value
}
```

#### 9.2.2 Unknown Turi va Type Narrowing

> **Muhim:** `unknown` + `as` (type assertion) ishlatish ham xavfli bo'lishi mumkin. Bu faqat yuzaki himoya. **To'g'ri yechim: Type Narrowing (tur toraytirish).**

```typescript
// ❌ Yomon - unknown + as (xavfsiz emas, faqat yuzaki)
const processData = (data: unknown) => {
  if (typeof data === "object" && data !== null) {
    return (data as { value: string }).value  // Xavfli! value mavjud emas bo'lishi mumkin
  }
  throw new Error("Invalid data format")
}

// ✅ Yaxshi - Type Guard funksiya
function isDataType(data: unknown): data is { value: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "value" in data &&
    typeof (data as { value: unknown }).value === "string"
  )
}

const processData = (data: unknown): string => {
  if (isDataType(data)) {
    return data.value  // TypeScript endi data.value string ekanligini biladi
  }
  throw new Error("Invalid data format: expected { value: string }")
}

// ✅ Yaxshi - Zod bilan runtime validation (tavsiya etiladi)
import { z } from "zod"

const DataSchema = z.object({
  value: z.string(),
})

const processData = (data: unknown): string => {
  const parsed = DataSchema.parse(data)  // Runtime validation + type inference
  return parsed.value
}
```

#### 9.2.3 Type Assertion (as) Qoidalari

| Holat | Ruxsat | Sabab |
|-------|--------|-------|
| Tashqi kutubxona tipi noto'g'ri | ✅ Ruxsat | Kutubxona tipi tuzatilmaydi |
| API response (backend'dan kelgan) | ❌ Taqiqlanadi | Zod/runtime validation kerak |
| DOM element | ✅ Ruxsat | `event.target as HTMLInputElement` |
| Unknown + Type Guard funksiyasi | ✅ Ruxsat | Type guard tekshiruvidan keyin |
| Unknown + `as` (to'g'ridan-to'g'ri) | ❌ Taqiqlanadi | Type Guard funksiyasi yozing |
| any'dan boshqa tipga | ❌ Taqiqlanadi | `data as any as Type` - yo'l |

```typescript
// ❌ Yomon - as ishlatib "qochish"
const user = data as any as User  // Double assertion - taqiqlanadi!

// ❌ Yomon - API response'ni as qilish
const response = await fetch("/api/users")
const users = await response.json() as User[]  // Xavfli! Runtime validation yo'q

// ✅ Yaxshi - API response uchun Zod validator
import { z } from "zod"

const UserSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
}))

const response = await fetch("/api/users")
const data = await response.json()
const users = UserSchema.parse(data)  // Runtime validation + type safety

// ✅ Yaxshi - DOM element
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value  // InputElement allaqachon tip bilan
}

// ✅ Yaxshi - Tashqi kutubxona (oxirgi chora)
import { SomeLibrary } from "external-lib"
// Kutubxona tipi noto'g'ri bo'lsa, module augmentation ishlatish
declare module "external-lib" {
  export interface SomeLibraryResult {
    correctProperty: string
  }
}
```

#### 9.2.4 Type Guard Pattern'lari

```typescript
// 1. Primitive type guard
function isString(value: unknown): value is string {
  return typeof value === "string"
}

// 2. Object type guard
interface User {
  id: string
  name: string
  email: string
}

function isUser(value: unknown): value is User {
  const obj = value as Record<string, unknown>
  return (
    typeof value === "object" &&
    value !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  )
}

// 3. Array type guard
function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser)
}

// 4. Discriminated union type guard
type Result = 
  | { success: true; data: User }
  | { success: false; error: string }

function isSuccessResult(result: Result): result is { success: true; data: User } {
  return result.success === true
}

// Foydalanish
const handleResult = (result: Result) => {
  if (isSuccessResult(result)) {
    console.log(result.data.name)  // TypeScript biladi
  } else {
    console.error(result.error)
  }
}
```

#### 9.2.5 Unknown vs Any Taqqoslash

| Xususiyat | any | unknown | Zod/Validator |
|-----------|-----|---------|---------------|
| Compile-time xavfsizlik | ❌ Yo'q | ✅ Mavjud | ✅ Mavjud |
| Runtime xavfsizlik | ❌ Yo'q | ⚠️ Qo'shimcha kod | ✅ Avtomatik |
| Type narrowing | Kerak emas | Majburiy | Avtomatik |
| IDE support | Cheklangan | To'liq | To'liq |
| Tavsiya | ❌ Taqiqlanadi | ⚠️ Ehtiyotkorlik | ✅ Tavsiya etiladi |

### 9.3 Enum Qoidalari

#### 9.3.1 Framework va Library Enum'lari

> **Muhim:** NestJS va boshqa framework'lar o'zlarining enum'laridan faol foydalanadi (masalan, `HttpStatus`, `RequestMethod`, etc.). Bu framework enum'lari **qabul qilinadi** va ular bilan ishlash majburiy.

```typescript
// ✅ Yaxshi - Framework enum'larini ishlatish
import { HttpStatus } from '@nestjs/common'

@Get()
async findAll() {
  return {
    status: HttpStatus.OK,  // Framework enum - QABUL QILINADI
    data: []
  }
}

// ✅ Yaxshi - NestJS built-in enum'lar
import { RequestMethod } from '@nestjs/common'

@Module({
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET })  // Framework enum
  }
}
```

#### 9.3.2 Custom Application Enum'lari Taqiqlanadi

> **Muhim:** **Custom (o'z yaratgan)** enum'larning o'rniga `as const` obyektlaridan foydalaning. TypeScript enum'lari runtime'da ortiqcha kod yaratadi va tree-shaking'ga xalaqit beradi.

```typescript
// ❌ Yomon - Custom enum yaratish
enum OrganizationStatus {
  Active = "active",
  Trial = "trial",
  Suspended = "suspended",
}

// Enum runtime'da bunday kod yaratadi:
// var OrganizationStatus;
// (function (OrganizationStatus) {
//   OrganizationStatus["Active"] = "active";
//   ...
// })(OrganizationStatus || (OrganizationStatus = {}));

// ✅ Yaxshi - as const obyekti
export const ORGANIZATION_STATUS = {
  ACTIVE: "active",
  TRIAL: "trial",
  SUSPENDED: "suspended",
} as const

// Type olish
export type OrganizationStatus = typeof ORGANIZATION_STATUS[keyof typeof ORGANIZATION_STATUS]

// Foydalanish
const status: OrganizationStatus = ORGANIZATION_STATUS.ACTIVE

// ✅ Yaxshi - ValueOf helper
type ValueOf<T> = T[keyof T]

type Status = ValueOf<typeof ORGANIZATION_STATUS>
```

#### 9.3.3 Enum Qoidalari Xulosasi

| Holat | Ruxsat | Sabab |
|-------|--------|-------|
| Framework enum'lari (NestJS, etc.) | ✅ Qabul qilinadi | Framework tomonidan taqdim etilgan, o'zgartirib bo'lmaydi |
| Library enum'lari | ✅ Qabul qilinadi | Tashqi kutubxona API'si |
| Custom application enum'lari | ❌ Taqiqlanadi | `as const` dan foydalaning |
| Database/Prisma enum'lari | ✅ Qabul qilinadi | Prisma schema'dan generatsiya qilinadi |

#### Enum vs as const Taqqoslash

| Xususiyat | enum | as const |
|-----------|------|----------|
| Bundle size | Katta (ortiqcha kod) | Minimal |
| Tree-shaking | To'siq | To'liq qo'llab-quvvatlash |
| Runtime | JS kod yaratadi | Faqat obyekt |
| Reverse mapping | Mavjud (string enum'da yo'q) | Yo'q |
| Type inference | O'zboshimchalik | Aniq |

### 9.4 Export Type

```typescript
// Type export qilish
export type { Organization, OrganizationStats }

// Value export qilish
export { formatInn, formatDate }

// Hammasini export qilish
export * from "./types"
```

---

## 10. API va Service Qoidalari

### 10.1 API Client va Token Boshqaruvi

> **Muhim:** Har bir API funksiyaga `token` argument sifatida uzatish "Prop Drilling" muammosini keltirib chiqaradi. Token boshqaruvi API Client (interceptor) darajasida amalga oshirilishi kerak.

> **E'tibor:** Next.js App Router'da Server Components va Client Components uchun turli xil API client'lar kerak. `window` va `localStorage` serverda mavjud emas!

#### Client-Side API Client

```typescript
// lib/api/client.ts
import axios from "axios"
import { getAuthToken, clearAuth } from "@/lib/auth"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - Token avtomatik qo'shish
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken() // localStorage'dan
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      // Client-side redirect
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
```

#### Server-Side API Client

```typescript
// lib/api/server-client.ts
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const createServerClient = () => {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  return axios.create({
    baseURL: process.env.API_URL, // NEXT_PUBLIC_ yo'q!
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
}

// Server action misoli
export async function getOrganization(id: string) {
  const client = createServerClient()
  
  try {
    const response = await client.get(`/api/colleges/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/login") // Server-side redirect
    }
    throw error
  }
}
```

#### Environment Variables

```env
# .env.local
# Client-side (NEXT_PUBLIC_ prefiksi bilan)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server-side only (NEXT_PUBLIC_ yo'q)
API_URL=http://localhost:3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

#### API Module Tuzilmasi

```typescript
// lib/api/organization.ts
import { apiClient } from "./client"
import type { Organization, OrganizationStats } from "@/types"

const BASE_PATH = "/api/colleges"

export const organizationApi = {
  /**
   * Get organization by ID
   * Token avtomatik qo'shiladi (interceptor orqali)
   */
  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`${BASE_PATH}/${id}`)
    return response.data
  },

  /**
   * Update organization
   */
  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.patch(`${BASE_PATH}/${id}`, data)
    return response.data
  },

  /**
   * Get organization stats
   */
  getStats: async (id: string): Promise<OrganizationStats> => {
    const response = await apiClient.get(`${BASE_PATH}/${id}/stats`)
    return response.data
  },
}
```

#### Komponentda Ishlatish

```typescript
// ❌ Yomon - Tokenni qo'lda uzatish
const { token } = useAuth()
const organization = await organizationApi.getById(token, id)

// ✅ Yaxshi - Token avtomatik
const organization = await organizationApi.getById(id)
```

### 10.2 Error Handling

```typescript
// API error handling
try {
  const data = await organizationApi.getById(id)  // Token avtomatik (interceptor)
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      // Handle not found
    } else if (error.response?.status === 401) {
      // Handle unauthorized
    }
  }
  console.error("Failed to fetch organization:", error)
}
```

---

## 11. Code Review Checklist

Har bir Pull Request'da quyidagilar tekshiriladi:

### 11.1 Umumiy

- [ ] Kod uslubiy qoidalarga mos keladi
- [ ] TypeScript xatolar yo'q
- [ ] ESLint xatolar yo'q
- [ ] Console.log'lar olib tashlangan

### 11.2 Arxitektura

- [ ] SOLID tamoyillari bajarilgan
- [ ] DRY tamoyili bajarilgan
- [ ] Komponent hajmi chegaradan oshmagan (page.tsx: 150-200 qator)
- [ ] Modullarga to'g'ri ajratilgan
- [ ] Barrel export'lar to'g'ri ishlatilgan (cross-module emas)

### 11.3 TypeScript

- [ ] `any` turi ishlatilmagan
- [ ] Type Assertion (`as`) faqat zarur hollarda ishlatilgan
- [ ] Barcha tiplari aniq belgilangan
- [ ] Interface'lar to'g'ri nomlangan
- [ ] Type export'lari to'g'ri

### 11.4 Performance

- [ ] Keraksiz re-render'lar yo'q
- [ ] useCallback faqat kerak joylarda ishlatilgan
- [ ] useMemo faqat kerak joylarda ishlatilgan
- [ ] Large list'larda virtualization
- [ ] Barcha rasmlar next/image bilan

### 11.5 Xavfsizlik

- [ ] Sensitive ma'lumotlar client'da yo'q
- [ ] API token'lar to'g'ri saqlangan
- [ ] Input validation mavjud
- [ ] XSS himoyasi mavjud

### 11.6 Accessibility

- [ ] Barcha rasmlarda ma'noli `alt` attribute
- [ ] Icon button'larda `aria-label` mavjud
- [ ] Semantic HTML ishlatilgan (`<button>`, `<nav>`, `<main>`)
- [ ] Klaviatura navigatsiyasi ishlaydi

### 11.7 Error Handling

- [ ] Har bir modulda `error.tsx` mavjud
- [ ] User-friendly error messages
- [ ] Error'lar logging service'ga yuboriladi

---

### 11.8 Avtomatik Tekshirish (ESLint)

> **Muhim:** Qoidalarni faqat hujjatda yozish yetarli emas. ESLint qoidalari bilan avtomatik tekshirish majburiy. Bu code review vaqtini tejaydi va inson xatosini kamaytiradi.

### 11.8.1 ESLint Konfiguratsiyasi

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // TypeScript - any taqiqlash
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    
    // Custom enum taqiqlash (framework enum'lari ruxsat)
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration',
        message: 'Custom enum taqiqlangan. "as const" obyektidan foydalaning. Framework enum\'lari (NestJS, Prisma) ruxsat etiladi.',
      },
    ],
    
    // Type assertion cheklash
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
    ],
    
    // React hooks
    'react-hooks/exhaustive-deps': 'warn',
    
    // Console.log taqiqlash (production)
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Magic numbers
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2] }],
  },
}
```

### 11.8.2 Pre-commit Hooks

```bash
# .husky/pre-commit
npm run lint
npm run type-check
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### 11.8.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
```

### 11.8.4 ESLint Qoidalari va Hujjat Bog'liqligi

| ESLint Qoidasi | Hujjat Bo'limi | Qoida |
|----------------|----------------|-------|
| `@typescript-eslint/no-explicit-any` | 9.2.1 Any Taqiqlanadi | `any` taqiqlangan |
| `no-restricted-syntax` (TSEnumDeclaration) | 9.3.2 Custom Enum Taqiqlanadi | Custom enum taqiqlangan |
| `@typescript-eslint/consistent-type-assertions` | 9.2.3 Type Assertion Qoidalari | `as` cheklangan |
| `react-hooks/exhaustive-deps` | 22.2 Memoization Qoidalari | Dependency array to'liq |
| `no-console` | 11.1 Umumiy | Console.log taqiqlangan |

---

### 11.9 Jamoa Kelishuvi Jarayoni

> **Muhim:** Standartlar hujjati faqat yozilishi emas, jamoa tomonidan qabul qilinishi muhim. Quyidagi jarayon tavsiya etiladi:

### 11.9.1 Yangi Qoida Qo'shish Jarayoni

```
1. Taklif berish
   └── GitHub Discussion / Team meeting da muammo va yechimni taqdim etish

2. Muhokama
   └── Jamoa a'zolari fikr bildirish (3-5 kun)

3. Konsensus
   └── Kamida 70% rozilik olish

4. Hujjatga qo'shish
   └── PR orqali qo'shish, review'dan o'tkazish

5. ESLint qoidasi qo'shish
   └── Agar avtomatik tekshirish mumkin bo'lsa

6. Jamoaga xabar berish
   └── Slack/Email orqali yangi qoida haqida xabar
```

### 11.9.2 Mavjud Qoidani O'zgartirish

```
1. Sababni yozish
   └── Nega o'zgartirish kerak? (masalan, amaliy emas, ziddiyat bor)

2. Alternativ yechim
   └── Qanday yechim taklif qilinadi?

3. Jamoa roziligi
   └── O'zgartirish uchun rozilik olish

4. Hujjatni yangilash
   └── O'zgarishlar tarixiga qo'shish
```

### 11.9.3 Code Review da Qoidalarni Tekshirish

```markdown
## Code Review Template

### TypeScript
- [ ] `any` ishlatilmagan (ESLint: @typescript-eslint/no-explicit-any)
- [ ] Custom enum ishlatilmagan (ESLint: no-restricted-syntax)
- [ ] Type assertion faqat zarur hollarda

### React
- [ ] useCallback faqat React.memo child yoki dependency array uchun
- [ ] useMemo faqat murakkab hisoblash uchun

### Xavfsizlik
- [ ] Sensitive ma'lumotlar yo'q
- [ ] Input validation mavjud
```

---

## 12. Xavfsizlik (Security) Qoidalari

> **Muhim:** Kod yozish jarayonida xavfsizlik "keyinchalik" qilinadigan ish emas, balki kodning ajralmas qismi bo'lishi shart.

### 12.1 Frontend Xavfsizligi

| Xavf turi | Tavsif | Himoya usuli |
|-----------|--------|--------------|
| XSS (Cross-Site Scripting) | Zararli skriptlarni JSX ichiga joylash | `dangerouslySetInnerHTML` dan qat'iyan foydalanmaslik. Zarur bo'lsa, `dompurify` bilan tozalash |
| Sensitive Data Exposure | Maxfiy ma'lumotlarni kodda qoldirish | `.env` fayllarni Git'ga yuklamaslik. API kalitlarini faqat server-side (`process.env`) da saqlash |
| Broken Access Control | Ruxsat etilmagan sahifalarga kirish | Middleware darajasida RBAC (Role Based Access Control) tekshiruvini o'rnatish |

#### 12.1.1 XSS Himoyasi

```tsx
// ❌ Yomon - dangerouslySetInnerHTML ishlatish
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Yaxshi - Sanitize qilish
import DOMPurify from "dompurify"

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Yaxshi - Oddiy text sifatida
<div>{userInput}</div>
```

#### 12.1.2 Sensitive Ma'lumotlar

> **Muhim:** Hech qachon sensitive ma'lumotlarni client-side'da saqlamang!

```typescript
// ❌ Yomon - localStorage'da token saqlash
localStorage.setItem("token", token)

// ❌ Yomon - console.log'da sensitive ma'lumot
console.log("User password:", password)
console.log("API Key:", apiKey)

// ✅ Yaxshi - HttpOnly cookie (server tomonidan)
// Backend'da:
res.cookie("token", token, {
  httpOnly: true,  // JavaScript'dan kirish mumkin emas
  secure: true,    // HTTPS only
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

// ✅ Yaxshi - Environment variables (server-side)
const apiKey = process.env.API_KEY
```

#### 12.1.3 URL va Query Parameters

```typescript
// ❌ Yomon - URL'da sensitive ma'lumot
router.push(`/reset-password?token=${resetToken}`)

// ✅ Yaxshi - POST body orqali
await fetch("/api/reset-password", {
  method: "POST",
  body: JSON.stringify({ token: resetToken }),
})

// ✅ Yaxshi - URL parametrlarni encode qilish
const searchQuery = encodeURIComponent(userInput)
router.push(`/search?q=${searchQuery}`)
```

### 12.2 Backend va API Xavfsizligi

| Xavf turi | Tavsif | Himoya usuli |
|-----------|--------|--------------|
| Input Validation | Foydalanuvchi ma'lumotiga ishonish | Har bir DTO yoki API so'rovi qat'iy tekshirilishi shart |
| Rate Limiting | DDoS hujumlari | Bir xil IP'dan kelayotgan so'rovlar sonini cheklash |
| Sensitive Data in Logs | Loglarda maxfiy ma'lumotlar | Loglarda parollar, tokenlar saqlanmasligi kerak |

#### 12.2.1 Frontend Validation

```typescript
// Zod schema bilan validation
const UserInputSchema = z.object({
  email: z.string().email("Noto'g'ri email format"),
  phone: z.string().regex(/^\+998\d{9}$/, "Noto'g'ri telefon format"),
  inn: z.string().length(9, "INN 9 ta raqamdan iborat bo'lishi kerak"),
  password: z.string()
    .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
    .regex(/[A-Z]/, "Kamida 1 ta katta harf")
    .regex(/[0-9]/, "Kamida 1 ta raqam"),
})
```

#### 12.2.2 Backend Validation (NestJS)

```typescript
// DTO bilan validation
import { IsString, IsEmail, MinLength, Matches } from "class-validator"

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/)
  password: string
}

// Controller
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // DTO avtomatik validate qilinadi
}
```

### 12.3 No Sensitive Data in Logs

> **Muhim:** Loglarda hech qachon foydalanuvchi parollari, tokenlar yoki shaxsiy ma'lumotlar saqlanmasligi kerak.

```typescript
// ❌ Yomon - Sensitive ma'lumotlar logda
console.log("User login:", { email, password })
logger.info("API request:", { token, apiKey })

// ✅ Yaxshi - Maskalangan ma'lumotlar
console.log("User login:", { email: maskEmail(email) })
logger.info("API request:", { token: "***masked***" })

// Helper function
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@")
  return `${local.slice(0, 2)}***@${domain}`
}
```

### 12.4 Authentication va Authorization

#### 12.4.1 JWT Token Boshqaruvi

```typescript
// ✅ Yaxshi - Token refresh mexanizmi
// lib/auth/refresh.ts
export const refreshToken = async () => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // HttpOnly cookie
    })
    
    if (!response.ok) {
      throw new Error("Refresh failed")
    }
    
    return response.json()
  } catch (error) {
    // Refresh ham ishlamasa -> login'ga yo'naltirish
    window.location.href = "/login"
  }
}

// API interceptor'da ishlatish
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      await refreshToken()
      return apiClient(originalRequest)
    }
    
    return Promise.reject(error)
  }
)
```

#### 12.4.2 Role-based Access Control (RBAC)

```typescript
// Backend'da role check
import { Roles } from "../auth/roles.decorator"
import { RolesGuard } from "../auth/roles.guard"

@Controller("organizations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  @Get()
  @Roles("admin", "manager")
  findAll() {
    // Faqat admin va manager ko'ra oladi
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: string) {
    // Faqat admin o'chira oladi
  }
}

// Frontend'da role check
const canDelete = user.role === "admin"
const canEdit = ["admin", "manager"].includes(user.role)

{canDelete && <Button onClick={handleDelete}>O'chirish</Button>}
```

### 12.5 API Security

#### 12.5.1 Rate Limiting

```typescript
// Backend'da rate limiting
import { Throttle } from "@nestjs/throttler"

@Controller("auth")
export class AuthController {
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1 daqiqada 5 ta urinish
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
```

#### 12.5.2 CORS Configuration

```typescript
// Backend'da CORS
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
```

#### 12.5.3 Security Headers

```typescript
// Backend'da security headers
import helmet from "@nestjs/platform-express"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.use(helmet()) // Security headers
  
  // yoki maxsus headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("X-XSS-Protection", "1; mode=block")
    res.setHeader("Content-Security-Policy", "default-src 'self'")
    next()
  })
}
```

### 12.6 Database Security

#### 12.6.1 SQL Injection Himoyasi

```typescript
// ❌ Yomon - Raw query (SQL injection xavfi)
const query = `SELECT * FROM users WHERE id = ${userId}`

// ✅ Yaxshi - Prisma parameterized query
const user = await prisma.user.findUnique({
  where: { id: userId },
})

// ✅ Yaxshi - Prisma.raw bilan parameterized
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`
```

#### 12.6.2 Sensitive Data Filtering

```typescript
// ❌ Yomon - Parolni qaytarish
const user = await prisma.user.findUnique({ where: { id } })
return user // password ham qaytadi!

// ✅ Yaxshi - Select bilan faqat kerakli maydonlar
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // password yo'q!
  },
})

// ✅ Yaxshi - Response'dan filter qilish
const { password, ...userWithoutPassword } = user
return userWithoutPassword
```

### 12.7 Security Checklist

```markdown
### Frontend
- [ ] XSS himoyasi (dangerouslySetInnerHTML dan qochish)
- [ ] Sensitive ma'lumotlar localStorage'da yo'q
- [ ] Console.log'da sensitive ma'lumotlar yo'q
- [ ] URL'da sensitive ma'lumotlar yo'q
- [ ] Input validation (Zod)
- [ ] CSRF token (agar kerak bo'lsa)

### Backend
- [ ] JWT token httpOnly cookie'da
- [ ] Rate limiting sozlangan
- [ ] CORS to'g'ri sozlangan
- [ ] Security headers (helmet)
- [ ] Input validation (class-validator)
- [ ] SQL injection himoyasi (Prisma)
- [ ] Role-based access control
- [ ] Password hashing (bcrypt)
- [ ] Sensitive data filtering
- [ ] Loglarda sensitive ma'lumotlar yo'q

### Infrastructure
- [ ] HTTPS majburiy
- [ ] Environment variables .env'da
- [ ] .env git'ga kiritilmagan
- [ ] Database backup
- [ ] Error logging (Sentry)
```

---

## 13. Server va Client API Farqlari (Next.js)

> **Muhim:** Next.js App Router'da API so'rovlari ikki xil muhitda amalga oshiriladi. Server Components va Client Components uchun turli xil yondashuvlar kerak.

### 13.1 Server Components (RSC)

Serverda tokenlarni cookie'dan olish va `window` obyekti yo'qligini hisobga olish kerak.

```typescript
// ✅ Server-side fetch (page.tsx)
import { cookies } from "next/headers"

async function OrganizationPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")
  
  // To'g'ridan-to'g'ri server fetch
  const response = await fetch(`${process.env.API_URL}/colleges/${params.id}`, {
    headers: { 
      Authorization: `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // yoki "force-cache"
  })
  
  if (!response.ok) {
    // Server-side redirect
    redirect("/login")
  }
  
  const data = await response.json()
  return <OrganizationView data={data} />
}
```

### 13.2 Client Components

Client'da `apiClient` (axios) interceptorlaridan foydalanish ruxsat etiladi.

```typescript
// ✅ Client-side fetch
"use client"

import { apiClient } from "@/lib/api/client"
import { useEffect, useState } from "react"

export function OrganizationList() {
  const [organizations, setOrganizations] = useState([])
  
  useEffect(() => {
    apiClient.get("/colleges").then(res => setOrganizations(res.data))
  }, [])
  
  return <div>{/* render */}</div>
}
```

### 13.3 Taqiqlar

> **Qat'iyan taqiqlanadi:** Hech qachon Client-side API kalitlarini (`API_SECRET`, `JWT_SECRET`) `NEXT_PUBLIC_` prefiksi bilan eksport qilmang!

```env
# ❌ Yomon - Client ko'ra oladi
NEXT_PUBLIC_API_SECRET=secret123
NEXT_PUBLIC_JWT_SECRET=jwt-secret

# ✅ Yaxshi - Server-side only
API_SECRET=secret123
JWT_SECRET=jwt-secret

# ✅ Yaxshi - Client ko'rish mumkin
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=EduStatus
```

---

## 14. API Contract Testing (Zod)

### 14.1 API Response Validation - Majburiy

> **Muhim:** TypeScript tiplari faqat compile-time'da ishlaydi. Backend'dan kelayotgan ma'lumotning to'g'riligiga runtime'da kafolat yo'q. Barcha API response'lar **Zod sxemasi** orqali validatsiya qilinishi shart.

```typescript
// ❌ Yomon - Type assertion (runtime'da tekshirilmaydi)
const response = await fetch("/api/organizations")
const data = await response.json() as Organization[]

// ✅ Yaxshi - Zod bilan runtime validation
import { z } from "zod"

// Schema yaratish
const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  inn: z.string().length(9),
  status: z.enum(["active", "trial", "suspended"]),
  createdAt: z.string().datetime(),
})

const OrganizationArraySchema = z.array(OrganizationSchema)

// API'da ishlatish
const response = await fetch("/api/organizations")
const data = await response.json()
const organizations = OrganizationArraySchema.parse(data) // Runtime validation!

// Endi organizations turi avtomatik: z.infer<typeof OrganizationSchema>[]
```

### 14.2 API Client bilan Zod

```typescript
// lib/api/organization.ts
import { z } from "zod"
import { apiClient } from "./client"

// Schemas
const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  inn: z.string().length(9),
  status: z.enum(["active", "trial", "suspended"]),
})

const OrganizationListSchema = z.array(OrganizationSchema)

// Types (schema'dan olingan)
type Organization = z.infer<typeof OrganizationSchema>

export const organizationApi = {
  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/api/colleges/${id}`)
    return OrganizationSchema.parse(response.data) // Validate!
  },

  getAll: async (): Promise<Organization[]> => {
    const response = await apiClient.get("/api/colleges")
    return OrganizationListSchema.parse(response.data) // Validate!
  },
}
```

### 14.3 Safe Parse (Error Handling)

> **Muhim:** `parse()` va `safeParse()` ning farqi muhim. Agent uchun aniq qoida:

| Method | Qachon ishlatish | Xato boshqaruvi |
|--------|------------------|-----------------|
| `parse()` | Hook/component ichida | Exception otadi, Error Boundary tutadi |
| `safeParse()` | API middleware, server action | Manual error handling |

```typescript
// ✅ Yaxshi - parse() hook/component ichida
const useOrganization = (id: string) => {
  const [data, setData] = useState<Organization | null>(null)
  
  useEffect(() => {
    apiClient.get(`/organizations/${id}`)
      .then(res => setData(OrganizationSchema.parse(res.data)))  // Exception otadi
      .catch(err => console.error(err))  // Error Boundary tutadi
  }, [id])
  
  return { data }
}

// ✅ Yaxshi - safeParse() API middleware'da
export async function validateRequest(request: Request) {
  const body = await request.json()
  const result = OrganizationSchema.safeParse(body)
  
  if (!result.success) {
    // Manual error handling
    return Response.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    )
  }
  
  // result.data endi xavfsiz
  return result.data
}

// ❌ Yomon - parse() server action'da (exception tashlaydi)
export async function createOrganization(formData: FormData) {
  const data = OrganizationSchema.parse(formData)  // Xato bo'lsa, butun action crash
  // ...
}

// ✅ Yaxshi - safeParse() server action'da
export async function createOrganization(formData: FormData) {
  const result = OrganizationSchema.safeParse(formData)
  
  if (!result.success) {
    return { error: result.error.issues }  // User-friendly error
  }
  
  // result.data bilan davom eting
  await db.organization.create({ data: result.data })
  return { success: true }
}
```

---

## 15. Form Management Standarti

### 15.1 react-hook-form + Zod - Majburiy

> **Muhim:** Loyihada barcha formalar `react-hook-form` + `zodResolver` kombinatsiyasi bilan yozilishi shart. Bu bir xil form yozish uslubini ta'minlaydi.

```typescript
// ❌ Yomon - useState bilan form
const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [errors, setErrors] = useState({})

const handleSubmit = () => {
  const newErrors = {}
  if (!name) newErrors.name = "Nom kiritilishi shart"
  if (!email) newErrors.email = "Email kiritilishi shart"
  setErrors(newErrors)
  // ...
}

// ✅ Yaxshi - react-hook-form + zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Schema
const organizationFormSchema = z.object({
  name: z.string().min(1, "Nom kiritilishi shart"),
  inn: z.string().length(9, "INN 9 ta raqamdan iborat bo'lishi kerak"),
  email: z.string().email("Noto'g'ri email format"),
  phone: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationFormSchema>

// Component
export function OrganizationForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      inn: "",
      email: "",
    },
  })

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <form onSubmit={onFormSubmit}>
      <div>
        <Input {...register("name")} placeholder="Tashkilot nomi" />
        {errors.name && <p className="text-destructive">{errors.name.message}</p>}
      </div>
      
      <div>
        <Input {...register("inn")} placeholder="INN" />
        {errors.inn && <p className="text-destructive">{errors.inn.message}</p>}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </form>
  )
}
```

### 15.2 Form Component Tuzilmasi

```
features/organization-create/
├── ui/
│   ├── OrganizationForm.tsx      # Asosiy form
│   ├── FormFields.tsx            # Input maydonlari
│   └── index.ts
├── schema.ts                     # Zod schema
├── types.ts                      # TypeScript types
└── hooks/
    └── useOrganizationForm.ts    # Form logic (ixtiyoriy)
```

---

## 16. Testing Standartlari

### 16.1 Test Turlari

| Test turi | Maqsad | Joylashuv |
|-----------|--------|-----------|
| Unit test | Funksiyalar/komponentlar | `__tests__/unit/` |
| Integration test | API va modullar | `__tests__/integration/` |
| E2E test | Foydalanuvchi senariylari | `e2e/` |

### 16.2 Unit Test Yozish Qoidalari

```typescript
/**
 * Unit test example for utility functions
 * Following AAA pattern: Arrange, Act, Assert
 */

import { describe, it, expect } from "vitest"
import { formatInn, formatPhone, formatCurrency } from "@/lib/utils"

describe("formatInn", () => {
  it("should format 9-digit INN correctly", () => {
    // Arrange
    const input = "123456789"
    const expected = "123 456 789"
    
    // Act
    const result = formatInn(input)
    
    // Assert
    expect(result).toBe(expected)
  })

  it("should return original string for invalid INN", () => {
    expect(formatInn("123")).toBe("123")
    expect(formatInn("abcdefghi")).toBe("abcdefghi")
  })
})
```

### 16.3 Komponent Test Qoidalari

```typescript
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { OrganizationCard } from "./OrganizationCard"

describe("OrganizationCard", () => {
  const mockOrganization = {
    id: "1",
    name: "Test Organization",
    type: "college",
    status: "active",
  }

  it("should render organization name", () => {
    render(<OrganizationCard organization={mockOrganization} />)
    expect(screen.getByText("Test Organization")).toBeInTheDocument()
  })

  it("should call onSelect when clicked", async () => {
    const onSelect = vi.fn()
    render(<OrganizationCard organization={mockOrganization} onSelect={onSelect} />)
    
    await userEvent.click(screen.getByRole("button", { name: /tanlash/i }))
    
    expect(onSelect).toHaveBeenCalledWith("1")
  })
})
```

### 16.4 Test Nomlash Konvensiyalari

| Pattern | Misol |
|---------|-------|
| `should_[expected_behavior]` | `should render organization name` |
| `when_[condition]_should_[behavior]` | `when loading should show spinner` |
| `given_[context]_when_[action]_then_[result]` | `given empty form when submit then show error` |

### 16.5 Test Coverage Talablari

| Tur | Minimal Coverage |
|-----|------------------|
| Utility functions | 90% |
| Hooks | 80% |
| Components | 70% |
| Pages | 50% |

---

## 17. Git Commit Konvensiyalari

### 17.1 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 17.2 Commit Turlari

| Type | Tavsif | Misol |
|------|--------|-------|
| `feat` | Yangi feature | `feat(auth): add password reset functionality` |
| `fix` | Bug tuzatish | `fix(api): handle null response in organization endpoint` |
| `refactor` | Kod takomillashtirish | `refactor(hooks): extract common logic to useOrganizationData` |
| `style` | Format o'zgartirish | `style: format code with prettier` |
| `docs` | Hujjat yangilash | `docs: update API documentation` |
| `test` | Test qo'shish | `test(utils): add tests for formatInn function` |
| `chore` | Boshqa o'zgartirishlar | `chore: update dependencies` |
| `perf` | Performance yaxshilash | `perf(list): implement virtualization for large lists` |

### 17.3 Scope Misollari

```
feat(auth): add OAuth2 login
fix(organizations): resolve pagination issue
refactor(hooks): simplify useOrganizationData
style(dashboard): improve responsive layout
docs(api): add endpoint examples
test(utils): add formatCurrency tests
```

### 17.4 Breaking Changes

```
feat(api)!: change organization endpoint response format

BREAKING CHANGE: Organization API now returns nested object structure.
Migration guide: Update all API consumers to use `data.organization` instead of `data`.
```

### 17.5 Branch Naming

> **Majburiy:** Branch nomiga Jira/Trello task raqamini qo'shish shart. Bu jamoaviy ishlashda qaysi taskka tegishli ekanini bilishga yordam beradi.

| Branch turi | Format | Misol |
|-------------|--------|-------|
| Feature | `feat/<task-id>-<description>` | `feat/EDU-123-password-reset` |
| Bugfix | `fix/<task-id>-<description>` | `fix/EDU-456-login-validation` |
| Hotfix | `hotfix/<task-id>-<description>` | `hotfix/EDU-789-critical-security` |
| Release | `release/<version>` | `release/v1.2.0` |

#### Branch Naming Misollari

```bash
# ✅ Yaxshi - Task ID bilan
feat/EDU-123-add-oauth-login
fix/EDU-456-resolve-pagination-issue
hotfix/EDU-789-fix-payment-calculation

# ❌ Yomon - Task ID siz
feature/password-reset
fix/login-bug
hotfix/urgent-fix
```

### 17.6 Commit Message da Task ID

Commit message'da ham task ID bo'lishi tavsiya etiladi:

```
feat(auth): add OAuth2 login

EDU-123: Implement Google OAuth2 authentication
- Add Google OAuth button
- Handle callback
- Store user session

Closes #123
```

---

## 18. Environment Variables Qoidalari

### 18.1 Frontend Environment Variables

```env
# .env.local (git'ga kiritilmaydi)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=EduStatus

# Server-side only (NEXT_PUBLIC_ yo'q)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

### 18.2 Backend Environment Variables

```env
# .env (git'ga kiritilmaydi)
DATABASE_URL=postgresql://user:password@localhost:5432/edustatus
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# External services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=smtp-password

# Payment gateway
PAYMENT_API_KEY=payment-api-key
PAYMENT_MERCHANT_ID=merchant-id
```

### 18.3 Environment Variables Qoidalari

| Qoida | Tavsif |
|-------|--------|
| `.env.example` | Barcha o'zgaruvchilar ro'yxati (qiymatsiz) |
| `.env` | Git'ga kiritilmaydi (.gitignore) |
| `NEXT_PUBLIC_` | Client-side ko'rinadi |
| Server-side | `NEXT_PUBLIC_` prefiksisiz |
| Validation | Startup'da validate qilish |

### 18.4 Environment Validation

```typescript
// backend/src/config/env.ts
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
```

---

## 19. Accessibility (a11y) Qoidalari

### 19.1 Asosiy Qoidalar

| Qoida | Tavsif | Misol |
|-------|--------|-------|
| Semantic HTML | To'g'ri HTML elementlari | `<button>` emas `<div onClick>` |
| ARIA labels | Interaktiv elementlar uchun | `aria-label="Close modal"` |
| Keyboard navigation | Barcha elementlar klaviatura orqali | `tabIndex`, `onKeyDown` |
| Color contrast | WCAG AA standarti | 4.5:1 ratio |
| Focus indicators | Ko'rinadigan focus | `focus:ring-2` |

### 19.2 Semantic HTML - Majburiy Qoidalar

```tsx
// ❌ Yomon - div bilan button
<div onClick={handleClick}>Click me</div>

// ✅ Yaxshi - Semantic button
<button onClick={handleClick}>Click me</button>

// ❌ Yomon - div bilan navigation
<div className="nav">
  <div onClick={goHome}>Home</div>
</div>

// ✅ Yaxshi - Semantic navigation
<nav>
  <a href="/">Home</a>
</nav>

// ❌ Yomon - div bilan main content
<div className="main">
  <div className="article">...</div>
</div>

// ✅ Yaxshi - Semantic structure
<main>
  <article>...</article>
</main>
```

#### Semantic HTML Elementlari

| Element | Foydalanish |
|---------|-------------|
| `<main>` | Asosiy kontent |
| `<nav>` | Navigatsiya |
| `<header>` | Sahifa/section header |
| `<footer>` | Sahifa/section footer |
| `<article>` | Mustaqil kontent |
| `<section>` | Mantiqiy bo'lim |
| `<aside>` | Qo'shimcha ma'lumot |
| `<button>` | Interaktiv tugma |
| `<a>` | Havola |

### 19.3 Alt Text - Majburiy Qoida

```tsx
// ❌ Yomon - Alt yo'q
<img src="/logo.png" />

// ❌ Yomon - Noma'lum alt
<img src="/logo.png" alt="image" />

// ✅ Yaxshi - Ma'noli alt
<img src="/logo.png" alt="EduStatus kompaniyasi logotipi" />

// ✅ Yaxshi - next/image bilan
import Image from "next/image"

<Image
  src="/logo.png"
  alt="EduStatus kompaniyasi logotipi"
  width={200}
  height={100}
/>

// Dekorativ rasmlar uchun bo'sh alt
<img src="/decoration.png" alt="" role="presentation" />
```

### 19.4 ARIA Labels - Majburiy Qoida

> **Muhim:** Faqat ikonkalardan iborat tugmalarda `aria-label` bo'lishi **majburiy**.

```tsx
// ❌ Yomon - Icon button da aria-label yo'q
<button onClick={handleClose}>
  <X className="h-4 w-4" />
</button>

// ✅ Yaxshi - aria-label bilan
<button onClick={handleClose} aria-label="Yopish">
  <X className="h-4 w-4" />
</button>

// ✅ Yaxshi - aria-label bilan (inglizcha)
<button onClick={handleClose} aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

### 19.5 ARIA Attributes Misollari

```tsx
// ✅ Yaxshi - ARIA bilan
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>

// ✅ Yaxshi - Form validation
<input
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert">
    {errors.email.message}
  </p>
)}
```

### 19.6 Keyboard Navigation

```tsx
// ✅ Yaxshi - Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault()
      handleSelect()
      break
    case "Escape":
      handleClose()
      break
    case "ArrowDown":
      focusNext()
      break
    case "ArrowUp":
      focusPrevious()
      break
  }
}

<div
  role="listbox"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  aria-activedescendant={activeId}
>
  {items.map(item => (
    <div
      key={item.id}
      role="option"
      id={item.id}
      aria-selected={item.id === selectedId}
    >
      {item.label}
    </div>
  ))}
</div>
```

### 19.7 Accessibility Checklist

```markdown
- [ ] Barcha rasmlarda `alt` attribute
- [ ] Form elementlarida `label` bog'langan
- [ ] Xabarlar uchun `role="alert"` ishlatilgan
- [ ] Modal oynalar `aria-modal="true"` bilan
- [ ] Skip navigation link mavjud
- [ ] Focus trap modal'larda ishlaydi
- [ ] Color contrast WCAG AA ga mos
- [ ] Barcha interaktiv elementlar klaviatura orqali ishlaydi
```

---

## 20. Xatolarni Boshqarish (Error Handling)

### 20.1 Global Error Boundary - Next.js

> **Majburiy:** Har bir modul uchun alohida `error.tsx` fayli bo'lishi kerak. Bu Next.js App Router'ning built-in error handling mexanizmi.

#### Modul Error Boundary

```
app/
├── error.tsx                    # Root error boundary
├── cabinet/
│   ├── error.tsx               # Cabinet moduli uchun
│   └── organization/
│       ├── error.tsx           # Organization moduli uchun
│       └── [id]/
│           └── error.tsx       # Organization detail uchun
└── dashboard/
    └── error.tsx               # Dashboard moduli uchun
```

#### Error Boundary Component

```tsx
// app/cabinet/organization/[id]/error.tsx
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function OrganizationError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Error'ni logging service'ga yuborish
    console.error("Organization page error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Tashkilot ma'lumotlarini yuklab bo'lmadi</h2>
      <p className="text-muted-foreground">
        Iltimos, keyinroq qaytadan urinib ko'ring
      </p>
      <Button onClick={reset}>Qaytadan urinish</Button>
    </div>
  )
}
```

### 20.2 User-Friendly Error Messages

> **Muhim:** Foydalanuvchiga texnik xatolarni emas, tushunarli xabarlarni ko'rsatish kerak.

```typescript
// lib/errors/messages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  UNAUTHORIZED: "Tizimga kirish talab qilinadi",
  INVALID_CREDENTIALS: "Login yoki parol noto'g'ri",
  SESSION_EXPIRED: "Sessiya muddati tugadi. Qaytadan kiring",
  
  // Network errors
  NETWORK_ERROR: "Internet aloqasi yo'q. Qaytadan urinib ko'ring",
  TIMEOUT: "So'rov vaqti tugadi. Qaytadan urinib ko'ring",
  
  // Validation errors
  VALIDATION_ERROR: "Ma'lumotlar noto'g'ri kiritildi",
  REQUIRED_FIELD: "Bu maydon to'ldirilishi shart",
  
  // Not found
  NOT_FOUND: "Ma'lumot topilmadi",
  ORGANIZATION_NOT_FOUND: "Tashkilot topilmadi",
  
  // Server errors
  INTERNAL_ERROR: "Server xatosi. Keyinroq urinib ko'ring",
  SERVICE_UNAVAILABLE: "Xizmat vaqtincha mavjud emas",
}

// Helper function
export const getUserFriendlyMessage = (code: string): string => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR
}
```

### 20.3 Frontend Error Handling

```tsx
// Error Boundary Component
"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    // Sentry, LogRocket ga yuborish
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 20.4 API Error Handling

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    
    switch (status) {
      case 400:
        throw new ApiError(status, "Noto'g'ri ma'lumot", "BAD_REQUEST")
      case 401:
        throw new ApiError(status, "Avtorizatsiya talab qilinadi", "UNAUTHORIZED")
      case 403:
        throw new ApiError(status, "Ruxsat yo'q", "FORBIDDEN")
      case 404:
        throw new ApiError(status, "Topilmadi", "NOT_FOUND")
      case 422:
        throw new ApiError(status, "Validatsiya xatosi", "VALIDATION_ERROR")
      case 500:
        throw new ApiError(status, "Server xatosi", "INTERNAL_ERROR")
      default:
        throw new ApiError(status || 0, message, "UNKNOWN_ERROR")
    }
  }
  
  throw error
}
```

### 20.5 Backend Exception Filter

```typescript
// backend/src/common/exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import { Response } from "express"

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = "Internal server error"
    let code = "INTERNAL_ERROR"

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      
      if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || message
        code = (exceptionResponse as any).code || code
      } else {
        message = exceptionResponse
      }
    }

    // Log error
    console.error({
      timestamp: new Date().toISOString(),
      status,
      code,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    })

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        status,
      },
    })
  }
}
```

---

## 21. Logging va Monitoring

### 21.1 Frontend Logging

```typescript
// lib/utils/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}]`, message, context || "")
    }

    // Production'da Sentry/LogRocket ga yuborish
    if (level === "error" && !this.isDevelopment) {
      // Sentry.captureException(new Error(message), { extra: context })
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context)
  }
}

export const logger = new Logger()
```

### 21.2 Backend Logging

```typescript
// backend/src/common/logger.service.ts
import { Injectable, LoggerService } from "@nestjs/common"

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string) {
    this.printMessage("log", message, context)
  }

  error(message: string, trace?: string, context?: string) {
    this.printMessage("error", message, context, trace)
  }

  warn(message: string, context?: string) {
    this.printMessage("warn", message, context)
  }

  debug(message: string, context?: string) {
    this.printMessage("debug", message, context)
  }

  verbose(message: string, context?: string) {
    this.printMessage("verbose", message, context)
  }

  private printMessage(
    level: string,
    message: string,
    context?: string,
    trace?: string
  ) {
    const timestamp = new Date().toISOString()
    const output = {
      timestamp,
      level,
      context,
      message,
      trace,
    }

    console.log(JSON.stringify(output))
  }
}
```

---

## 22. Performance Optimizatsiyasi

### 22.1 Rasmlar - next/image Majburiy

> **Majburiy:** Loyihada barcha rasmlar `next/image` komponenti orqali yuklanishi shart. Bu avtomatik optimizatsiya, lazy loading va CLS (Cumulative Layout Shift) oldini oladi.

```tsx
// ❌ Yomon - Oddiy img tag
<img src="/hero.png" alt="Hero" />

// ❌ Yomon - Tashqi URL bilan img
<img src="https://example.com/image.png" alt="Image" />

// ✅ Yaxshi - next/image bilan
import Image from "next/image"

// Local image
<Image
  src="/hero.png"
  alt="EduStatus platformasi"
  width={1200}
  height={600}
  priority // LCP uchun muhim rasm
/>

// Tashqi URL (next.config.js da domain qo'shish kerak)
<Image
  src="https://cdn.example.com/image.png"
  alt="Tashkilot logotipi"
  width={200}
  height={200}
  loading="lazy" // Lazy loading
/>

// Fill mode (container ichida)
<div className="relative w-full h-64">
  <Image
    src="/cover.png"
    alt="Cover image"
    fill
    className="object-cover"
  />
</div>
```

#### next.config.js da tashqi domainlar

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },
}
```

### 22.2 Memoization Qoidalari

> **Muhim:** `useMemo` va `useCallback` ni **faqat maqsadga muvofiq** ishlating. Keraksiz memoization kodni murakkablashtiradi va xotira sarfini oshiradi.

#### useCallback Qoidalari

`useCallback` quyidagi holatlarda **majburiy**:

| Holat | Sabab | Misol |
|-------|-------|-------|
| `React.memo` bilan o'ralgan child componentga prop | Re-render oldini olish | `<MemoizedChild onSelect={handleSelect} />` |
| `useEffect` dependency array'ida funksiya | Infinite loop oldini olish | `useEffect(() => { fetchData() }, [fetchData])` |
| Custom hook'dan funksiya qaytarish | Callerga barqaror reference | `return { fetchData }` |

`useCallback` quyidagi holatlarda **kerak emas**:

| Holat | Sabab |
|-------|-------|
| Oddiy event handler'lar | Re-render muammo emas |
| Funksiya dependency sifatida ishlatilmasa | Hech qanday foyda yo'q |

```tsx
// ❌ Yomon - Keraksiz useCallback (child React.memo emas)
const handleClick = useCallback(() => {
  setIsOpen(true)
}, [])

<Button onClick={handleClick}>Open</Button>  // Button React.memo emas

// ✅ Yaxshi - Oddiy handler (kerak emas)
<Button onClick={() => setIsOpen(true)}>Open</Button>

// ✅ Yaxshi - Kerakli useCallback (React.memo child + prop)
const OrganizationList = memo(function OrganizationList({ 
  onSelect 
}: { 
  onSelect: (id: string) => void 
}) {
  return organizations.map(org => (
    <Card key={org.id} onClick={() => onSelect(org.id)}>
      {org.name}
    </Card>
  ))
})

// Parent component'da:
const handleSelect = useCallback((id: string) => {
  setSelectedId(id)
  router.push(`/organization/${id}`)
}, [router])  // Dependency to'g'ri!

<OrganizationList onSelect={handleSelect} />
```

#### useMemo Qoidalari

`useMemo` quyidagi holatlarda **majburiy**:

| Holat | Sabab |
|-------|-------|
| Katta array filtrlash/sortlash | Har render'da hisoblash qimmat |
| Murakkab hisoblash | CPU intensive operation |
| Object/array dependency sifatida | Reference equality |

```tsx
// ❌ Yomon - Keraksiz useMemo (oddiy qiymat)
const name = useMemo(() => user.name, [user.name])

// ✅ Yaxshi - Oddiy qiymat (memoization kerak emas)
const name = user.name

// ✅ Yaxshi - Kerakli useMemo (katta array)
const filteredOrganizations = useMemo(() => {
  return organizations
    .filter(org => org.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name))
}, [organizations])

// ✅ Yaxshi - Kerakli useMemo (dependency sifatida object)
const requestOptions = useMemo(() => ({
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(data)
}), [token, data])

useEffect(() => {
  fetch('/api/data', requestOptions)
}, [requestOptions])  // Agar useMemo bo'lmasa, har render'da yangi object
```

#### Memoization Checklist

```markdown
- [ ] useCallback faqat React.memo child yoki dependency array uchun ishlatilgan
- [ ] useMemo faqat murakkab hisoblash uchun ishlatilgan
- [ ] Oddiy qiymatlar uchun memoization ishlatilmagan
- [ ] Dependency array'lar to'g'ri to'ldirilgan
- [ ] Performance muammosi mavjud bo'lsa, memoization qo'shilgan
```

### 22.3 React Performance

```tsx
// ✅ Yaxshi - useMemo bilan (katta array)
const sortedOrganizations = useMemo(() => {
  return organizations.sort((a, b) => a.name.localeCompare(b.name))
}, [organizations])

// ✅ Yaxshi - useCallback KERAK EMAS (oddiy handler, React.memo child yo'q)
const handleSearch = (query: string) => {
  setSearchQuery(query)
}

// ✅ Yaxshi - useCallback KERAK (React.memo child'ga uzatiladi)
const MemoizedSearchInput = memo(function SearchInput({ 
  onSearch 
}: { 
  onSearch: (query: string) => void 
}) {
  return <input onChange={(e) => onSearch(e.target.value)} />
})

// Parent component'da:
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])  // Faqat MemoizedSearchInput ga uzatilgani uchun kerak

<MemoizedSearchInput onSearch={handleSearch} />

// ✅ Yaxshi - React.memo bilan (faqat kerak bo'lganda)
export const OrganizationCard = memo(function OrganizationCard({
  organization,
  onSelect,
}: Props) {
  return (
    <Card onClick={() => onSelect(organization.id)}>
      {organization.name}
    </Card>
  )
})
```

#### React.memo Qoidalari

`React.memo` faqat quyidagi holatlarda ishlating:

| Holat | Sabab |
|-------|-------|
| Parent tez-tez re-render bo'lsa | Child kerksiz re-render'dan saqlanadi |
| Child render qimmat bo'lsa | Katta list, murakkab hisoblash |
| Props o'zgarmayotgan bo'lsa | Memo samarali ishlaydi |

```tsx
// ❌ Yomon - Keraksiz memo (props har doim o'zgaradi)
const Card = memo(function Card({ data }: { data: { id: string, name: string } }) {
  return <div>{data.name}</div>
})

// Har render'da yangi data object yaratiladi, memo ishlamaydi!
<Card data={{ id: '1', name: 'Test' }} />

// ✅ Yaxshi - memo + barqaror props
const Card = memo(function Card({ id, name }: { id: string, name: string }) {
  return <div>{name}</div>
})

<Card id="1" name="Test" />  // Primitive props, memo ishlaydi
```

### 22.4 Next.js Optimizatsiyasi

```tsx
// Dynamic import
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
  ssr: false,
})

// Image optimization
import Image from "next/image"

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // LCP uchun
/>

// Font optimization
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })
```

### 22.5 Database Query Optimization

```typescript
// ✅ Yaxshi - Select faqat kerakli maydonlar
const organizations = await prisma.organization.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    // faqat kerakli maydonlar
  },
  where: {
    status: "active",
  },
  take: 20,
  skip: (page - 1) * 20,
})

// ✅ Yaxshi - Index ishlatish
// schema.prisma
model Organization {
  id     String @id
  name   String
  status String
  
  @@index([status])        // Status bo'yicha qidirish
  @@index([status, name])  // Composite index
}
```

---

## 23. Agent Decision Tree (Tezkor Qarorlar)

> **Muhim:** Bu bo'lim AI agent va dasturchilar uchun tezkor qaror qabul qilish uchun mo'ljallangan. Har bir holat uchun aniq javob mavjud.

### 23.1 Yangi Komponent Yozganda

```
YANGI KOMPONENT YOZGANDA:
│
├── Server yoki Client?
│   ├── Server → cookies(), fetch(), redirect() → RSC (13.1)
│   └── Client → "use client", apiClient, useState → (13.2)
│
├── Nechta mas'uliyat?
│   ├── 1 ta → Yozing
│   └── 2+ ta → Hook yoki sub-komponentga ajrating (3.1)
│
└── Prop soni?
    ├── ≤7 → Oddiy props
    └── >7 → Obyektga guruhlang (5.6)
```

### 23.2 Funksiya Yozganda

```
FUNKSIYA YOZGANDA:
│
├── useCallback kerakmi?
│   ├── React.memo child'ga uzatiladi? → HA → useCallback
│   ├── useEffect dependency'da? → HA → useCallback
│   ├── Hook'dan qaytariladi? → HA → useCallback
│   └── Boshqa → YO'Q → oddiy funksiya
│
└── useMemo kerakmi?
    ├── Array filter/sort (katta)? → HA
    ├── Murakkab hisoblash? → HA
    ├── Object dependency sifatida? → HA
    └── Oddiy qiymat? → YO'Q
```

### 23.3 TypeScript Tip Tanlash

```
TIP TANLASH:
│
├── Ma'lumot turi?
│   ├── Obyekt (extend qilinadi) → interface
│   ├── Union/Intersection → type
│   └── Primitive → type
│
├── any ishlatish kerakmi?
│   └── YO'Q → unknown + Type Guard yoki Zod
│
├── enum ishlatish kerakmi?
│   ├── Framework enum (NestJS, Prisma) → HA, ishlating
│   └── Custom enum → YO'Q, as const dan foydalaning
│
└── Type assertion (as)?
    ├── DOM element → HA
    ├── API response → YO'Q, Zod ishlating
    └── Unknown → Type Guard dan keyin HA
```

### 23.4 Zod Validation

```
ZOD VALIDATION:
│
├── parse() yoki safeParse()?
│   ├── Hook/component ichida → parse()
│   ├── API middleware → safeParse()
│   └── Server action → safeParse()
│
└── Schema qayerda?
    ├── API response → lib/api/schemas/
    └── Form validation → features/[feature]/schema.ts
```

### 23.5 Xavfsizlik Tekshiruvi

```
XAVFSIZLIK TEKSHIRUVI:
│
├── Sensitive ma'lumot bormi?
│   ├── localStorage → ❌ TAQIQ
│   ├── console.log → ❌ TAQIQ
│   ├── URL param → ❌ TAQIQ
│   └── HttpOnly cookie → ✅ QABUL
│
├── NEXT_PUBLIC_ kerakmi?
│   ├── API_URL → ✅ HA
│   ├── JWT_SECRET → ❌ YO'Q
│   └── API_SECRET → ❌ YO'Q
│
└── Input validation?
    ├── Frontend → Zod
    └── Backend → class-validator
```

### 23.6 React.memo Qoidalari

```
React.memo KERAKMI?
│
├── Parent tez-tez re-render bo'ladimi?
│   ├── HA → memo qo'shing
│   └── YO'Q → kerak emas
│
├── Child render qimmatmi?
│   ├── HA (katta list, murakkab UI) → memo qo'shing
│   └── YO'Q → kerak emas
│
└── Props o'zgarmaydimi?
    ├── HA (primitives) → memo ishlaydi
    └── YO'Q (har render'da yangi object) → memo ishlamaydi
```

---

## Qo'shimcha Resurslar

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

**Oxirgi yangilanish:** 2026-02-21  
**Muallif:** EduStatus Development Team

---

## O'zgarishlar Tarixi

| Sana | O'zgarish |
|------|-----------|
| 2026-02-21 | **Agent Decision Tree qo'shildi (23-bo'lim)** - Tezkor qarorlar uchun flowchart'lar: komponent yozish, funksiya yozish, tip tanlash, Zod validation, xavfsizlik, React.memo |
| 2026-02-21 | **parse() vs safeParse() qoidalari qo'shildi** - parse() hook/component ichida, safeParse() API middleware va server action'da |
| 2026-02-21 | **Import tartibi to'liq belgilandi** - 10 ta guruh: React → Next.js → Tashqi kutubxonalar → UI → Hooks → API → Utils → Constants → Types |
| 2026-02-21 | **React.memo qoidalari qo'shildi** - Qachon ishlatish kerak: parent re-render, qimmat child, barqaror props |
| 2026-02-21 | **Ziddiyatlar hal qilindi** - 22.3 handleSearch misoli, 10.2 token argumenti, 3.1.1 duplikatsiya, 4.1/3.1.2 qator chegaralari |
| 2026-02-21 | **Type assertion jadvali aniqlashtirildi** - "Ehtiyotkorlik" olib tashlandi, aniq HA/YO'Q qoidalari qo'shildi |
| 2026-02-21 | **Komponent hajmi mezonlari o'zgartirildi** - Qator soni "maqsad" dan "ko'rsatkich" ga o'zgartirildi. Asosiy mezonlar: mas'uliyat, o'qilish, abstraksiya darajasi |
| 2026-02-21 | **Avtomatik tekshirish (ESLint) bo'limi qo'shildi** - ESLint qoidalari, pre-commit hooks, CI/CD pipeline, jamoa kelishuvi jarayoni |
| 2026-02-21 | **Enum qoidalari tushuntirildi** - Framework enum'lari (NestJS, Prisma) qabul qilinishi, faqat custom enum'lar taqiqlanishi aniq berildi |
| 2026-02-21 | **useCallback qoidalari aniqlandi** - "Faqat performance muammosi bo'lganda" maslahati olib tashlandi, aniq mezonlar qo'shildi (React.memo child, dependency array) |
| 2026-02-21 | **Type narrowing qo'shildi** - `unknown + as` yuzaki himoya ekanligi tushuntirildi, Type Guard pattern'lari va Zod validation tavsiya etildi |
| 2026-02-21 | **Server va Client API Farqlari (Next.js) bo'limi qo'shildi** - Server Components va Client Components uchun API yondashuvlari, NEXT_PUBLIC_ taqiqlari |
| 2026-02-21 | **Xavfsizlik (Security) bo'limi qo'shildi** - XSS, Input Validation, JWT, RBAC, Rate Limiting, CORS, SQL Injection |
| 2026-02-21 | FSD (Feature-Sliced Design) arxitektura qoidalari qo'shildi |
| 2026-02-21 | "Fat Hooks" muammosi va hook'larni ajratish qoidalari qo'shildi |
| 2026-02-21 | Server-side va Client-side API client'larni ajratish qoidalari qo'shildi |
| 2026-02-21 | TypeScript enum taqiqlandi, `as const` standartga aylandi |
| 2026-02-21 | Barrel export'da papka ichidagi import taqiqlandi |
| 2026-02-21 | Magic numbers va strings taqiqlandi |
| 2026-02-21 | API Contract Testing (Zod) bo'limi qo'shildi |
| 2026-02-21 | Form Management standarti (react-hook-form + Zod) qo'shildi |
| 2026-02-21 | Cognitive Load tushunchasi qo'shildi |
| 2026-02-21 | 7 ta yangi bo'lim qo'shildi: Testing, Git Commit, Environment Variables, Accessibility, Error Handling, Logging, Performance |
| 2026-02-21 | Komponent hajmi chegaralari yangilandi (page.tsx: 300-400 → 150-200) |
| 2026-02-21 | Type Assertion (as) qoidalari qo'shildi |
| 2026-02-21 | Barrel export xavflari va qoidalari qo'shildi |
| 2026-02-21 | API Client token boshqaruvi interceptor orqali amalga oshirildi |
| 2026-02-21 | Branch naming ga Task ID majburiyligi qo'shildi |
| 2026-02-21 | Accessibility bo'limi kengaytirildi (Semantic HTML, Alt text, ARIA labels) |
| 2026-02-21 | Error Handling ga Global Error Boundary va User-friendly messages qo'shildi |
| 2026-02-21 | Performance ga next/image majburiyligi va memoization qoidalari qo'shildi |
| 2026-02-16 | Dastlabki versiya yaratildi |
