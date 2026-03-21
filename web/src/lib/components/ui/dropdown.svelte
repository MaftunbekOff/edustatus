<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { setContext } from 'svelte'

  interface Props {
    class?: string
    children?: Snippet
  }

  let { class: className = '', children }: Props = $props()

  let isOpen = $state(false)
  let ref = $state<HTMLDivElement | null>(null)

  function handleClickOutside(e: MouseEvent) {
    if (ref && !ref.contains(e.target as Node)) {
      isOpen = false
    }
  }

  $effect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  setContext('dropdown', {
    getIsOpen: () => isOpen,
    setIsOpen: (v: boolean) => { isOpen = v },
  })
</script>

<div bind:this={ref} class={cn('relative inline-block', className)}>
  {#if children}{@render children()}{/if}
</div>
