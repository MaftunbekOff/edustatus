<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    children?: Snippet
  }

  let { class: className = '', children }: Props = $props()
</script>

<div class={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1', className)}>
  {#if children}{@render children()}{/if}
</div>
