# Shared Module Documentation

## Tuzilma

```
frontend/src/
  shared/
    index.ts      # UI komponentlari (Button, Card, Badge, ...)
    hooks.ts      # Hooklar (useAuth, useCollegeData, usePhoneFormat)
    types.ts      # Utilitar funksiyalar va constants
    api.ts        # API funksiyalari
    README.md     # Bu hujjat
```

## Foydalanish

### UI Komponentlari
```typescript
import { Button, Card, Badge, Input, Modal, Table } from '@/shared'
```

### Hooklar
```typescript
import { useAuth, useCollegeData, usePhoneFormat } from '@/shared/hooks'
```

### API
```typescript
import { collegesApi, paymentsApi, ApiError } from '@/shared/api'
```

### Utils va Constants
```typescript
import { formatCurrency, formatDate, organizationTypes, regions } from '@/shared/types'
```

## Qoidalari

### 1. Circular Dependency Oldini Olish
- `shared/` moduli hech qanday app modullariga import qilmasligi kerak
- Faqat `@/lib` va `@/components/ui` dan import qilish mumkin

### 2. Naming Convention
- Komponentlar: PascalCase (Button, StatsCard)
- Hooklar: camelCase with "use" prefix (useCollegeData)
- API: camelCase with "Api" suffix (collegesApi)
- Types: PascalCase (College, Transaction)

### 3. Export Qoidalari
- Har bir modul o'z faylida export qilinadi
- Barrel export faqat `index.ts` fayllarida ishlatiladi
- Named export ishlatiladi, default export emas

## Modul Bog'lanishlari

```
shared/
  hooks.ts  ->  lib/auth-context, lib/hooks/*
  api.ts    ->  lib/api
  types.ts  ->  lib/utils, lib/constants
  index.ts  ->  components/ui, components/*
```

## Xatoliklar va Yechimlar

### Circular Dependency
```
Error: Circular dependency detected
Solution: Modullarni ajrating, shared moduli mustaqil bo'lishi kerak
```

### Import Not Found
```
Error: Module has no exported member
Solution: export qilingan nomni tekshiring, tsconfig paths ni tasdiqlang
```

### Type Mismatch
```
Error: Type X is not assignable to type Y
Solution: Types faylidan to'g'ri type ni import qiling