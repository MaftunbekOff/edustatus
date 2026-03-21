<script lang="ts">
  import { Bell, User } from 'lucide-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import { auth } from '$lib/stores/auth.svelte'

  interface Props { title?: string }
  let { title }: Props = $props()
</script>

<header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
  <div class="flex-1">
    {#if title}
      <h1 class="text-lg font-semibold">{title}</h1>
    {:else}
      <h1 class="text-lg font-semibold">Cabinet</h1>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <Button variant="ghost" size="icon" class="relative">
      <Bell class="h-5 w-5" />
      <span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
    </Button>
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
        <span class="text-xs font-medium text-purple-700">
          {auth.user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
        </span>
      </div>
      <span class="hidden text-sm font-medium md:block">{auth.user?.fullName || 'Super Admin'}</span>
    </div>
  </div>
</header>
