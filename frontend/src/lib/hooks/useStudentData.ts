/**
 * useStudentData hook
 * Manages student portal data fetching and state
 */

import { useState, useEffect, useCallback } from "react"
import type {
  StudentInfo,
  StudentPayment,
  PaymentSummary,
  StudentNotification,
  StudentLoginCredentials,
  StudentLoginResponse,
  StudentPortalData,
} from "@/types/student"

// Simple API helper for student endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error('API error')
  return response.json()
}

async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('API error')
  return response.json()
}

// ==========================================
// MOCK DATA (for development)
// ==========================================

const mockStudentInfo: StudentInfo = {
  id: "1",
  fullName: "Aliyev Anvar Abdullaevich",
  pinfl: "50101009900321",
  contractNumber: "CT-2024-00123",
  group: "101-A",
  specialty: "Hamshiralik ishi",
  phone: "+998 90 123 45 67",
  email: "anvar@gmail.com",
  status: "active",
  enrollmentDate: "2024-09-01",
  graduationDate: "2027-06-30",
}

const mockPaymentSummary: PaymentSummary = {
  totalAmount: 5000000,
  paidAmount: 3500000,
  debtAmount: 1500000,
  progressPercent: 70,
  lastPaymentDate: "2025-01-15",
  nextPaymentDue: "2025-03-01",
  monthlyPayment: 500000,
}

const mockPayments: StudentPayment[] = [
  {
    id: "1",
    date: "2025-01-15",
    amount: 1500000,
    method: "bank",
    status: "confirmed",
    receipt: "REC-001",
  },
  {
    id: "2",
    date: "2024-12-10",
    amount: 1000000,
    method: "click",
    status: "confirmed",
    receipt: "REC-002",
  },
  {
    id: "3",
    date: "2024-11-05",
    amount: 1000000,
    method: "cash",
    status: "confirmed",
    receipt: "REC-003",
  },
]

const mockNotifications: StudentNotification[] = [
  {
    id: "1",
    title: "To'lov eslatmasi",
    message: "Mart oyi uchun to'lov 1-mart kuni",
    type: "warning",
    createdAt: "2025-02-10",
    isRead: false,
    relatedType: "reminder",
  },
]

// ==========================================
// HOOK TYPES
// ==========================================

interface UseStudentDataOptions {
  /** Auto-fetch data on mount */
  autoFetch?: boolean
  /** Use mock data (for development) */
  useMock?: boolean
}

interface UseStudentDataReturn {
  /** Student information */
  student: StudentInfo | null
  /** Payment summary */
  paymentSummary: PaymentSummary | null
  /** Recent payments */
  payments: StudentPayment[]
  /** Notifications */
  notifications: StudentNotification[]
  /** Unread notifications count */
  unreadCount: number
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
  /** Is logged in */
  isLoggedIn: boolean
  /** Login function */
  login: (credentials: StudentLoginCredentials) => Promise<StudentLoginResponse>
  /** Logout function */
  logout: () => void
  /** Refresh data */
  refresh: () => Promise<void>
  /** Fetch payments */
  fetchPayments: (page?: number) => Promise<void>
  /** Mark notification as read */
  markNotificationRead: (id: string) => void
  /** Mark all notifications as read */
  markAllNotificationsRead: () => void
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

/**
 * Hook for managing student portal data
 */
export function useStudentData(options: UseStudentDataOptions = {}): UseStudentDataReturn {
  const { autoFetch = true, useMock = true } = options

  // State
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [payments, setPayments] = useState<StudentPayment[]>([])
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length

  /**
   * Fetch student portal data
   */
  const fetchData = useCallback(async () => {
    if (useMock) {
      // Use mock data for development
      setStudent(mockStudentInfo)
      setPaymentSummary(mockPaymentSummary)
      setPayments(mockPayments)
      setNotifications(mockNotifications)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiGet<StudentPortalData>("/student/portal")
      setStudent(response.student)
      setPaymentSummary(response.paymentSummary)
      setPayments(response.recentPayments)
      setNotifications(response.notifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }, [useMock])

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: StudentLoginCredentials): Promise<StudentLoginResponse> => {
      setLoading(true)
      setError(null)

      try {
        if (useMock) {
          // Mock login - always succeeds
          setIsLoggedIn(true)
          setStudent(mockStudentInfo)
          setPaymentSummary(mockPaymentSummary)
          setPayments(mockPayments)
          setNotifications(mockNotifications)
          return { success: true, student: mockStudentInfo }
        }

        const response = await apiPost<StudentLoginResponse>("/student/login", credentials)

        if (response.success && response.student) {
          setIsLoggedIn(true)
          setStudent(response.student)
          if (autoFetch) {
            await fetchData()
          }
        }

        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Kirishda xatolik"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [useMock, autoFetch, fetchData]
  )

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    setStudent(null)
    setPaymentSummary(null)
    setPayments([])
    setNotifications([])
    setIsLoggedIn(false)
    setError(null)
  }, [])

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    if (!isLoggedIn && !useMock) return
    await fetchData()
  }, [isLoggedIn, useMock, fetchData])

  /**
   * Fetch payments with pagination
   */
  const fetchPayments = useCallback(
    async (page = 1) => {
      if (useMock) {
        setPayments(mockPayments)
        return
      }

      setLoading(true)
      try {
        const response = await apiGet<{ payments: StudentPayment[] }>(
          `/student/payments?page=${page}`
        )
        setPayments(response.payments)
      } catch (err) {
        setError(err instanceof Error ? err.message : "To'lovlarni yuklashda xatolik")
      } finally {
        setLoading(false)
      }
    },
    [useMock]
  )

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  // Auto-fetch on mount if logged in
  useEffect(() => {
    if (autoFetch && isLoggedIn) {
      fetchData()
    }
  }, [autoFetch, isLoggedIn, fetchData])

  // For demo mode, auto-login
  useEffect(() => {
    if (useMock && autoFetch) {
      setIsLoggedIn(true)
      setStudent(mockStudentInfo)
      setPaymentSummary(mockPaymentSummary)
      setPayments(mockPayments)
      setNotifications(mockNotifications)
    }
  }, [useMock, autoFetch])

  return {
    student,
    paymentSummary,
    payments,
    notifications,
    unreadCount,
    loading,
    error,
    isLoggedIn,
    login,
    logout,
    refresh,
    fetchPayments,
    markNotificationRead,
    markAllNotificationsRead,
  }
}

// ==========================================
// EXPORTS
// ==========================================

export type { UseStudentDataOptions, UseStudentDataReturn }
