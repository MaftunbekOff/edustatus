<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'

  interface DropdownCtx {
    getIsOpen: () => boolean
    setIsOpen: (v: boolean) => void
  }

  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()

  const ctx = getContext<DropdownCtx>('dropdown')
</script>

<button type="button" onclick={() => ctx.setIsOpen(!ctx.getIsOpen())}>
  {#if children}{@render children()}{/if}
</button>
