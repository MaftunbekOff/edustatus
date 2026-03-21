<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'

  interface DropdownCtx {
    getIsOpen: () => boolean
    setIsOpen: (v: boolean) => void
  }

  interface Props {
    align?: 'start' | 'center' | 'end'
    class?: string
    children?: Snippet
  }

  let { align = 'end', class: className = '', children }: Props = $props()

  const ctx = getContext<DropdownCtx>('dropdown')
  const isOpen = $derived(ctx.getIsOpen())

  const alignClasses: Record<string, string> = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }
</script>

{#if isOpen}
  <div
    class={cn(
      'absolute top-full z-50 mt-2 min-w-[180px] rounded-md border bg-background p-1 shadow-lg',
      alignClasses[align],
      className,
    )}
  >
    {#if children}{@render children()}{/if}
  </div>
{/if}
