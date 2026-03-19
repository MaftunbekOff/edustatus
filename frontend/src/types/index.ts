// Student Types
export interface Student {
  id: string
  fullName: string
  pinfl: string
  contractNumber: string
  groupId: string
  group?: Group
  phone?: string
  email?: string
  totalAmount: number
  paidAmount: number
  debtAmount: number
  status: 'active' | 'graduated' | 'expelled' | 'transferred'
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  specialty: string
  course: number
  year: number
  studentCount?: number
}

// Payment Types
export interface Payment {
  id: string
  studentId: string
  student?: Student
  amount: number
  currency: string
  paymentMethod: 'bank' | 'cash' | 'click' | 'payme' | 'other'
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  transactionId?: string
  referenceNumber?: string
  bankAccount?: string
  paymentDate: string
  confirmedAt?: string
  confirmedBy?: Admin
  description?: string
  createdAt: string
}

export interface PaymentTransaction {
  id: string
  paymentId: string
  bankTransactionId: string
  externalId: string
  status: string
  bankResponse: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Admin Types
export interface Admin {
  id: string
  username: string
  email: string
  role: 'admin' | 'accountant' | 'operator'
  status: 'active' | 'blocked'
  lastLogin?: string
  createdAt: string
}

// Dashboard Types
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

export interface DailyRevenue {
  date: string
  amount: number
  count: number
}

export interface GroupDebt {
  groupId: string
  groupName: string
  totalDebt: number
  studentCount: number
  averageDebt: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter Types
export interface StudentFilter {
  search?: string
  groupId?: string
  status?: string
  debtFrom?: number
  debtTo?: number
}

export interface PaymentFilter {
  studentId?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  paymentMethod?: string
}

// Form Types
export interface CreateStudentDto {
  fullName: string
  pinfl: string
  contractNumber: string
  groupId: string
  phone?: string
  email?: string
  totalAmount: number
}

export interface CreatePaymentDto {
  studentId: string
  amount: number
  paymentMethod: Payment['paymentMethod']
  paymentDate: string
  description?: string
}

export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: Admin
}

// College Types
export interface College {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'trial' | 'active' | 'suspended'
  adminEmail: string
  adminPhone?: string
  address?: string
  logo?: string
  studentLimit: number
  groupLimit: number
  createdAt: string
  updatedAt: string
}

// Custom Domain Types
export interface CustomDomain {
  id: string
  collegeId: string
  domain: string
  isPrimary: boolean
  status: 'pending' | 'verifying' | 'active' | 'failed'
  verificationToken?: string
  verifiedAt?: string
  sslStatus: 'pending' | 'provisioning' | 'active' | 'failed'
  sslProvisionedAt?: string
  lastError?: string
  createdAt: string
  updatedAt: string
  college?: College
}

export interface CustomDomainVerification {
  domain: string
  status: string
  verificationToken: string
  dnsInstructions: {
    type: string
    name: string
    value: string
    ttl: number
  }
  cnameInstructions: {
    type: string
    name: string
    value: string
    ttl: number
  }
}

export interface CreateCustomDomainDto {
  domain: string
  isPrimary?: boolean
}
