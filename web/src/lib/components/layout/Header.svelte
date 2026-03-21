<script lang="ts">
  import { Bell, Search, User } from 'lucide-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'

  interface Props {
    title?: string
  }

  let { title }: Props = $props()
</script>

<header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
  <!-- Search -->
  <div class="flex-1">
    <div class="relative max-w-md">
      <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder="Qidirish..." class="pl-8" />
    </div>
  </div>

  <!-- Title -->
  {#if title}
    <h1 class="hidden text-lg font-semibold md:block">{title}</h1>
  {/if}

  <!-- Actions -->
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="icon" class="relative">
      <Bell class="h-5 w-5" />
      <span
        class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
      >
        3
      </span>
    </Button>
    <Button variant="ghost" size="icon">
      <User class="h-5 w-5" />
    </Button>
  </div>
</header>
