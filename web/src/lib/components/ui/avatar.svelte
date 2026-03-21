<script lang="ts">
  import { cn } from '$lib/utils'
  import { User } from 'lucide-svelte'

  type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

  interface Props {
    src?: string
    alt?: string
    name?: string
    size?: AvatarSize
    status?: AvatarStatus
    class?: string
  }

  let {
    src,
    alt,
    name,
    size = 'md',
    status,
    class: className = '',
  }: Props = $props()

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  }

  const statusColors: Record<AvatarStatus, string> = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  }

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  }

  function getInitials(fullName: string): string {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return fullName.substring(0, 2).toUpperCase()
  }

  function getColorFromName(fullName: string): string {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    ]
    let hash = 0
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  let imageError = $state(false)
</script>

<div class="relative inline-block">
  <div
    class={cn(
      'relative flex items-center justify-center overflow-hidden rounded-full bg-muted',
      sizeClasses[size],
      className,
    )}
  >
    {#if src && !imageError}
      <img
        {src}
        alt={alt || name || 'Avatar'}
        class="h-full w-full object-cover"
        onerror={() => (imageError = true)}
      />
    {:else if name}
      <span class={cn('font-medium text-white', getColorFromName(name))}>
        {getInitials(name)}
      </span>
    {:else}
      <User class="h-1/2 w-1/2 text-muted-foreground" />
    {/if}
  </div>

  {#if status}
    <span
      class={cn(
        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
        statusColors[status],
        statusSizes[size],
      )}
    ></span>
  {/if}
</div>
