<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Component } from 'svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'

  interface Props {
    title: string
    value: string | number
    description?: string
    icon: Component
    trend?: { value: number; isPositive: boolean }
    class?: string
  }

  let { title, value, description, icon: Icon, trend, class: className = '' }: Props = $props()
</script>

<Card class={cn(className)}>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle class="text-sm font-medium">{title}</CardTitle>
    <Icon class="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold">{value}</div>
    {#if description}
      <p class="text-xs text-muted-foreground mt-1">{description}</p>
    {/if}
    {#if trend}
      <p class={cn('text-xs mt-1', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
        {trend.isPositive ? '+' : ''}{trend.value}% o'tgan oydan
      </p>
    {/if}
  </CardContent>
</Card>
