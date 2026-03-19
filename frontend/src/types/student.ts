/**
 * Student-related TypeScript types
 * Used in student portal and dashboard pages
 */

import { PaymentStatusType, PaymentMethodType } from "@/lib/constants/common"

// ==========================================
// STUDENT INFO TYPES
// ==========================================

/**
 * Student personal information
 */
export interface StudentInfo {
  /** Student ID */
  id: string
  /** Full name */
  fullName: string
  /** PINFL (JSHSHIR) - 14 digit personal identification number */
  pinfl: string
  /** Contract number */
  contractNumber: string
  /** Group name */
  group: string
  /** Specialty/field of study */
  specialty: string
  /** Phone number */
  phone: string
  /** Email address */
  email: string
  /** Profile photo URL */
  photoUrl?: string
  /** Student status */
  status: StudentStatus
  /** Enrollment date */
  enrollmentDate: string
  /** Expected graduation date */
  graduationDate: string
}

/**
 * Student status types
 */
export type StudentStatus = "active" | "graduated" | "expelled" | "academic_leave"

/**
 * Student status labels (Uzbek)
 */
export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Faol",
  graduated: "Bitirgan",
  expelled: "Chiqarilgan",
  academic_leave: "Akademik ta'til",
}

/**
 * Student status badge variants
 */
export const STUDENT_STATUS_COLORS: Record<StudentStatus, "success" | "secondary" | "error" | "warning"> = {
  active: "success",
  graduated: "secondary",
  expelled: "error",
  academic_leave: "warning",
}

// ==========================================
// PAYMENT TYPES
// ==========================================

/**
 * Payment record
 */
export interface StudentPayment {
  /** Payment ID */
  id: string
  /** Payment date (ISO string) */
  date: string
  /** Payment amount in UZS */
  amount: number
  /** Payment method */
  method: PaymentMethodType
  /** Payment status */
  status: PaymentStatusType
  /** Receipt/transaction number */
  receipt: string
  /** Description/note */
  description?: string
  /** Receipt file URL */
  receiptUrl?: string
}

/**
 * Payment summary statistics
 */
export interface PaymentSummary {
  /** Total contract amount */
  totalAmount: number
  /** Total paid amount */
  paidAmount: number
  /** Remaining debt */
  debtAmount: number
  /** Payment progress percentage (0-100) */
  progressPercent: number
  /** Last payment date */
  lastPaymentDate?: string
  /** Next payment due date */
  nextPaymentDue?: string
  /** Monthly payment amount (if applicable) */
  monthlyPayment?: number
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

/**
 * Student notification
 */
export interface StudentNotification {
  /** Notification ID */
  id: string
  /** Notification title */
  title: string
  /** Notification message */
  message: string
  /** Notification type */
  type: NotificationType
  /** Creation date */
  createdAt: string
  /** Read status */
  isRead: boolean
  /** Related entity ID (payment, contract, etc.) */
  relatedId?: string
  /** Related entity type */
  relatedType?: "payment" | "contract" | "reminder"
}

/**
 * Notification type
 */
export type NotificationType = "info" | "warning" | "success" | "error"

/**
 * Notification type colors
 */
export const NOTIFICATION_COLORS: Record<NotificationType, "info" | "warning" | "success" | "error"> = {
  info: "info",
  warning: "warning",
  success: "success",
  error: "error",
}

// ==========================================
// CONTRACT TYPES
// ==========================================

/**
 * Student contract details
 */
export interface StudentContract {
  /** Contract ID */
  id: string
  /** Contract number */
  contractNumber: string
  /** Contract date */
  contractDate: string
  /** Contract amount */
  amount: number
  /** Payment term (months) */
  paymentTerm: number
  /** Contract status */
  status: ContractStatus
  /** Contract file URL */
  contractUrl?: string
}

/**
 * Contract status
 */
export type ContractStatus = "active" | "completed" | "cancelled"

/**
 * Contract status labels
 */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: "Faol",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
}

// ==========================================
// LOGIN TYPES
// ==========================================

/**
 * Student login method
 */
export type LoginMethod = "pinfl" | "contract"

/**
 * Student login credentials
 */
export interface StudentLoginCredentials {
  /** Login method */
  method: LoginMethod
  /** PINFL value (if method is 'pinfl') */
  pinfl?: string
  /** Contract number (if method is 'contract') */
  contractNumber?: string
  /** Phone number for verification */
  phone?: string
}

/**
 * Student login response
 */
export interface StudentLoginResponse {
  /** Success status */
  success: boolean
  /** Student info (if successful) */
  student?: StudentInfo
  /** Error message (if failed) */
  error?: string
  /** Session token */
  token?: string
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

/**
 * Student portal data response
 */
export interface StudentPortalData {
  /** Student information */
  student: StudentInfo
  /** Payment summary */
  paymentSummary: PaymentSummary
  /** Recent payments */
  recentPayments: StudentPayment[]
  /** Notifications list */
  notifications?: StudentNotification[]
  /** Unread notifications count */
  unreadNotifications: number
  /** Contract details */
  contract?: StudentContract
}

/**
 * Student payments query params
 */
export interface StudentPaymentsParams {
  /** Page number */
  page?: number
  /** Page size */
  pageSize?: number
  /** Filter by status */
  status?: PaymentStatusType
  /** Filter by method */
  method?: PaymentMethodType
  /** Date from */
  dateFrom?: string
  /** Date to */
  dateTo?: string
}

/**
 * Student payments response
 */
export interface StudentPaymentsResponse {
  /** Payments list */
  payments: StudentPayment[]
  /** Total count */
  total: number
  /** Current page */
  page: number
  /** Page size */
  pageSize: number
  /** Total pages */
  totalPages: number
}

// ==========================================
// FORM TYPES
// ==========================================

/**
 * Student profile update form
 */
export interface StudentProfileForm {
  /** Phone number */
  phone: string
  /** Email address */
  email: string
}

/**
 * Payment form data
 */
export interface PaymentForm {
  /** Payment amount */
  amount: number
  /** Payment method */
  method: PaymentMethodType
  /** Phone number for payment system */
  phone?: string
  /** Card number (for card payments) */
  cardNumber?: string
}
