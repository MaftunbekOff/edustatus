# 🧩 UI Komponentlar

## 📋 Umumiy Ma'lumot

UI komponentlar - bu loyihada qayta ishlatiladigan, mustaqil UI elementlar.

## 📁 Fayl Tuzilishi

```
ui/
├── button.tsx          # Tugma
├── input.tsx           # Matn kiritish
├── select.tsx          # Tanlov
├── modal.tsx           # Modal oyna
├── table.tsx           # Jadval
├── card.tsx            # Karta
├── badge.tsx           # Status belgisi
├── dropdown.tsx        # Ochiladigan menyu
├── tabs.tsx            # Tab panel
├── pagination.tsx      # Sahifalash
├── skeleton.tsx        # Yuklanayotgan holat
├── toast.tsx           # Bildirishnoma
├── date-picker.tsx     # Sana tanlash
├── file-upload.tsx     # Fayl yuklash
├── confirm-dialog.tsx  # Tasdiqlash dialogi
├── empty-state.tsx     # Bo'sh holat
├── avatar.tsx          # Foydalanuvchi rasmi
└── offline-indicator.tsx # Offlayn ko'rsatkich
```

## 🎨 Komponentlar

### 1. Button

**Vazifasi:** Tugma - asosiy interaktiv element.

```tsx
import { Button } from '@/components/ui/button';

// Variantlar
<Button variant="primary">Saqlash</Button>
<Button variant="secondary">Bekor qilish</Button>
<Button variant="danger">O'chirish</Button>
<Button variant="outline">Chiqish</Button>

// O'lchamlar
<Button size="sm">Kichik</Button>
<Button size="md">O'rta</Button>
<Button size="lg">Katta</Button>

// Holatlar
<Button loading>Yuklanmoqda...</Button>
<Button disabled>O'chirilgan</Button>

// Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

---

### 2. Input

**Vazifasi:** Matn kiritish maydoni.

```tsx
import { Input } from '@/components/ui/input';

// Oddiy
<Input 
  label="Ism" 
  placeholder="Ismingizni kiriting"
/>

// Xato holati
<Input 
  label="Email" 
  error="Email noto'g'ri"
/>

// Props
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
```

---

### 3. Select

**Vazifasi:** Tanlov ro'yxati.

```tsx
import { Select } from '@/components/ui/select';

<Select
  label="Status"
  options={[
    { value: 'active', label: 'Faol' },
    { value: 'inactive', label: 'Nofaol' },
  ]}
  value={status}
  onChange={setStatus}
/>

// Props
interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
}
```

---

### 4. Modal

**Vazifasi:** Modal oyna.

```tsx
import { Modal } from '@/components/ui/modal';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Ochish</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Yangi talaba">
  <form>
    {/* Forma kontenti */}
  </form>
</Modal>

// Props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

---

### 5. Table

**Vazifasi:** Ma'lumotlar jadvali.

```tsx
import { Table } from '@/components/ui/table';

const columns = [
  { key: 'name', label: 'Ism' },
  { key: 'amount', label: 'Summa' },
  { key: 'status', label: 'Status' },
];

<Table
  columns={columns}
  data={payments}
  onRowClick={(row) => console.log(row)}
/>

// Props
interface TableProps<T> {
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}
```

---

### 6. Card

**Vazifasi:** Karta konteyner.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>Sarlavha</CardHeader>
  <CardContent>Kontent</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Yoki oddiy
<Card className="p-4">
  <p>Kontent</p>
</Card>
```

---

### 7. Badge

**Vazifasi:** Status belgisi.

```tsx
import { Badge } from '@/components/ui/badge';

// Variantlar
<Badge variant="success">Faol</Badge>
<Badge variant="warning">Kutilmoqda</Badge>
<Badge variant="danger">Xato</Badge>
<Badge variant="info">Ma'lumot</Badge>

// Props
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}
```

---

### 8. Dropdown

**Vazifasi:** Ochiladigan menyu.

```tsx
import { Dropdown } from '@/components/ui/dropdown';

