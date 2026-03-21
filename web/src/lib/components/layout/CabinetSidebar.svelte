<script lang="ts">
  import { page } from '$app/stores'
  import { cn } from '$lib/utils'
  import { auth } from '$lib/stores/auth.svelte'
  import { LayoutDashboard, Building2, CreditCard, Settings, LogOut, Menu, X, Users, TrendingUp, Bell, Globe } from 'lucide-svelte'
  import Button from '$lib/components/ui/button.svelte'

  let mobileOpen = $state(false)

  const navigation = [
    { name: 'Dashboard', href: '/cabinet', icon: LayoutDashboard },
    { name: 'Tashkilotlar', href: '/cabinet/organization', icon: Building2 },
    { name: 'Tashkilot turlari', href: '/cabinet/organization-types', icon: Globe },
    { name: "Obunalar", href: '/cabinet/subscriptions', icon: CreditCard },
    { name: "To'lovlar", href: '/cabinet/billing', icon: TrendingUp },
    { name: 'Foydalanuvchilar', href: '/cabinet/users', icon: Users },
    { name: 'Sozlamalar', href: '/cabinet/settings', icon: Settings },
  ]

  const pathname = $derived($page.url.pathname)
</script>

<!-- Mobile button -->
<Button
  variant="ghost"
  size="icon"
  class="fixed top-4 left-4 z-50 lg:hidden"
  onclick={() => (mobileOpen = !mobileOpen)}
>
  {#if mobileOpen}<X class="h-6 w-6" />{:else}<Menu class="h-6 w-6" />{/if}
</Button>

{#if mobileOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onclick={() => (mobileOpen = false)}
    role="presentation"
  ></div>
{/if}

<aside
  class={cn(
    'fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0',
    mobileOpen ? 'translate-x-0' : '-translate-x-full',
  )}
>
  <div class="flex h-full flex-col">
    <!-- Logo -->
    <div class="flex h-16 items-center justify-center border-b border-white/10">
      <a href="/cabinet" class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <span class="text-lg font-bold text-purple-900">C</span>
        </div>
        <div>
          <span class="text-lg font-semibold">Cabinet</span>
          <p class="text-xs text-white/60">SaaS Boshqaruvi</p>
        </div>
      </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      {#each navigation as item}
        {@const isActive = pathname === item.href || pathname.startsWith(item.href + '/')}
        <a
          href={item.href}
          onclick={() => (mobileOpen = false)}
          class={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          <item.icon class="h-5 w-5" />
          {item.name}
        </a>
      {/each}
    </nav>

    <!-- Notifications -->
    <div class="border-t border-white/10 p-4">
      <button class="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
        <Bell class="h-5 w-5" />
        Bildirishnomalar
        <span class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">3</span>
      </button>
    </div>

    <!-- User section -->
    <div class="border-t border-white/10 p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <span class="text-sm font-medium">
            {auth.user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
          </span>
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="truncate text-sm font-medium">{auth.user?.fullName || 'Super Admin'}</p>
          <p class="truncate text-xs text-white/60">{auth.user?.email || ''}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="text-white/60 hover:text-white"
          onclick={() => auth.logout()}
        >
          <LogOut class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</aside>
