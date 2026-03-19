import { useState, useEffect, useCallback } from "react"
import { collegesApi, customDomainsApi, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

// Types
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

export interface CollegeStats {
  studentsCount: number
  totalRevenue: number
  groupsCount: number
}

// Hook return type
interface UseCollegeDataReturn {
  college: College | null
  stats: CollegeStats | null
  domains: CustomDomain[]
  loading: boolean
  error: string
  loadData: () => Promise<void>
  updateCollege: (data: Partial<College>) => Promise<void>
  toggleSubColleges: (checked: boolean) => Promise<void>
  tabulaRasa: () => Promise<void>
}

export function useCollegeData(collegeId: string): UseCollegeDataReturn {
  const { token } = useAuth()
  const [college, setCollege] = useState<College | null>(null)
  const [stats, setStats] = useState<CollegeStats | null>(null)
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    if (!token || !collegeId) return

    try {
      setLoading(true)
      const [collegeData, statsData, domainsData] = await Promise.all([
        collegesApi.getById(token, collegeId),
        collegesApi.getStats(token, collegeId),
        customDomainsApi.getAll(token, collegeId).catch(() => []),
      ])
      setCollege(collegeData)
      setStats(statsData)
      setDomains(domainsData)
      setError("")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Ma'lumotlarni yuklashda xatolik")
      }
    } finally {
      setLoading(false)
    }
  }, [token, collegeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateCollege = useCallback(async (data: Partial<College>) => {
    if (!token || !collegeId) return

    await collegesApi.update(token, collegeId, data)
    await loadData()
  }, [token, collegeId, loadData])

  const toggleSubColleges = useCallback(async (checked: boolean) => {
    try {
      await updateCollege({ allowSubColleges: checked })
    } catch (err) {
      console.error("Toggle sub-colleges error:", err)
      throw new Error("Quyi tashkilotlarni aktivlashtirishda xatolik yuz berdi")
    }
  }, [updateCollege])

  const tabulaRasa = useCallback(async () => {
    if (!token || !collegeId) return

    try {
      await collegesApi.tabulaRasa(token, collegeId)
      await loadData()
    } catch (err) {
      console.error("Tabula Rasa error:", err)
      throw new Error("Xatolik yuz berdi")
    }
  }, [token, collegeId, loadData])

  return {
    college,
    stats,
    domains,
    loading,
    error,
    loadData,
    updateCollege,
    toggleSubColleges,
    tabulaRasa,
  }
}