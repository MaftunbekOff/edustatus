import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login')
  }
  const cabinetRoles = ['creator', 'super_admin']
  if (!cabinetRoles.includes(locals.user.role)) {
    throw redirect(302, '/dashboard')
  }
  return { user: locals.user }
}
