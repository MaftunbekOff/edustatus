import { useState, useEffect } from "react"
import { dashboardApi, collegesApi, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export interface CabinetStats {
  totalOrganizations: number
  activeOrganizations: number
  totalStudents: number
  totalRevenue: number
}

export interface OrganizationListItem {
  id: string
  name: string
  subdomain?: string | null
  customDomain?: string | null
  plan: string
  status: string
  _count?: {
    students: number
    groups: number
  }
}

interface UseCabinetDataReturn {
  stats: CabinetStats | null
  organizations: OrganizationListItem[]
  loading: boolean
  error: string
  loadData: () => Promise<void>
}

export function useCabinetData(): UseCabinetDataReturn {
  const { token } = useAuth()
  const [stats, setStats] = useState<CabinetStats | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const [statsData, organizationsData] = await Promise.all([
        dashboardApi.getSuperAdminStats(token),
        collegesApi.getAll(token),
      ])
      // Map API response to new field names
      setStats({
        totalOrganizations: statsData.totalOrganizations || 0,
        activeOrganizations: statsData.activeOrganizations || 0,
        totalStudents: statsData.totalClients || 0,
        totalRevenue: statsData.totalRevenue || 0,
      })
      setOrganizations(organizationsData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  return {
    stats,
    organizations,
    loading,
    error,
    loadData,
  }
}