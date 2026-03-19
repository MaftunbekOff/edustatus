/**
 * useParentData hook
 * Manages parent portal data fetching and state
 */

import { useState, useEffect, useCallback } from "react"
import type {
  ParentInfo,
  ChildStudent,
  ChildPayment,
  ParentNotification,
  ParentLoginCredentials,
  ParentLoginResponse,
  ParentPortalData,
  ParentDashboardSummary,
} from "@/types/parent"

// Simple API helper for parent endpoints
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

const mockParentInfo: ParentInfo = {
  id: "1",
  fullName: "Aliyev Abdulla",
  pinfl: "30101009900321",
  phone: "+998 90 123 45 67",
  email: "abdulla@gmail.com",
  childrenCount: 2,
}

const mockChildren: ChildStudent[] = [
  {
    id: "1",
    fullName: "Aliyev Anvar Abdullaevich",
    contractNumber: "CT-2024-00123",
    group: "101-A",
    specialty: "Hamshiralik ishi",
    status: "active",
    collegeName: "Tibbiyot Texnikumi",
    payment: {
      totalAmount: 5000000,
      paidAmount: 3500000,
      debtAmount: 1500000,
      progressPercent: 70,
      nextPaymentDue: "2025-03-01",
      monthlyPayment: 500000,
    },
    lastPaymentDate: "2025-01-15",
  },
  {
    id: "2",
    fullName: "Aliyeva Dilnoza Abdullaevna",
    contractNumber: "CT-2024-00124",
    group: "102-B",
    specialty: "Farmatsiya",
    status: "active",
    collegeName: "Tibbiyot Texnikumi",
    payment: {
      totalAmount: 4500000,
      paidAmount: 2000000,
      debtAmount: 2500000,
      progressPercent: 44,
      nextPaymentDue: "2025-02-20",
      monthlyPayment: 450000,
    },
    lastPaymentDate: "2024-12-20",
  },
]

const mockNotifications: ParentNotification[] = [
  {
    id: "1",
    title: "To'lov eslatmasi",
    message: "Dilnoza uchun to'lov 20-fevral kuni",
    type: "warning",
    createdAt: "2025-02-10",
    isRead: false,
    childId: "2",
    childName: "Aliyeva Dilnoza",
    relatedType: "reminder",
  },
  {
    id: "2",
    title: "To'lov qabul qilindi",
    message: "Anvar uchun 1,500,000 so'm to'lov tasdiqlandi",
    type: "success",
    createdAt: "2025-01-15",
    isRead: true,
    childId: "1",
    childName: "Aliyev Anvar",
    relatedType: "payment",
  },
]

// ==========================================
// HOOK TYPES
// ==========================================

interface UseParentDataOptions {
  /** Auto-fetch data on mount */
  autoFetch?: boolean
  /** Use mock data (for development) */
  useMock?: boolean
}

