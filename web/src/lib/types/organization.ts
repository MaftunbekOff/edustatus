export interface Organization {
  id: string
  name: string
  inn: string
  type: string
  industry: string
  isGovernment: boolean
  region: string
  district: string
  subdomain?: string | null
  customDomain?: string | null
  plan: string
  status: string
  email?: string | null
  phone: string
  address: string
  logo?: string | null
  clientLimit: number
  departmentLimit: number
  createdAt: string
  updatedAt: string
}

export interface OrganizationStats {
  total: number
  active: number
  trial: number
  suspended: number
  totalStudents: number
}

export interface OrganizationFilters {
  search: string
  plan: string
  status: string
}
