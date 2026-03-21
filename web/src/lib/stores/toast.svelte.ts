interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

function createToastStore() {
  let toasts = $state<Toast[]>([])

  function add(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, message, type, duration }]
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id)
  }

  return {
    get toasts() { return toasts },
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    warning: (msg: string) => add(msg, 'warning'),
    info: (msg: string) => add(msg, 'info'),
    remove,
  }
}

export const toast = createToastStore()
