/**
 * Organization Types
 * 
 * This file contains all TypeScript types related to organizations.
 * Following Single Responsibility Principle - types are separated from implementation.
 */

/**
 * Organization entity type
 */
export interface Organization {
  id: string
  name: string
  inn: string
  subdomain?: string | null
  customDomain?: string | null
  plan: string
  status: string
  email?: string | null
  phone: string
  logo?: string | null
  subscriptionEndsAt?: string
  _count?: {
    students: number
    groups: number
  }
}

/**
 * Organization stats type
 */
export interface OrganizationStats {
  total: number
  active: number
  trial: number
  suspended: number
  totalStudents: number
}

/**
 * Organization filters type
 */
export interface OrganizationFilters {
  search: string
  plan: string
  status: string
}
