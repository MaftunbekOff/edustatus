/**
 * useOrganizationList Hook
 * 
 * Custom hook for managing organization list data and operations.
 * Following Single Responsibility Principle - handles only organization list logic.
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import { collegesApi, ApiError } from "@/lib/api"
import type { Organization, OrganizationStats, OrganizationFilters } from "@/types/organization"

/**
 * Hook return type
 */
export interface UseOrganizationListReturn {
  organizations: Organization[]
  loading: boolean
  error: string
  filters: OrganizationFilters
  stats: OrganizationStats
  filteredOrganizations: Organization[]
  setSearch: (search: string) => void
  setPlanFilter: (plan: string) => void
  setStatusFilter: (status: string) => void
  reload: () => Promise<void>
}

/**
 * Calculate stats from organizations
 */
const calculateStats = (organizations: Organization[]): OrganizationStats => ({
  total: organizations.length,
  active: organizations.filter((o) => o.status === "active").length,
  trial: organizations.filter((o) => o.status === "trial").length,
  suspended: organizations.filter((o) => o.status === "suspended").length,
  totalStudents: organizations.reduce((sum, o) => sum + (o._count?.students || 0), 0),
})

/**
 * Custom hook for managing organization list
 * 
 * @param token - Authentication token
 * @returns Object with organizations data and operations
 * 
 * @example
 * const {
 *   organizations,
 *   loading,
 *   filteredOrganizations,
 *   stats,
 *   setSearch,
 * } = useOrganizationList(token)
 */
export const useOrganizationList = (token: string | null): UseOrganizationListReturn => {
  // --- State ---
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<OrganizationFilters>({
    search: "",
    plan: "",
    status: "",
  })

  // --- Data Fetching ---
  const loadOrganizations = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError("")
      const data = await collegesApi.getAll(token)
      setOrganizations(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  // --- Effects ---
  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  // --- Derived State ---
  const stats = useMemo(() => calculateStats(organizations), [organizations])

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        org.subdomain?.toLowerCase().includes(filters.search.toLowerCase()) ||
        org.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        org.phone.includes(filters.search)
      const matchesPlan = !filters.plan || org.plan === filters.plan
      const matchesStatus = !filters.status || org.status === filters.status
      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [organizations, filters])

  // --- Filter Setters ---
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  const setPlanFilter = useCallback((plan: string) => {
    setFilters((prev) => ({ ...prev, plan }))
  }, [])

  const setStatusFilter = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }, [])

  return {
    organizations,
    loading,
    error,
    filters,
    stats,
    filteredOrganizations,
    setSearch,
    setPlanFilter,
    setStatusFilter,
    reload: loadOrganizations,
  }
}
