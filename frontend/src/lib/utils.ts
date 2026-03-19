import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'rejected':
    case 'cancelled':
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getStatusText(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Tasdiqlangan'
    case 'pending':
      return 'Kutilmoqda'
    case 'rejected':
      return 'Rad etilgan'
    case 'active':
      return 'Faol'
    case 'blocked':
      return 'Bloklangan'
    case 'completed':
      return 'Yakunlangan'
    case 'cancelled':
      return 'Bekor qilingan'
    default:
      return status
  }
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

export function getDebtStatus(debt: number): {
  color: string
  text: string
  icon: 'success' | 'warning' | 'error'
} {
  if (debt === 0) {
    return { color: 'text-green-600', text: "To'liq to'langan", icon: 'success' }
  } else if (debt > 0 && debt <= 1000000) {
    return { color: 'text-yellow-600', text: 'Kichik qarzdorlik', icon: 'warning' }
  } else {
    return { color: 'text-red-600', text: 'Katta qarzdorlik', icon: 'error' }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
