// Shared Types Module
// Common type definitions used across the application

// ============= College Types =============
export interface College {
  id: string
  name: string
  inn: string
  type?: string
  isGovernment?: boolean
  region?: string
  district?: string
  parentId?: string | null
  parent?: {
    id: string
    name: string
  } | null
  subdomain?: string | null
  customDomain?: string | null
  plan: string
  status: string
  email?: string | null
  phone?: string | null
  adminEmail?: string | null
  adminPhone?: string | null
  address?: string | null
  createdAt: string
  subscriptionEndsAt?: string | null
  trialEndsAt?: string | null
  hasStudents: boolean
  hasPayments: boolean
  hasReports: boolean
  hasBankIntegration: boolean
  hasTelegramBot: boolean
  hasSmsNotifications: boolean
  hasExcelImport: boolean
  hasPdfReports: boolean
  allowSubColleges: boolean
  admins?: CollegeAdmin[]
  children?: ChildCollege[]
  _count?: {
    students: number
    groups: number
    payments: number
    children?: number
  }
}

export interface CollegeAdmin {
  id: string
  fullName: string
  email: string
  phone?: string | null
  role: string
  status: string
  lastLogin?: string | null
}

export interface ChildCollege {
  id: string
  name: string
  inn: string
  type?: string
  status: string
  phone?: string
  address?: string
  createdAt?: string
  _count?: {
    students: number
    groups: number
  }
}

// ============= Payment Types =============
export interface Payment {
  id: string
  studentName: string
  amount: number
  date: string
  status: string
  method: string
}

export interface Transaction {
  id: string
  collegeName: string
  amount: number
  type: string
  plan: string
  date: string
  status: string
  method: string
  invoice: string
}

// ============= Student Types =============
export interface Student {
  id: string
  fullName: string
  email?: string
  phone?: string
  groupId?: string
  group?: {
    id: string
    name: string
  }
  status: string
  debtAmount: number
}

export interface Debtor {
  name: string
  debt: number
  group: string
}

// ============= Subscription Types =============
export interface Subscription {
  id: string
  collegeName: string
  plan: string
  price: number
  startDate: string
  endDate: string
  status: string
  autoRenew: boolean
  daysLeft: number
}

// ============= Dashboard Types =============
export interface DashboardStats {
  todayPayments: number
  todayCount: number
  monthlyPlan: number
  monthlyActual: number
  monthlyPercent: number
  totalStudents: number
  totalDebt: number
  activeStudents: number
}

export interface SuperAdminStats {
  totalColleges: number
  activeColleges: number
  totalStudents: number
  totalRevenue: number
}

// ============= Custom Domain Types =============
export interface CustomDomain {
  id: string
  domain: string
  isPrimary: boolean
  status: string
  sslStatus: string
  verificationToken?: string
  verifiedAt?: string
  sslProvisionedAt?: string
  createdAt: string
}

// ============= Common Types =============
export interface SelectOption {
  value: string
  label: string
}

export interface StatusConfig {
  color: 'success' | 'warning' | 'error' | 'secondary'
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface PlanConfig {
  name: string
  price: number
  features: string[]
}