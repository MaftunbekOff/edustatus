<script lang="ts">
  import Modal from './modal.svelte'
  import ModalFooter from './modal-footer.svelte'
  import Button from './button.svelte'
  import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  type ConfirmType = 'danger' | 'warning' | 'info' | 'success'

  interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    type?: ConfirmType
    isLoading?: boolean
  }

  let {
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Tasdiqlash',
    cancelText = 'Bekor qilish',
    type = 'danger',
    isLoading = false,
  }: Props = $props()

  const typeConfig: Record<ConfirmType, { confirmClass: string }> = {
    danger:  { confirmClass: 'bg-red-600 hover:bg-red-700 text-white' },
    warning: { confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
    info:    { confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white' },
    success: { confirmClass: 'bg-green-600 hover:bg-green-700 text-white' },
  }

  const iconColors: Record<ConfirmType, string> = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500',
  }
</script>

<Modal {isOpen} {onClose} size="sm">
  <div class="flex flex-col items-center p-4 text-center">
    <div class="mb-4">
      {#if type === 'danger'}
        <XCircle class={cn('h-10 w-10', iconColors.danger)} />
      {:else if type === 'warning'}
        <AlertTriangle class={cn('h-10 w-10', iconColors.warning)} />
      {:else if type === 'info'}
        <Info class={cn('h-10 w-10', iconColors.info)} />
      {:else}
        <CheckCircle class={cn('h-10 w-10', iconColors.success)} />
      {/if}
    </div>
    <h3 class="text-lg font-semibold">{title}</h3>
    {#if description}
      <p class="mt-2 text-sm text-muted-foreground">{description}</p>
    {/if}
  </div>
  <ModalFooter class="justify-center">
    <Button variant="outline" onclick={onClose} disabled={isLoading}>
      {cancelText}
    </Button>
    <Button
      class={typeConfig[type].confirmClass}
      onclick={onConfirm}
      disabled={isLoading}
    >
      {isLoading ? 'Kutilmoqda...' : confirmText}
    </Button>
  </ModalFooter>
</Modal>
