<script lang="ts">
  import { cn } from '$lib/utils'
  interface Props { class?: string; size?: 'sm' | 'md' | 'lg' }
  let { class: className = '', size = 'md' }: Props = $props()
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
</script>
<div class={cn('animate-spin rounded-full border-b-2 border-primary', sizes[size], className)}></div>
