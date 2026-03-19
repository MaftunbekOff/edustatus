import { useState, useEffect } from "react"
import { dashboardApi, paymentsApi, studentsApi, ApiError } from "@/lib/api"

export interface DashboardStats {
  todayPayments: number
  todayCount: number
  monthlyPlan: number
  monthlyActual: number
  monthlyPercent: number
  totalClients: number
  totalDebt: number
  activeClients: number
  // Legacy aliases for backward compatibility
  totalStudents?: number
  activeStudents?: number
}

export interface Payment {
  id: string
  studentName: string
  amount: number
  date: string
  status: string
  method: string
}

export interface Debtor {
  name: string
  debt: number
  group: string
}

interface UseDashboardDataReturn {
  stats: DashboardStats | null
  recentPayments: Payment[]
  debtors: Debtor[]
  isLoading: boolean
  error: string
}

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!token || !userStr) {
        window.location.href = '/login'
        return
      }

      const user = JSON.parse(userStr)
      const collegeId = user.collegeId

      try {
        // Fetch dashboard stats
        const statsData = await dashboardApi.getStats(token, collegeId)
        setStats(statsData)

        // Fetch recent payments
        const payments = await paymentsApi.getAll(token, collegeId)
        const formattedPayments = payments.slice(0, 5).map((p: any) => ({
          id: p.id,
          studentName: p.student?.fullName || 'N/A',
          amount: p.amount,
          date: p.paymentDate,
          status: p.status,
          method: p.paymentMethod,
        }))
        setRecentPayments(formattedPayments)

        // Fetch debtors
        const debtorsData = await studentsApi.getDebtors(token, collegeId)
        const formattedDebtors = debtorsData.slice(0, 4).map((s: any) => ({
          name: s.fullName.split(' ').slice(0, 2).join(' ') + '.',
          debt: s.debtAmount,
          group: s.group?.name || 'N/A',
        }))
        setDebtors(formattedDebtors)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        } else {
          setError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    stats,
    recentPayments,
    debtors,
    isLoading,
    error,
  }
}