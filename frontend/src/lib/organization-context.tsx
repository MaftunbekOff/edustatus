"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { organizationsApi } from './api'

interface Organization {
  id: string
  name: string
  inn: string
  type: string
  industry: string
  isGovernment: boolean
  region: string
  district: string
  subdomain: string | null
  customDomain: string | null
  plan: string
  status: string
  email: string | null
  phone: string
  address: string
  logo: string | null
  clientLimit: number
  departmentLimit: number
  createdAt: string
  updatedAt: string
}

interface OrganizationContextType {
  organization: Organization | null
  organizationType: string
  isLoading: boolean
  refreshOrganization: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshOrganization = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      // Try to get organization info from stored user first
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        // If user has organizationId, fetch organization details
        if (userData.organizationId) {
          const orgData = await organizationsApi.getById(token, userData.organizationId)
          setOrganization(orgData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshOrganization()
  }, [])

  const organizationType = organization?.type || 'other'

  return (
    <OrganizationContext.Provider value={{ 
      organization, 
      organizationType, 
      isLoading,
      refreshOrganization 
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
