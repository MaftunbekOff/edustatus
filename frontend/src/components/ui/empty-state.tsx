"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileX,
  Users,
  CreditCard,
  Search,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Inbox,
} from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-built empty states
export function NoDataState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<FileX className="h-12 w-12" />}
      title="Ma'lumotlar topilmadi"
      description="Hozircha hech qanday ma'lumot yo'q"
      action={onAdd ? { label: "Yangi qo'shish", onClick: onAdd } : undefined}
    />
  )
}

export function NoStudentsState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Talabalar topilmadi"
      description="Tizimda hozircha talabalar mavjud emas. Yangi talaba qo'shing."
      action={onAdd ? { label: "Talaba qo'shish", onClick: onAdd } : undefined}
    />
  )
}

export function NoPaymentsState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<CreditCard className="h-12 w-12" />}
      title="To'lovlar topilmadi"
      description="Hozircha to'lovlar tarixi bo'sh"
      action={onAdd ? { label: "To'lov qo'shish", onClick: onAdd } : undefined}
    />
  )
}

export function NoSearchResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="Qidiruv natijalari topilmadi"
      description={
        query
          ? `"${query}" bo'yicha hech narsa topilmadi. Boshqa so'rovnoma bilan qidirib ko'ring.`
          : "Qidiruv so'rovini kiriting"
      }
    />
  )
}

export function NoFilesState() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title="Fayllar topilmadi"
      description="Bu bo'limda hozircha fayllar mavjud emas"
    />
  )
}

export function ErrorState({
  title = "Xatolik yuz berdi",
  description = "Ma'lumotlarni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring.",
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-red-500" />}
      title={title}
      description={description}
      action={onRetry ? { label: "Qayta urinish", onClick: onRetry } : undefined}
    />
  )
}

export function SuccessState({
  title = "Muvaffaqiyatli!",
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      icon={<CheckCircle className="h-12 w-12 text-green-500" />}
      title={title}
      description={description}
    />
  )
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={<Inbox className="h-12 w-12" />}
      title="Bildirishnomalar yo'q"
      description="Hozircha yangi bildirishnomalar mavjud emas"
    />
  )
}

export function NoDebtState() {
  return (
    <EmptyState
      icon={<CheckCircle className="h-12 w-12 text-green-500" />}
      title="Qarzdorlik yo'q"
      description="Barcha talabalar o'z vaqtida to'lov qilishgan!"
    />
  )
}
