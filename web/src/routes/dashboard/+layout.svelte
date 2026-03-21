<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte'
  import Header from '$lib/components/layout/Header.svelte'
  import { orgStore } from '$lib/stores/organization.svelte'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    data: { user: App.Locals['user'] }
    children: Snippet
  }
  let { data, children }: Props = $props()

  onMount(async () => {
    if (data.user?.organizationId) {
      await orgStore.load(data.user.organizationId)
    }
  })
</script>

<div class="min-h-screen bg-background">
  <Sidebar />
  <div class="lg:pl-64">
    <Header />
    <main class="p-4 lg:p-6">
      {@render children()}
    </main>
  </div>
</div>
