import { dashboardApi } from '$lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const stats = await dashboardApi.getStats(locals.user?.organizationId)
    return { stats }
  } catch {
    return { stats: null }
  }
}
