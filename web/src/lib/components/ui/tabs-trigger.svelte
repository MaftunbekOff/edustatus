<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'

  interface TabsCtx {
    getActiveTab: () => string
    setActiveTab: (v: string) => void
  }

  interface Props {
    value: string
    class?: string
    children?: Snippet
  }

  let { value, class: className = '', children }: Props = $props()

  const tabs = getContext<TabsCtx>('tabs')
  const isActive = $derived(tabs.getActiveTab() === value)
</script>

<button
  type="button"
  role="tab"
  aria-selected={isActive}
  onclick={() => tabs.setActiveTab(value)}
  class={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
    className,
  )}
>
  {#if children}{@render children()}{/if}
</button>