<Dropdown
  trigger={<Button>Menyu</Button>}
  items={[
    { label: 'Tahrirlash', onClick: handleEdit },
    { label: "O'chirish", onClick: handleDelete, danger: true },
  ]}
/>
```

---

### 9. Tabs

**Vazifasi:** Tab panel.

```tsx
import { Tabs, Tab } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <Tab value="tab1" label="Birinchi">
    Birinchi kontent
  </Tab>
  <Tab value="tab2" label="Ikkinchi">
    Ikkinchi kontent
  </Tab>
</Tabs>
```

---

### 10. Pagination

**Vazifasi:** Sahifalash.

```tsx
import { Pagination } from '@/components/ui/pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

### 11. Skeleton

**Vazifasi:** Yuklanayotgan holat.

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Yuklanayotganda
{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  <Content />
)}
```

---

### 12. Toast

**Vazifasi:** Bildirishnoma.

```tsx
import { toast } from '@/components/ui/toast';

// Muvaffaqiyat
toast.success('Saqlandi!');

// Xato
toast.error('Xatolik yuz berdi');

// Ogohlantirish
toast.warning('Diqqat!');

// Ma'lumot
toast.info('Ma\'lumot');
```

---

### 13. DatePicker

**Vazifasi:** Sana tanlash.

```tsx
import { DatePicker } from '@/components/ui/date-picker';

<DatePicker
  label="Sana"
  value={date}
  onChange={setDate}
  placeholder="Sanani tanlang"
/>
```

---

### 14. FileUpload

**Vazifasi:** Fayl yuklash.

```tsx
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  label="Fayl"
  accept=".xlsx,.csv"
  onUpload={handleUpload}
  multiple={false}
/>
```

---

### 15. ConfirmDialog

**Vazifasi:** Tasdiqlash dialogi.

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="O'chirish"
  message="Rostdan ham o'chirmoqchimisiz?"
  confirmText="O'chirish"
  variant="danger"
/>
```

---

### 16. EmptyState

**Vazifasi:** Bo'sh holat.

```tsx
import { EmptyState } from '@/components/ui/empty-state';

<EmptyState
  icon={<UsersIcon />}
  title="Talabalar yo'q"
  description="Hali talabalar qo'shilmagan"
  action={<Button>Yangi talaba</Button>}
/>
```

---

### 17. Avatar

**Vazifasi:** Foydalanuvchi rasmi.

```tsx
import { Avatar } from '@/components/ui/avatar';

<Avatar src="/avatar.png" alt="User" size="md" />
<Avatar name="Ali Valiyev" /> // Initsiallar ko'rsatadi
```

---

### 18. OfflineIndicator

**Vazifasi:** Offlayn holat ko'rsatkich.

```tsx
import { OfflineIndicator } from '@/components/ui/offline-indicator';

// Avtomatik offlayn holatni ko'rsatadi
<OfflineIndicator />
```

---

## 🎨 Stil Standartlari

### Ranglar

```css
/* Primary */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-900: #1e3a8a;

/* Status */
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
```

### O'lchamlar

```css
/* Button/Input heights */
sm: 32px
md: 40px
lg: 48px

/* Border radius */
sm: 4px
md: 8px
lg: 12px
```

### Spacing

```css
/* Tailwind spacing */
p-1: 4px
p-2: 8px
p-3: 12px
p-4: 16px
p-6: 24px
p-8: 32px
```

## 📌 Foydalanish Qoidalari

1. **Import:** Har doim `@/components/ui/` dan import qiling
2. **Props:** TypeScript interface dan foydalaning
3. **Styling:** Tailwind CSS classlari ishlatiladi
4. **Accessibility:** ARIA attribute lar qo'shing

## 🔗 Bog'liq Fayllar

| Fayl | Tavsif |
|------|--------|
| [`globals.css`](../app/globals.css) | Global stillar |
| [`tailwind.config.ts`](../../tailwind.config.ts) | Tailwind konfiguratsiyasi |
