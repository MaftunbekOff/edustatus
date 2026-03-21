import { organizationsApi } from '$lib/api'
import type { Organization } from '$lib/types/organization'

function createOrganizationStore() {
  let organization = $state<Organization | null>(null)
  let isLoading = $state(false)

  const organizationType = $derived(organization?.type || 'other')

  async function load(organizationId: string) {
    if (!organizationId) return
    isLoading = true
    try {
      organization = (await organizationsApi.getById(organizationId)) as Organization
    } catch {
      organization = null
    } finally {
      isLoading = false
    }
  }

  async function refresh() {
    if (organization?.id) {
      await load(organization.id)
    }
  }

  return {
    get organization() { return organization },
    get organizationType() { return organizationType },
    get isLoading() { return isLoading },
    load,
    refresh,
  }
}

export const orgStore = createOrganizationStore()
