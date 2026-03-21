<script lang="ts">
  import { page } from '$app/stores'
  import { cn } from '$lib/utils'
  import { auth } from '$lib/stores/auth.svelte'
  import { orgStore } from '$lib/stores/organization.svelte'
  import {
    getNavigationForOrganizationType,
    organizationTypeToCategory,
    type NavItem,
  } from '$lib/constants/navigation'
  import { ChevronDown, ChevronRight, Menu, X, LogOut } from 'lucide-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import type { Component } from 'svelte'

  let mobileOpen = $state(false)

  const navigation = $derived(
    getNavigationForOrganizationType(orgStore.organizationType || 'college'),
  )

  const orgInfo = $derived({
    name: orgStore.organization?.name || 'Tashkilot',
    type: organizationTypeToCategory[orgStore.organizationType] || 'other',
  })

  const pathname = $derived($page.url.pathname)
</script>

<!-- Mobile menu button -->
<Button
  variant="ghost"
  size="icon"
  class="fixed top-4 left-4 z-50 lg:hidden"
  onclick={() => (mobileOpen = !mobileOpen)}
>
  {#if mobileOpen}
    <X class="h-6 w-6" />
  {:else}
    <Menu class="h-6 w-6" />
  {/if}
</Button>

<!-- Mobile overlay -->
{#if mobileOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onclick={() => (mobileOpen = false)}
    role="presentation"
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class={cn(
    'fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto',
    mobileOpen ? 'translate-x-0' : '-translate-x-full',
  )}
>
  <div class="flex h-full flex-col">
    <!-- Logo -->
    <div class="flex h-16 items-center justify-center border-b border-slate-700">
      <a href="/" class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span class="text-lg font-bold">E</span>
        </div>
        <span class="text-lg font-semibold">EduStatus</span>
      </a>
    </div>

    <!-- Organization Info -->
    {#if orgStore.organization}
      <div class="border-b border-slate-700 px-4 py-3">
        <p class="truncate text-sm font-medium text-white">{orgInfo.name}</p>
        <p class="text-xs capitalize text-slate-400">{orgInfo.type}</p>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      {#each navigation as item}
        <NavItemComponent {item} {pathname} onClose={() => (mobileOpen = false)} />
      {/each}
    </nav>

    <!-- User section -->
    <div class="border-t border-slate-700 p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
          <span class="text-sm font-medium">
            {auth.user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="truncate text-sm font-medium">{auth.user?.fullName || 'Admin'}</p>
          <p class="truncate text-xs text-slate-400">{auth.user?.email || ''}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="text-slate-400 hover:text-white"
          onclick={() => auth.logout()}
        >
          <LogOut class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</aside>

<!-- NavItemComponent defined inline -->
{#snippet NavItemComponent({
  item,
  pathname,
  onClose,
  depth = 0,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
  depth?: number
})}
  {@const hasChildren = item.children && item.children.length > 0}
  {@const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))}

  {#if hasChildren}
    {@render ExpandableNav({ item, pathname, onClose, isActive })}
  {:else}
    <a
      href={item.href}
      onclick={onClose}
      class={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
      )}
    >
      <item.icon class="h-5 w-5" />
      {item.name}
    </a>
  {/if}
{/snippet}

{#snippet ExpandableNav({
  item,
  pathname,
  onClose,
  isActive,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
  isActive: boolean
})}
  {@const isChildActive = item.children?.some((c) => pathname === c.href)}
  <details open={isChildActive} class="group space-y-1">
    <summary
      class={cn(
        'flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
      )}
    >
      <div class="flex items-center gap-3">
        <item.icon class="h-5 w-5" />
        {item.name}
      </div>
      <ChevronDown class="h-4 w-4 group-open:hidden" />
      <ChevronRight class="hidden h-4 w-4 group-open:block" />
    </summary>
    <div class="ml-4 space-y-1 border-l border-slate-700 pl-2">
      {#each item.children! as child}
        {@const childActive = pathname === child.href}
        <a
          href={child.href}
          onclick={onClose}
          class={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            childActive
              ? 'bg-primary text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          )}
        >
          <child.icon class="h-5 w-5" />
          {child.name}
        </a>
      {/each}
    </div>
  </details>
{/snippet}