interface UseParentDataReturn {
  /** Parent information */
  parent: ParentInfo | null
  /** Children/students list */
  children: ChildStudent[]
  /** Notifications */
  notifications: ParentNotification[]
  /** Unread notifications count */
  unreadCount: number
  /** Dashboard summary */
  summary: ParentDashboardSummary | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
  /** Is logged in */
  isLoggedIn: boolean
  /** Login function */
  login: (credentials: ParentLoginCredentials) => Promise<ParentLoginResponse>
  /** Logout function */
  logout: () => void
  /** Refresh data */
  refresh: () => Promise<void>
  /** Fetch child payments */
  fetchChildPayments: (childId?: string, page?: number) => Promise<ChildPayment[]>
  /** Mark notification as read */
  markNotificationRead: (id: string) => void
  /** Mark all notifications as read */
  markAllNotificationsRead: () => void
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

/**
 * Hook for managing parent portal data
 */
export function useParentData(options: UseParentDataOptions = {}): UseParentDataReturn {
  const { autoFetch = true, useMock = true } = options

  // State
  const [parent, setParent] = useState<ParentInfo | null>(null)
  const [children, setChildren] = useState<ChildStudent[]>([])
  const [notifications, setNotifications] = useState<ParentNotification[]>([])
  const [summary, setSummary] = useState<ParentDashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length

  /**
   * Calculate dashboard summary from children data
   */
  const calculateSummary = useCallback((childrenData: ChildStudent[]): ParentDashboardSummary => {
    const totalChildren = childrenData.length
    const activeChildren = childrenData.filter((c) => c.status === "active").length
    const totalContractAmount = childrenData.reduce((sum, c) => sum + c.payment.totalAmount, 0)
    const totalPaidAmount = childrenData.reduce((sum, c) => sum + c.payment.paidAmount, 0)
    const totalDebtAmount = childrenData.reduce((sum, c) => sum + c.payment.debtAmount, 0)
    const averageProgress = totalChildren > 0
      ? Math.round(childrenData.reduce((sum, c) => sum + c.payment.progressPercent, 0) / totalChildren)
      : 0

    // Get upcoming payments (next 30 days)
    const upcomingPayments = childrenData
      .filter((c) => c.payment.nextPaymentDue)
      .map((c) => {
        const dueDate = new Date(c.payment.nextPaymentDue!)
        const today = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          childId: c.id,
          childName: c.fullName,
          dueDate: c.payment.nextPaymentDue!,
          amount: c.payment.monthlyPayment || 0,
          daysUntilDue,
        }
      })
      .filter((p) => p.daysUntilDue <= 30 && p.daysUntilDue > 0)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

    return {
      totalChildren,
      activeChildren,
      totalContractAmount,
      totalPaidAmount,
      totalDebtAmount,
      averageProgress,
      upcomingPayments,
    }
  }, [])

  /**
   * Fetch parent portal data
   */
  const fetchData = useCallback(async () => {
    if (useMock) {
      setParent(mockParentInfo)
      setChildren(mockChildren)
      setNotifications(mockNotifications)
      setSummary(calculateSummary(mockChildren))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiGet<ParentPortalData>("/parent/portal")
      setParent(response.parent)
      setChildren(response.children)
      setNotifications(response.notifications)
      setSummary(calculateSummary(response.children))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }, [useMock, calculateSummary])

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: ParentLoginCredentials): Promise<ParentLoginResponse> => {
      setLoading(true)
      setError(null)

      try {
        if (useMock) {
          setIsLoggedIn(true)
          setParent(mockParentInfo)
          setChildren(mockChildren)
          setNotifications(mockNotifications)
          setSummary(calculateSummary(mockChildren))
          return { success: true, parent: mockParentInfo }
        }

        const response = await apiPost<ParentLoginResponse>("/parent/login", credentials)

        if (response.success && response.parent) {
          setIsLoggedIn(true)
          setParent(response.parent)
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
    [useMock, autoFetch, fetchData, calculateSummary]
  )

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    setParent(null)
    setChildren([])
    setNotifications([])
    setSummary(null)
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
   * Fetch child payments
   */
  const fetchChildPayments = useCallback(
    async (childId?: string, page = 1): Promise<ChildPayment[]> => {
      if (useMock) {
        // Return mock payments
        return [
          {
            id: "1",
            studentId: "1",
            studentName: "Aliyev Anvar",
            date: "2025-01-15",
            amount: 1500000,
            method: "bank",
            status: "confirmed",
            receipt: "REC-001",
          },
        ]
      }

      const url = childId
        ? `/parent/payments?childId=${childId}&page=${page}`
        : `/parent/payments?page=${page}`

      const response = await apiGet<{ payments: ChildPayment[] }>(url)
      return response.payments
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
      setParent(mockParentInfo)
      setChildren(mockChildren)
      setNotifications(mockNotifications)
      setSummary(calculateSummary(mockChildren))
    }
  }, [useMock, autoFetch, calculateSummary])

  return {
    parent,
    children,
    notifications,
    unreadCount,
    summary,
    loading,
    error,
    isLoggedIn,
    login,
    logout,
    refresh,
    fetchChildPayments,
    markNotificationRead,
    markAllNotificationsRead,
  }
}

// ==========================================
// EXPORTS
// ==========================================

export type { UseParentDataOptions, UseParentDataReturn }
