<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Component, Snippet } from 'svelte'

  interface Props {
    icon?: Component
    title: string
    description?: string
    class?: string
    children?: Snippet
  }

  let { icon: Icon, title, description, class: className = '', children }: Props = $props()
</script>

<div class={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
  {#if Icon}
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
      <Icon class="h-8 w-8 text-muted-foreground" />
    </div>
  {/if}
  <h3 class="mb-1 text-lg font-semibold">{title}</h3>
  {#if description}
    <p class="text-sm text-muted-foreground">{description}</p>
  {/if}
  {#if children}
    <div class="mt-4">
      {@render children()}
    </div>
  {/if}
</div>
