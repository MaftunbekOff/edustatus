import { authApi, ApiError } from '$lib/api'
import { goto } from '$app/navigation'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  organizationId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

function createAuthStore() {
  let user = $state<User | null>(null)
  let isLoading = $state(true)
  let error = $state<string | null>(null)

  async function init() {
    try {
      const userFromServer = await authApi.getMe()
      user = userFromServer as User
    } catch {
      user = null
    } finally {
      isLoading = false
    }
  }

  async function login(email: string, password: string) {
    error = null
    isLoading = true

    try {
      const response = await authApi.login(email, password)
      const userData = (response as { user: User }).user
      user = userData

      const cabinetRoles = ['creator', 'super_admin']
      await goto(cabinetRoles.includes(userData.role) ? '/cabinet' : '/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        const d = err.data as Record<string, unknown> | undefined
        const nested =
          d?.error &&
          typeof d.error === 'object' &&
          d.error !== null &&
          'message' in d.error
            ? String((d.error as { message?: string }).message)
            : undefined
        error = nested || (typeof d?.message === 'string' ? d.message : undefined) || err.message
      } else {
        error = "Login xatosi. Qaytadan urinib ko'ring."
      }
      throw err
    } finally {
      isLoading = false
    }
  }

  async function logout() {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }
    user = null
    await goto('/login')
  }

  return {
    get user() { return user },
    get isLoading() { return isLoading },
    get error() { return error },
    set error(val: string | null) { error = val },
    init,
    login,
    logout,
  }
}

export const auth = createAuthStore()
