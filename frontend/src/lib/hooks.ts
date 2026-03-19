"use client"

import { useState, useEffect, useCallback } from "react"
import { collegesApi, customDomainsApi, ApiError } from "@/lib/api"

// Types
export interface CollegeAdmin {
  id: string
  fullName: string
  email: string
  phone?: string | null
  role: string
  status: string
}

export interface ChildCollege {
  id: string
  name: string
  inn: string
  status: string
  _count?: {
    students: number
    groups: number
  }
}

export interface College {
  id: string
  name: string
  inn: string
  type: string
  isGovernment: boolean
  region: string
  district: string
  subdomain?: string | null
  customDomain?: string | null
  email?: string | null
  phone: string
  address: string
  plan: string
  status: string
  hasStudents: boolean
  hasPayments: boolean
  hasReports: boolean
  hasBankIntegration: boolean
  hasTelegramBot: boolean
  hasSmsNotifications: boolean
  hasExcelImport: boolean
  hasPdfReports: boolean
  allowSubColleges: boolean
  subscriptionEndsAt?: string | null
  trialEndsAt?: string | null
  createdAt: string
  admins?: CollegeAdmin[]
  children?: ChildCollege[]
  parent?: College | null
  _count?: {
    students: number
    groups: number
    payments: number
    children: number
  }
}

export interface CustomDomain {
  id: string
  domain: string
  status: string
  sslStatus: string
  isPrimary: boolean
  createdAt: string
}

export interface CollegeStats {
  studentsCount: number
  groupsCount: number
  totalRevenue: number
}

// Hook for college data fetching
export function useCollegeData(collegeId: string) {
  const [college, setCollege] = useState<College | null>(null)
  const [stats, setStats] = useState<CollegeStats | null>(null)
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoading(true)
      
      // Fetch college data
      const collegeData = await collegesApi.getById(token, collegeId)
      setCollege(collegeData)
      
      // Fetch stats
      const statsData = await collegesApi.getStats(token, collegeId)
      setStats(statsData)
      
      // Fetch custom domains
      const domainsData = await customDomainsApi.getAll(token, collegeId)
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
  }, [collegeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleSubColleges = useCallback(async (checked: boolean) => {
    const token = localStorage.getItem('token')
    if (!token) return

    await collegesApi.update(token, collegeId, { allowSubColleges: checked })
    await loadData()
  }, [collegeId, loadData])

  const tabulaRasa = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    await collegesApi.tabulaRasa(token, collegeId)
    await loadData()
  }, [collegeId, loadData])

  return {
    college,
    stats,
    domains,
    loading,
    error,
    loadData,
    toggleSubColleges,
    tabulaRasa,
  }
}

// Hook for phone number formatting
export function usePhoneFormat() {
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    
    // If empty, return empty
    if (digits.length === 0) return ""
    
    // If user is typing local number (without 998), prepend 998
    let fullDigits = digits
    if (!digits.startsWith("998") && digits.length <= 9) {
      fullDigits = "998" + digits
    }
    
    // Format: +998 XX XXX XX XX
    let formatted = "+998"
    
    if (fullDigits.length > 3) {
      formatted += " " + fullDigits.slice(3, 5)
    }
    if (fullDigits.length > 5) {
      formatted += " " + fullDigits.slice(5, 8)
    }
    if (fullDigits.length > 8) {
      formatted += " " + fullDigits.slice(8, 10)
    }
    if (fullDigits.length > 10) {
      formatted += " " + fullDigits.slice(10, 12)
    }
    
    return formatted
  }

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    callback: (value: string) => void
  ) => {
    const formatted = formatPhoneNumber(e.target.value)
    callback(formatted)
  }

  return {
    formatPhoneNumber,
    handlePhoneChange,
  }
}