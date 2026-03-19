const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FetchOptions extends RequestInit {
  token?: string
  skipAuthRefresh?: boolean
}

class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Token refresh state
let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

function subscribeTokenRefresh(callback: () => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed() {
  refreshSubscribers.forEach(callback => callback())
  refreshSubscribers = []
}

// Clear session and redirect to login
function clearSessionAndRedirect() {
  sessionStorage.removeItem('user')
  // Cookies are cleared by the server on logout
  // Only redirect if not already on login page
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

// Refresh access token using cookies
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
    })

    if (!response.ok) {
      return false
    }

    // Refresh successful, new access token is now in cookie
    return true
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include', // Include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Handle 401 - try to refresh token
  if (response.status === 401 && !skipAuthRefresh) {
    if (!isRefreshing) {
      isRefreshing = true
      const refreshSuccess = await refreshAccessToken()
      isRefreshing = false

      if (refreshSuccess) {
        onTokenRefreshed()
        // Retry original request with new cookies
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...fetchOptions,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })

        if (retryResponse.ok) {
          return retryResponse.json()
        }
      } else {
        clearSessionAndRedirect()
        throw new ApiError('Authentication failed', 401)
      }
    } else {
      // Wait for token refresh to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
              ...fetchOptions,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...options.headers,
              },
            })

            if (retryResponse.ok) {
              resolve(retryResponse.json())
            } else {
              reject(new ApiError(
                `HTTP error! status: ${retryResponse.status}`,
                retryResponse.status
              ))
            }
          } catch (error) {
            reject(error)
          }
        })
      })
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi<{ user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    })
  },

  getMe: async () => {
    return fetchApi<{ id: string; email: string; fullName: string; role: string }>('/api/auth/me')
  },
}

// Dashboard API
export const dashboardApi = {
  getStats: async (token: string, organizationId?: string) => {
    const url = organizationId ? `/api/dashboard/stats?organizationId=${organizationId}` : '/api/dashboard/stats'
    return fetchApi<{
      todayPayments: number
      todayCount: number
      monthlyPlan: number
      monthlyActual: number
      monthlyPercent: number
      totalClients: number
      totalDebt: number
      activeClients: number
    }>(url, { token })
  },

  getSuperAdminStats: async (token: string) => {
    return fetchApi<{
      totalOrganizations: number
      activeOrganizations: number
      totalClients: number
      totalRevenue: number
    }>('/api/dashboard/stats', { token })
  },
}

// Clients API
export const clientsApi = {
  getAll: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/clients?organizationId=${organizationId}`, { token })
  },

  getDuplicates: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/clients/duplicates?organizationId=${organizationId}`, { token })
  },

  getDebtors: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/clients/debtors?organizationId=${organizationId}`, { token })
  },

  getById: async (token: string, id: string) => {
    return fetchApi<any>(`/api/clients/${id}`, { token })
  },

  create: async (token: string, data: any) => {
    return fetchApi<any>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  update: async (token: string, id: string, data: any) => {
    return fetchApi<any>(`/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    })
  },

  delete: async (token: string, id: string) => {
    return fetchApi<void>(`/api/clients/${id}`, {
      method: 'DELETE',
      token,
    })
  },
}

// Payments API
export const paymentsApi = {
  getAll: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/payments?organizationId=${organizationId}`, { token })
  },

  getStats: async (token: string, organizationId: string) => {
    return fetchApi<any>(`/api/payments/stats?organizationId=${organizationId}`, { token })
  },

  getById: async (token: string, id: string) => {
    return fetchApi<any>(`/api/payments/${id}`, { token })
  },

  create: async (token: string, data: any) => {
    return fetchApi<any>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  confirm: async (token: string, id: string) => {
    return fetchApi<any>(`/api/payments/${id}/confirm`, {
      method: 'POST',
      token,
    })
  },

  reject: async (token: string, id: string) => {
    return fetchApi<any>(`/api/payments/${id}/reject`, {
      method: 'POST',
      token,
    })
  },
}

// Departments API
export const departmentsApi = {
  getAll: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/departments?organizationId=${organizationId}`, { token })
  },

  getById: async (token: string, id: string) => {
    return fetchApi<any>(`/api/departments/${id}`, { token })
  },

  create: async (token: string, data: any) => {
    return fetchApi<any>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  delete: async (token: string, id: string) => {
    return fetchApi<void>(`/api/departments/${id}`, {
      method: 'DELETE',
      token,
    })
  },
}

// Organizations API
export const organizationsApi = {
  getAll: async (token: string) => {
    return fetchApi<any[]>('/api/organizations', { token })
  },

  getById: async (token: string, id: string) => {
    return fetchApi<any>(`/api/organizations/${id}`, { token })
  },

  getStats: async (token: string, id: string) => {
    return fetchApi<any>(`/api/organizations/${id}/stats`, { token })
  },

  create: async (token: string, data: any) => {
    return fetchApi<any>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  update: async (token: string, id: string, data: any) => {
    return fetchApi<any>(`/api/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    })
  },

  delete: async (token: string, id: string) => {
    return fetchApi<void>(`/api/organizations/${id}`, {
      method: 'DELETE',
      token,
    })
  },

  tabulaRasa: async (token: string, id: string) => {
    return fetchApi<any>(`/api/organizations/${id}/tabula-rasa`, {
      method: 'POST',
      token,
    })
  },

  // Quyi tashkilotlar
  getChildren: async (token: string, id: string) => {
    return fetchApi<any[]>(`/api/organizations/${id}/children`, { token })
  },

  createChild: async (token: string, parentId: string, data: any) => {
    return fetchApi<any>(`/api/organizations/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  // Administratorlar
  getAdmins: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/organizations/${organizationId}/admins`, { token })
  },

  createAdmin: async (token: string, organizationId: string, data: any) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/admins`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  updateAdmin: async (token: string, organizationId: string, adminId: string, data: any) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/admins/${adminId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    })
  },

  deleteAdmin: async (token: string, organizationId: string, adminId: string) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/admins/${adminId}`, {
      method: 'DELETE',
      token,
    })
  },
}

// Custom Domains API
export const customDomainsApi = {
  getAll: async (token: string, organizationId: string) => {
    return fetchApi<any[]>(`/api/organizations/${organizationId}/custom-domains`, { token })
  },

  getById: async (token: string, organizationId: string, domainId: string) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/custom-domains/${domainId}`, { token })
  },

  create: async (token: string, organizationId: string, data: { domain: string; isPrimary?: boolean }) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/custom-domains`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  },

  getVerificationInfo: async (token: string, organizationId: string, domainId: string) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/custom-domains/${domainId}/verification`, { token })
  },

  verify: async (token: string, organizationId: string, domainId: string) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/custom-domains/${domainId}/verify`, {
      method: 'POST',
      token,
    })
  },

  setPrimary: async (token: string, organizationId: string, domainId: string) => {
    return fetchApi<any>(`/api/organizations/${organizationId}/custom-domains/${domainId}/primary`, {
      method: 'PUT',
      token,
    })
  },

  delete: async (token: string, organizationId: string, domainId: string) => {
    return fetchApi<void>(`/api/organizations/${organizationId}/custom-domains/${domainId}`, {
      method: 'DELETE',
      token,
    })
  },
}

// Legacy API aliases for backward compatibility
export const collegesApi = {
  ...organizationsApi,
  // Map old collegeId to organizationId
  getAll: organizationsApi.getAll,
  getById: organizationsApi.getById,
}

export const studentsApi = {
  ...clientsApi,
}

export const groupsApi = {
  ...departmentsApi,
}

export { ApiError }
