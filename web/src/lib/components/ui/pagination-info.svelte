<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    currentPage: number
    pageSize: number
    totalItems: number
    class?: string
  }

  let { currentPage, pageSize, totalItems, class: className = '' }: Props = $props()

  const startItem = $derived((currentPage - 1) * pageSize + 1)
  const endItem = $derived(Math.min(currentPage * pageSize, totalItems))
</script>

<p class={cn('text-sm text-muted-foreground', className)}>
  {startItem}-{endItem} / {totalItems} ta
</p>
