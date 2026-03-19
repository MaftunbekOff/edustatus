# 📚 Lib - Utility va API

## 📋 Umumiy Ma'lumot

Lib papkasi API client, Auth context va helper funksiyalarni o'z ichiga oladi.

## 📁 Fayl Tuzilishi

```
lib/
├── api.ts           # API client
├── auth-context.tsx # Auth context provider
└── utils.ts         # Helper funksiyalar
```

---

## 🌐 API Client (`api.ts`)

### Umumiy Tuzilma

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// API Error class
class ApiError extends Error {
  status: number;
  data: any;
}

// Base fetch function
async function fetchApi<T>(endpoint: string, options: FetchOptions): Promise<T>
```

### Auth API

```typescript
import { authApi } from '@/lib/api';

// Login
const response = await authApi.login(email, password);
// Returns: { accessToken, refreshToken, user }

// Get current user
const user = await authApi.getMe(token);
// Returns: { id, email, fullName, role }
```

### Students API

```typescript
import { studentsApi } from '@/lib/api';

// Get all students
const students = await studentsApi.getAll(token, collegeId);

// Get with filters
const students = await studentsApi.getAll(token, collegeId, {
  search: 'Ali',
  groupId: 'clx123',
  status: 'active'
});

// Get by ID
const student = await studentsApi.getById(token, id);

// Create
const newStudent = await studentsApi.create(token, {
  fullName: 'Aliyev Vali',
  pinfl: '12345678901234',
  contractNumber: 'SH-2024-001',
  groupId: 'clx456',
  totalAmount: 5000000
});

// Update
const updated = await studentsApi.update(token, id, {
  phone: '+998901234567'
});

// Delete
await studentsApi.delete(token, id);

// Get debtors
const debtors = await studentsApi.getDebtors(token, collegeId);

// Get duplicates
const duplicates = await studentsApi.getDuplicates(token, collegeId);
```

### Payments API

```typescript
import { paymentsApi } from '@/lib/api';

// Get all payments
const payments = await paymentsApi.getAll(token, collegeId);

// Get with filters
const payments = await paymentsApi.getAll(token, collegeId, {
  studentId: 'clx123',
  status: 'pending',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
});

// Create
const payment = await paymentsApi.create(token, {
  studentId: 'clx123',
  amount: 500000,
  paymentMethod: 'bank',
  paymentDate: '2024-01-20'
});

// Confirm
await paymentsApi.confirm(token, paymentId);

// Reject
await paymentsApi.reject(token, paymentId);

// Get stats
const stats = await paymentsApi.getStats(token, collegeId);
```

### Groups API

```typescript
import { groupsApi } from '@/lib/api';

// Get all groups
const groups = await groupsApi.getAll(token, collegeId);

// Get by ID
const group = await groupsApi.getById(token, id);

// Create
const group = await groupsApi.create(token, {
  name: 'Guruh-101',
  specialty: 'Axborot texnologiyalari',
  course: 1,
  year: 2024,
  collegeId: 'clx123'
});

// Delete
await groupsApi.delete(token, id);
```

### Colleges API (Super Admin)

```typescript
import { collegesApi } from '@/lib/api';

// Get all colleges
const colleges = await collegesApi.getAll(token);

// Get by ID
const college = await collegesApi.getById(token, id);

// Get stats
const stats = await collegesApi.getStats(token, collegeId);

// Create
const college = await collegesApi.create(token, {
  name: 'Yangi Kollej',
  subdomain: 'newcollege',
  adminEmail: 'admin@newcollege.uz'
});

// Delete
await collegesApi.delete(token, id);
```

### Dashboard API

```typescript
import { dashboardApi } from '@/lib/api';

// Get college stats
const stats = await dashboardApi.getStats(token, collegeId);
// Returns: {
//   todayPayments, todayCount, monthlyPlan, monthlyActual,
//   monthlyPercent, totalStudents, activeStudents, totalDebt
// }
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api';

try {
  const students = await studentsApi.getAll(token, collegeId);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Data:', error.data);
  }
}
```

---

## 🔐 Auth Context (`auth-context.tsx`)

### Provider

```tsx
// layout.tsx
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Hook

```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { 
    user,      // Joriy foydalanuvchi | null
    token,     // JWT token | null
    isLoading, // Yuklanayotgan holati
    login,     // Login funksiyasi
    logout,    // Logout funksiyasi
    error      // Xato xabari
  } = useAuth();

  if (isLoading) return <Loading />;
  
  if (!user) return <LoginForm />;

  return (
    <div>
      <p>Xush kelibsiz, {user.fullName}</p>
      <button onClick={logout}>Chiqish</button>
    </div>
  );
}
```

