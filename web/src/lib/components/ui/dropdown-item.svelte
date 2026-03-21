<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'

  interface DropdownCtx {
    getIsOpen: () => boolean
    setIsOpen: (v: boolean) => void
  }

  interface Props {
    icon?: Snippet
    destructive?: boolean
    class?: string
    onclick?: () => void
    children?: Snippet
  }

  let {
    icon,
    destructive = false,
    class: className = '',
    onclick,
    children,
  }: Props = $props()

  const ctx = getContext<DropdownCtx>('dropdown')

  function handleClick() {
    onclick?.()
    ctx.setIsOpen(false)
  }
</script>

<button
  type="button"
  onclick={handleClick}
  class={cn(
    'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted',
    destructive && 'text-red-600 hover:bg-red-50 focus:bg-red-50',
    className,
  )}
>
  {#if icon}
    <span class="h-4 w-4">{@render icon()}</span>
  {/if}
  {#if children}{@render children()}{/if}
</button>
