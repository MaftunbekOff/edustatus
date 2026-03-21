<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte'

  interface Props {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    siblingCount?: number
    class?: string
  }

  let {
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    class: className = '',
  }: Props = $props()

  function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
  }

  const paginationRange = $derived.by(() => {
    const totalPageNumbers = siblingCount + 5
    if (totalPageNumbers >= totalPages) return range(1, totalPages)

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    if (!shouldShowLeftDots && shouldShowRightDots) {
      return [...range(1, 3 + 2 * siblingCount), '...', totalPages]
    }
    if (shouldShowLeftDots && !shouldShowRightDots) {
      return [1, '...', ...range(totalPages - (3 + 2 * siblingCount) + 1, totalPages)]
    }
    if (shouldShowLeftDots && shouldShowRightDots) {
      return [1, '...', ...range(leftSiblingIndex, rightSiblingIndex), '...', totalPages]
    }
    return range(1, totalPages)
  })

  const btnBase =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
</script>

{#if totalPages > 1}
  <div class={cn('flex items-center justify-center gap-1', className)}>
    <button
      type="button"
      class="{btnBase} hidden border-input bg-background hover:bg-accent sm:inline-flex"
      disabled={currentPage === 1}
      onclick={() => onPageChange(1)}
    >
      <ChevronsLeft class="h-4 w-4" />
    </button>
    <button
      type="button"
      class="{btnBase} border-input bg-background hover:bg-accent"
      disabled={currentPage === 1}
      onclick={() => onPageChange(currentPage - 1)}
    >
      <ChevronLeft class="h-4 w-4" />
    </button>

    {#each paginationRange as page, i}
      {#if page === '...'}
        <span class="px-2 text-muted-foreground">...</span>
      {:else}
        <button
          type="button"
          class={cn(
            btnBase,
            currentPage === page
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background hover:bg-accent',
          )}
          onclick={() => onPageChange(page as number)}
        >
          {page}
        </button>
      {/if}
    {/each}

    <button
      type="button"
      class="{btnBase} border-input bg-background hover:bg-accent"
      disabled={currentPage === totalPages}
      onclick={() => onPageChange(currentPage + 1)}
    >
      <ChevronRight class="h-4 w-4" />
    </button>
    <button
      type="button"
      class="{btnBase} hidden border-input bg-background hover:bg-accent sm:inline-flex"
      disabled={currentPage === totalPages}
      onclick={() => onPageChange(totalPages)}
    >
      <ChevronsRight class="h-4 w-4" />
    </button>
  </div>
{/if}
