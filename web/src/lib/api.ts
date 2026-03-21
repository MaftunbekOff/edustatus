const API_BASE =
  typeof window !== 'undefined'
    ? '' // browser: proxy /api → backend
    : (import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8082')

interface FetchOptions extends RequestInit {
  token?: string
  skipAuthRefresh?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
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
  refreshSubscribers.forEach((callback) => callback())
  refreshSubscribers = []
}

function clearSessionAndRedirect() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user')
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    return response.ok
  } catch {
    return false
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401 && !skipAuthRefresh) {
    if (!isRefreshing) {
      isRefreshing = true
      const refreshSuccess = await refreshAccessToken()
      isRefreshing = false

      if (refreshSuccess) {
        onTokenRefreshed()
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
              reject(new ApiError(`HTTP error! status: ${retryResponse.status}`, retryResponse.status))
            }
          } catch (error) {
            reject(error)
          }
        })
      })
    }
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>
    const nested =
      errorData &&
      typeof errorData.error === 'object' &&
      errorData.error !== null &&
      'message' in errorData.error
        ? String((errorData.error as { message?: string }).message)
        : undefined
    const flat =
      typeof errorData.message === 'string' ? errorData.message : undefined
    throw new ApiError(
      nested || flat || `HTTP error! status: ${response.status}`,
      response.status,
      errorData,
    )
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi<{ user: unknown; message: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    })
  },

  getMe: async () => {
    return fetchApi<{ id: string; email: string; fullName: string; role: string }>('/api/v1/auth/me')
  },
}

// Dashboard API
export const dashboardApi = {
  getStats: async (organizationId?: string) => {
    const url = organizationId
      ? `/api/v1/dashboard/stats?organizationId=${organizationId}`
      : '/api/v1/dashboard/stats'
    return fetchApi<{
      todayPayments: number
      todayCount: number
      monthlyPlan: number
      monthlyActual: number
      monthlyPercent: number
      totalClients: number
      totalDebt: number
      activeClients: number
    }>(url)
  },

  getSuperAdminStats: async () => {
    return fetchApi<{
      totalOrganizations: number
      activeOrganizations: number
      totalClients: number
      totalRevenue: number
    }>('/api/v1/dashboard/stats')
  },
}

// Clients API
export const clientsApi = {
  getAll: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/clients?organizationId=${organizationId}`)
  },

  getDuplicates: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/clients/duplicates?organizationId=${organizationId}`)
  },

  getDebtors: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/clients/debtors?organizationId=${organizationId}`)
  },

  getById: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/clients/${id}`)
  },

  create: async (data: unknown) => {
    return fetchApi<unknown>('/api/v1/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: unknown) => {
    return fetchApi<unknown>(`/api/v1/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/api/v1/clients/${id}`, { method: 'DELETE' })
  },
}

// Payments API
export const paymentsApi = {
  getAll: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/payments?organizationId=${organizationId}`)
  },

  getStats: async (organizationId: string) => {
    return fetchApi<unknown>(`/api/v1/payments/stats?organizationId=${organizationId}`)
  },

  getById: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/payments/${id}`)
  },

  create: async (data: unknown) => {
    return fetchApi<unknown>('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  confirm: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/payments/${id}/confirm`, { method: 'POST' })
  },

  reject: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/payments/${id}/reject`, { method: 'POST' })
  },
}

// Departments API
export const departmentsApi = {
  getAll: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/departments?organizationId=${organizationId}`)
  },

  getById: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/departments/${id}`)
  },

  create: async (data: unknown) => {
    return fetchApi<unknown>('/api/v1/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/api/v1/departments/${id}`, { method: 'DELETE' })
  },
}

// Organizations API
export const organizationsApi = {
  getAll: async () => {
    return fetchApi<unknown[]>('/api/v1/organizations')
  },

  getById: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/organizations/${id}`)
  },

  getStats: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/organizations/${id}/stats`)
  },

  create: async (data: unknown) => {
    return fetchApi<unknown>('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: unknown) => {
    return fetchApi<unknown>(`/api/v1/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/api/v1/organizations/${id}`, { method: 'DELETE' })
  },

  tabulaRasa: async (id: string) => {
    return fetchApi<unknown>(`/api/v1/organizations/${id}/tabula-rasa`, { method: 'POST' })
  },

  getChildren: async (id: string) => {
    return fetchApi<unknown[]>(`/api/v1/organizations/${id}/children`)
  },

  createChild: async (parentId: string, data: unknown) => {
    return fetchApi<unknown>(`/api/v1/organizations/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAdmins: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/organizations/${organizationId}/admins`)
  },

  createAdmin: async (organizationId: string, data: unknown) => {
    return fetchApi<unknown>(`/api/v1/organizations/${organizationId}/admins`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateAdmin: async (organizationId: string, adminId: string, data: unknown) => {
    return fetchApi<unknown>(`/api/v1/organizations/${organizationId}/admins/${adminId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteAdmin: async (organizationId: string, adminId: string) => {
    return fetchApi<unknown>(`/api/v1/organizations/${organizationId}/admins/${adminId}`, {
      method: 'DELETE',
    })
  },
}

// Custom Domains API
export const customDomainsApi = {
  getAll: async (organizationId: string) => {
    return fetchApi<unknown[]>(`/api/v1/organizations/${organizationId}/custom-domains`)
  },

  create: async (organizationId: string, data: { domain: string; isPrimary?: boolean }) => {
    return fetchApi<unknown>(`/api/v1/organizations/${organizationId}/custom-domains`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  verify: async (organizationId: string, domainId: string) => {
    return fetchApi<unknown>(
      `/api/v1/organizations/${organizationId}/custom-domains/${domainId}/verify`,
      { method: 'POST' },
    )
  },

  setPrimary: async (organizationId: string, domainId: string) => {
    return fetchApi<unknown>(
      `/api/v1/organizations/${organizationId}/custom-domains/${domainId}/primary`,
      { method: 'PUT' },
    )
  },

  delete: async (organizationId: string, domainId: string) => {
    return fetchApi<void>(
      `/api/v1/organizations/${organizationId}/custom-domains/${domainId}`,
      { method: 'DELETE' },
    )
  },
}

// Legacy aliases
export const collegesApi = organizationsApi
export const studentsApi = clientsApi
export const groupsApi = departmentsApi
