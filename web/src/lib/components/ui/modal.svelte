<script lang="ts">
  import { cn } from '$lib/utils'
  import { X } from 'lucide-svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    class?: string
    children?: Snippet
  }

  let {
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    class: className = '',
    children,
  }: Props = $props()

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 transition-opacity"
      onclick={onClose}
      role="presentation"
    ></div>

    <!-- Modal panel -->
    <div
      class={cn(
        'relative z-50 w-full rounded-lg bg-background p-6 shadow-lg',
        sizeClasses[size],
        className,
      )}
      role="dialog"
      aria-modal="true"
    >
      {#if title || description}
        <div class="mb-4 pr-6">
          {#if title}
            <h2 class="text-lg font-semibold">{title}</h2>
          {/if}
          {#if description}
            <p class="text-sm text-muted-foreground">{description}</p>
          {/if}
        </div>
      {/if}

      <button
        type="button"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onclick={onClose}
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Yopish</span>
      </button>

      {#if children}{@render children()}{/if}
    </div>
  </div>
{/if}
