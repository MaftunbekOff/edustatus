"use client"

import * as React from "react"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

export type ConfirmType = "danger" | "warning" | "info" | "success"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmType
  isLoading?: boolean
}

const typeConfig = {
  danger: {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    confirmVariant: "default" as const,
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
    confirmVariant: "default" as const,
    confirmClass: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: <Info className="h-6 w-6 text-blue-500" />,
    confirmVariant: "default" as const,
    confirmClass: "bg-blue-600 hover:bg-blue-700",
  },
  success: {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    confirmVariant: "default" as const,
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  type = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const config = typeConfig[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4">{config.icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <ModalFooter className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          className={config.confirmClass}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Kutilmoqda..." : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Hook for easier usage
interface UseConfirmDialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmType
  onConfirm: () => void | Promise<void>
}

export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    isOpen: boolean
    options: UseConfirmDialogOptions | null
    isLoading: boolean
  }>({
    isOpen: false,
    options: null,
    isLoading: false,
  })

  const confirm = React.useCallback((options: UseConfirmDialogOptions) => {
    setState({ isOpen: true, options, isLoading: false })
  }, [])

  const handleConfirm = React.useCallback(async () => {
    if (!state.options) return

    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await state.options.onConfirm()
      setState((prev) => ({ ...prev, isOpen: false, isLoading: false }))
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [state.options])

  const handleClose = React.useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const dialog = state.options ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.options.title}
      description={state.options.description}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      type={state.options.type}
      isLoading={state.isLoading}
    />
  ) : null

  return { confirm, dialog }
}
