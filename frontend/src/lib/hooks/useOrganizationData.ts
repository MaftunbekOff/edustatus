import { useState, useEffect, useCallback } from "react"
import { collegesApi, customDomainsApi, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

// Types
export interface OrganizationAdmin {
  id: string
  fullName: string
  email: string
  phone?: string | null
  role: string
  status: string
  lastLogin?: string | null
}

export interface ChildOrganization {
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

export interface Organization {
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
  logo?: string | null
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
  allowSubOrganizations: boolean
  allowSubColleges?: boolean // Legacy field from Prisma schema
  studentLimit: number
  groupLimit: number
  admins?: OrganizationAdmin[]
  children?: ChildOrganization[]
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

export interface OrganizationStats {
  studentsCount: number
  totalRevenue: number
  groupsCount: number
}

// Hook return type
export interface UseOrganizationDataReturn {
  organization: Organization | null
  stats: OrganizationStats | null
  domains: CustomDomain[]
  loading: boolean
  error: string
  loadData: () => Promise<void>
  updateOrganization: (data: Partial<Organization>) => Promise<void>
  toggleSubOrganizations: (checked: boolean) => Promise<void>
  tabulaRasa: () => Promise<void>
}

export function useOrganizationData(organizationId: string): UseOrganizationDataReturn {
  const { token } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    if (!token || !organizationId) return

    try {
      setLoading(true)
      const [organizationData, statsData, domainsData] = await Promise.all([
        collegesApi.getById(token, organizationId),
        collegesApi.getStats(token, organizationId),
        customDomainsApi.getAll(token, organizationId).catch(() => []),
      ])
      setOrganization(organizationData)
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
  }, [token, organizationId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateOrganization = useCallback(async (data: Partial<Organization>) => {
    if (!token || !organizationId) return

    await collegesApi.update(token, organizationId, data)
    await loadData()
  }, [token, organizationId, loadData])

  const toggleSubOrganizations = useCallback(async (checked: boolean) => {
    try {
      // Use allowSubColleges to match Prisma schema
      await updateOrganization({ allowSubColleges: checked } as Partial<Organization>)
    } catch (err) {
      console.error("Toggle sub-organizations error:", err)
      throw new Error("Quyi tashkilotlarni aktivlashtirishda xatolik yuz berdi")
    }
  }, [updateOrganization])

  const tabulaRasa = useCallback(async () => {
    if (!token || !organizationId) return

    try {
      await collegesApi.tabulaRasa(token, organizationId)
      await loadData()
    } catch (err) {
      console.error("Tabula Rasa error:", err)
      throw new Error("Xatolik yuz berdi")
    }
  }, [token, organizationId, loadData])

  return {
    organization,
    stats,
    domains,
    loading,
    error,
    loadData,
    updateOrganization,
    toggleSubOrganizations,
    tabulaRasa,
  }
}