### Login

```tsx
const { login, error } = useAuth();

const handleSubmit = async (email: string, password: string) => {
  try {
    await login(email, password);
    // Muvaffaqiyatli login - redirect
  } catch (err) {
    // Xato - error state avtomatik yangilanadi
  }
};
```

### Logout

```tsx
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Token va user tozalanadi
  router.push('/login');
};
```

### User Type

```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  collegeId?: string;
}
```

---

## 🛠️ Utils (`utils.ts`)

### Format Functions

```typescript
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils';

// Valyuta formatlash
formatCurrency(5000000); // "5,000,000 so'm"
formatCurrency(5000000, 'UZS'); // "5,000,000 UZS"

// Sana formatlash
formatDate('2024-01-20'); // "20.01.2024"
formatDate('2024-01-20', 'full'); // "20 yanvar 2024"

// Telefon formatlash
formatPhone('998901234567'); // "+998 90 123 45 67"
```

### Validation Functions

```typescript
import { validatePinfl, validatePhone, validateEmail } from '@/lib/utils';

// PINFL (14 raqam)
validatePinfl('12345678901234'); // true/false

// Telefon
validatePhone('+998901234567'); // true/false

// Email
validateEmail('test@example.com'); // true/false
```

### Helper Functions

```typescript
import { 
  classNames, 
  debounce, 
  truncate,
  generateId 
} from '@/lib/utils';

// CSS classlarni birlashtirish
classNames('btn', isActive && 'btn-active', 'btn-primary');
// "btn btn-active btn-primary" yoki "btn btn-primary"

// Debounce
const debouncedSearch = debounce((value) => {
  console.log('Search:', value);
}, 300);

// Matnni qisqartirish
truncate('Uzun matn...', 10); // "Uzun matn..."

// ID generatsiya
generateId(); // "clx123abc..."
```

### Calculation Functions

```typescript
import { 
  calculateDebt, 
  calculatePercent,
  sumArray 
} from '@/lib/utils';

// Qarz hisoblash
calculateDebt(5000000, 2000000); // 3000000

// Foiz hisoblash
calculatePercent(75, 100); // 75

// Massiv yig'indisi
sumArray(payments, 'amount'); // Jami summa
```

---

## 📊 Ma'lumotlar Oqimi

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Component                                                       │
│      │                                                           │
│      │ useAuth() / API call                                      │
│      ▼                                                           │
│  AuthContext / API Client                                        │
│      │                                                           │
│      │ fetch() with token                                        │
│      ▼                                                           │
│  Backend API                                                     │
│      │                                                           │
│      │ JSON response                                             │
│      ▼                                                           │
│  Component State                                                 │
│      │                                                           │
│      │ Re-render                                                 │
│      ▼                                                           │
│  UI Update                                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Xavfsizlik

### Token Storage

```typescript
// Token localStorage da saqlanadi
localStorage.setItem('token', accessToken);
localStorage.setItem('user', JSON.stringify(user));

// Olish
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Tozalash (logout)
localStorage.removeItem('token');
localStorage.removeItem('user');
```

### API Headers

```typescript
const headers: HeadersInit = {
  'Content-Type': 'application/json',
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

---

## 📌 Foydalanish Misollari

### To'liq CRUD

```tsx
function StudentsPage() {
  const { token } = useAuth();
  const { collegeId } = useAuth().user;
  const [students, setStudents] = useState([]);

  // Load
  useEffect(() => {
    studentsApi.getAll(token, collegeId).then(setStudents);
  }, []);

  // Create
  const handleCreate = async (data) => {
    const student = await studentsApi.create(token, { ...data, collegeId });
    setStudents([...students, student]);
  };

  // Update
  const handleUpdate = async (id, data) => {
    const updated = await studentsApi.update(token, id, data);
    setStudents(students.map(s => s.id === id ? updated : s));
  };

  // Delete
  const handleDelete = async (id) => {
    await studentsApi.delete(token, id);
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    // UI
  );
}
```

### Error Handling

```tsx
function PaymentsPage() {
  const [error, setError] = useState(null);

  const handleConfirm = async (id) => {
    try {
      await paymentsApi.confirm(token, id);
      toast.success('Tasdiqlandi');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      }
    }
  };
}
```

---

## 🔗 Bog'liq Fayllar

| Fayl | Tavsif |
|------|--------|
| [`types/index.ts`](../types/index.ts) | TypeScript turlari |
| [`app/layout.tsx`](../app/layout.tsx) | AuthProvider joylashuvi |
