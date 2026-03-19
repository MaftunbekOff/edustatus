/**
 * Parent-related TypeScript types
 * Used in parent portal pages
 */

import { NotificationType } from "./student"

// ==========================================
// PARENT INFO TYPES
// ==========================================

/**
 * Parent/Guardian information
 */
export interface ParentInfo {
  /** Parent ID */
  id: string
  /** Full name */
  fullName: string
  /** PINFL (JSHSHIR) */
  pinfl: string
  /** Phone number */
  phone: string
  /** Email address */
  email?: string
  /** Address */
  address?: string
  /** Number of children/students linked */
  childrenCount: number
}

// ==========================================
// CHILD STUDENT TYPES
// ==========================================

/**
 * Child student summary for parent view
 */
export interface ChildStudent {
  /** Student ID */
  id: string
  /** Student full name */
  fullName: string
  /** Contract number */
  contractNumber: string
  /** Group name */
  group: string
  /** Specialty */
  specialty: string
  /** Student status */
  status: "active" | "graduated" | "expelled" | "academic_leave"
  /** Profile photo URL */
  photoUrl?: string
  /** Payment summary */
  payment: ChildPaymentSummary
  /** College/institution name */
  collegeName: string
  /** Last payment date */
  lastPaymentDate?: string
}

/**
 * Child payment summary
 */
export interface ChildPaymentSummary {
  /** Total contract amount */
  totalAmount: number
  /** Paid amount */
  paidAmount: number
  /** Debt amount */
  debtAmount: number
  /** Payment progress percentage */
  progressPercent: number
  /** Next payment due date */
  nextPaymentDue?: string
  /** Monthly payment amount */
  monthlyPayment?: number
}

/**
 * Child payment record
 */
export interface ChildPayment {
  /** Payment ID */
  id: string
  /** Student ID */
  studentId: string
  /** Student name */
  studentName: string
  /** Payment date */
  date: string
  /** Payment amount */
  amount: number
  /** Payment method */
  method: "cash" | "bank" | "click" | "payme" | "uzum" | "other"
  /** Payment status */
  status: "pending" | "confirmed" | "rejected" | "refunded"
  /** Receipt number */
  receipt: string
  /** Receipt file URL */
  receiptUrl?: string
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

/**
 * Parent notification
 */
export interface ParentNotification {
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
  /** Related child ID */
  childId?: string
  /** Related child name */
  childName?: string
  /** Related entity type */
  relatedType?: "payment" | "reminder" | "debt" | "general"
}

// ==========================================
// LOGIN TYPES
// ==========================================

/**
 * Parent login credentials
 */
export interface ParentLoginCredentials {
  /** Phone number */
  phone: string
  /** SMS verification code */
  verificationCode?: string
}

/**
 * Parent login response
 */
export interface ParentLoginResponse {
  /** Success status */
  success: boolean
  /** Parent info (if successful) */
  parent?: ParentInfo
  /** Error message (if failed) */
  error?: string
  /** Session token */
  token?: string
  /** Requires SMS verification */
  requiresVerification?: boolean
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

/**
 * Parent portal data response
 */
export interface ParentPortalData {
  /** Parent information */
  parent: ParentInfo
  /** Children/students list */
  children: ChildStudent[]
  /** Recent notifications */
  notifications: ParentNotification[]
  /** Unread notifications count */
  unreadCount: number
  /** Total debt across all children */
  totalDebt: number
}

/**
 * Child payments query params
 */
export interface ChildPaymentsParams {
  /** Child/student ID (optional, if not provided returns all children's payments) */
  childId?: string
  /** Page number */
  page?: number
  /** Page size */
  pageSize?: number
  /** Date from */
  dateFrom?: string
  /** Date to */
  dateTo?: string
}

/**
 * Child payments response
 */
export interface ChildPaymentsResponse {
  /** Payments list */
  payments: ChildPayment[]
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
// PAYMENT FORM TYPES
// ==========================================

/**
 * Parent payment form
 */
export interface ParentPaymentForm {
  /** Child/student ID */
  childId: string
  /** Payment amount */
  amount: number
  /** Payment method */
  method: "cash" | "bank" | "click" | "payme" | "uzum" | "other"
  /** Phone number for payment system */
  phone?: string
  /** Card number */
  cardNumber?: string
}

// ==========================================
// SUMMARY TYPES
// ==========================================

/**
 * Parent dashboard summary
 */
export interface ParentDashboardSummary {
  /** Total children count */
  totalChildren: number
  /** Active children count */
  activeChildren: number
  /** Total contract amount */
  totalContractAmount: number
  /** Total paid amount */
  totalPaidAmount: number
  /** Total debt amount */
  totalDebtAmount: number
  /** Average payment progress */
  averageProgress: number
  /** Upcoming payments */
  upcomingPayments: UpcomingPayment[]
}

/**
 * Upcoming payment
 */
export interface UpcomingPayment {
  /** Child ID */
  childId: string
  /** Child name */
  childName: string
  /** Due date */
  dueDate: string
  /** Amount due */
  amount: number
  /** Days until due */
  daysUntilDue: number
}
