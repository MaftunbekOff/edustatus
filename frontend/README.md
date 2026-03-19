# EduStatus Frontend

Next.js 14 frontend for EduStatus Monitoring System.

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles
│   │
│   ├── (auth)/                # Auth pages (no sidebar)
│   │   └── login/
│   │       └── page.tsx       # Login page
│   │
│   ├── dashboard/             # College Admin Panel
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── page.tsx           # Main dashboard
│   │   ├── students/          # Students management
│   │   ├── payments/          # Payments management
│   │   ├── debtors/           # Debtors list
│   │   ├── attendance/        # Attendance tracking
│   │   ├── contracts/         # Contracts management
│   │   ├── reminders/         # Payment reminders
│   │   ├── reports/           # Reports generation
│   │   ├── duplicates/        # Duplicate records
│   │   ├── bank/              # Bank operations
│   │   └── settings/          # College settings
│   │
│   ├── super-admin/           # Super Admin Panel
│   │   ├── layout.tsx         # Super admin layout
│   │   ├── page.tsx           # Super admin dashboard
│   │   ├── colleges/          # Organizations management
│   │   │   ├── page.tsx       # Colleges list
│   │   │   └── [id]/          # College detail (dynamic route)
│   │   ├── subscriptions/     # Subscription management
│   │   ├── billing/           # Billing management
│   │   └── settings/          # Platform settings
│   │
│   ├── student/               # Student Panel
│   │   ├── page.tsx           # Student dashboard
│   │   ├── notifications/     # Student notifications
│   │   └── payment/           # Student payments
│   │
│   └── parent/                # Parent Panel
│       └── page.tsx           # Parent dashboard
│
├── components/                # React Components
│   │
│   ├── ui/                    # Base UI Components
│   │   ├── button.tsx         # Button component
│   │   ├── input.tsx          # Input component
│   │   ├── select.tsx         # Select dropdown
│   │   ├── modal.tsx          # Modal dialog
│   │   ├── table.tsx          # Table component
│   │   ├── card.tsx           # Card component
│   │   ├── badge.tsx          # Badge/label
│   │   ├── tabs.tsx           # Tabs component
│   │   ├── dropdown.tsx       # Dropdown menu
│   │   ├── pagination.tsx     # Pagination controls
│   │   ├── date-picker.tsx    # Date picker
│   │   ├── file-upload.tsx    # File upload
│   │   ├── confirm-dialog.tsx # Confirmation dialog
│   │   ├── empty-state.tsx    # Empty state placeholder
│   │   ├── skeleton.tsx       # Loading skeleton
│   │   ├── toast.tsx          # Toast notifications
│   │   ├── avatar.tsx         # User avatar
│   │   └── offline-indicator.tsx # Offline status
│   │
│   ├── layout/                # Layout Components
│   │   ├── header.tsx         # Dashboard header
│   │   ├── sidebar.tsx        # Dashboard sidebar
│   │   ├── super-admin-header.tsx  # Super admin header
│   │   └── super-admin-sidebar.tsx # Super admin sidebar
│   │
│   ├── dashboard/             # Dashboard Components
│   │   └── stats-card.tsx     # Statistics card
│   │
│   ├── students/              # Student Components
│   │   └── student-form-modal.tsx # Student form
│   │
│   ├── payments/              # Payment Components
│   │   └── payment-form-modal.tsx # Payment form
│   │
│   └── providers/             # Context Providers
│       └── toast-provider.tsx # Toast context
│
├── lib/                       # Utilities
│   ├── api.ts                 # API client functions
│   ├── auth-context.tsx       # Authentication context
│   └── utils.ts               # Utility functions
│
└── types/                     # TypeScript Types
    └── index.ts               # All type definitions
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🎨 UI Components

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button size="sm">Small</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Enter text" />
<Input type="email" />
<Input disabled />
```

### Modal
```tsx
import { Modal } from '@/components/ui/modal'

<Modal isOpen={isOpen} onClose={onClose} title="Title">
  Content here
</Modal>
```

### Table
```tsx
import { Table } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 📡 API Client

All API calls are in `lib/api.ts`:

```typescript
import { authApi, collegesApi, studentsApi, paymentsApi } from '@/lib/api'

// Login
const response = await authApi.login(email, password)

// Get colleges
const colleges = await collegesApi.getAll(token)

// Create student
const student = await studentsApi.create(token, data)

// Get payments
const payments = await paymentsApi.getAll(token, collegeId)
```

## 🔐 Authentication

Authentication is handled via React Context in `lib/auth-context.tsx`:

```tsx
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <LoginPage />
  
  return <Dashboard user={user} />
}
```

## 📱 Pages Overview

### Login Page (`/login`)
- Email/password authentication
- JWT token storage
- Redirect based on user role

### Dashboard (`/dashboard`)
- Statistics overview
- Recent payments
- Quick actions

### Students (`/dashboard/students`)
- Student list with search/filter
- Add/Edit/Delete students
- Group assignment

### Payments (`/dashboard/payments`)
- Payment list
- Add/Edit payments
- Confirm/Reject payments

### Super Admin (`/super-admin`)
- Platform overview
- College management
- Subscription management

## 🎯 User Roles & Routes

| Role | Default Route | Access |
|------|---------------|--------|
| `super_admin` | `/super-admin` | All routes |
| `admin` | `/dashboard` | College routes |
| `accountant` | `/dashboard` | Payments, Reports |
| `student` | `/student` | Student panel |
| `parent` | `/parent` | Parent panel |

## 🎨 Styling

This project uses **Tailwind CSS** for styling.

### Configuration
See `tailwind.config.ts` for custom theme configuration.

### Global Styles
See `app/globals.css` for global styles and CSS variables.

## 📝 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📦 Dependencies

### Main Dependencies
- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Styling

### UI Components
- **@radix-ui/react-*** - Headless UI primitives
- **lucide-react** - Icons
- **class-variance-authority** - Component variants
- **clsx** - Conditional classes
- **tailwind-merge** - Merge Tailwind classes

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Lint code |
