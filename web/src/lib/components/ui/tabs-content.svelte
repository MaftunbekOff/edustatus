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

{#if isActive}
  <div
    role="tabpanel"
    class={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
  >
    {#if children}{@render children()}{/if}
  </div>
{/if}
