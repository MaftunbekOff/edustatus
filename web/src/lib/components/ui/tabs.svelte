<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { setContext } from 'svelte'

  interface Props {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
    class?: string
    children?: Snippet
  }

  let {
    defaultValue,
    value = $bindable(undefined),
    onValueChange,
    class: className = '',
    children,
  }: Props = $props()

  let activeTab = $state(value ?? defaultValue)

  $effect(() => {
    if (value !== undefined) activeTab = value
  })

  function setActiveTab(newValue: string) {
    activeTab = newValue
    onValueChange?.(newValue)
  }

  setContext('tabs', {
    getActiveTab: () => activeTab,
    setActiveTab,
  })
</script>

<div class={cn('w-full', className)}>
  {#if children}{@render children()}{/if}
</div>
