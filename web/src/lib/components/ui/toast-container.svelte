<script lang="ts">
  import { toast } from '$lib/stores/toast.svelte'
  import { cn } from '$lib/utils'

  const typeClasses: Record<string, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each toast.toasts as t (t.id)}
    <div
      class={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-md text-sm min-w-[280px] max-w-[400px]',
        typeClasses[t.type],
      )}
    >
      <span>{t.message}</span>
      <button
        onclick={() => toast.remove(t.id)}
        class="ml-2 flex-shrink-0 opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  {/each}
</div>
