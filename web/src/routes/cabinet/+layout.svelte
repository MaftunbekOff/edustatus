<script lang="ts">
  import CabinetSidebar from '$lib/components/layout/CabinetSidebar.svelte'
  import CabinetHeader from '$lib/components/layout/CabinetHeader.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    data: { user: App.Locals['user'] }
    children: Snippet
  }
  let { children }: Props = $props()
</script>

<div class="min-h-screen bg-background">
  <CabinetSidebar />
  <div class="lg:pl-64">
    <CabinetHeader />
    <main class="p-4 lg:p-6">
      {@render children()}
    </main>
  </div>
</div>
