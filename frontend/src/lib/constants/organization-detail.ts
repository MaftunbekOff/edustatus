/**
 * Organization Detail Constants
 * 
 * This file contains all constants related to organization detail page.
 * Following Single Responsibility Principle - constants are separated from logic.
 */

/**
 * Plan color mappings for Badge component
 */
export const PLAN_COLORS: Record<string, string> = {
  basic: "outline",
  pro: "secondary",
  enterprise: "default",
}

/**
 * Status color mappings for Badge component
 */
export const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "secondary"> = {
  active: "success",
  trial: "warning",
  suspended: "error",
}

/**
 * Status label mappings for display
 */
export const STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  trial: "Sinov",
  suspended: "To'xtatilgan",
}

/**
 * Plan labels for display
 */
export const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
}

/**
 * Feature toggle configuration
 * Defines which features can be toggled and their display properties
 */
export const FEATURE_CONFIG = {
  hasStudents: {
    label: "Talabalar",
    description: "Talabalar boshqaruvi",
    color: "blue",
  },
  hasPayments: {
    label: "To'lovlar",
    description: "To'lovlar kuzatish",
    color: "green",
  },
  hasReports: {
    label: "Hisobotlar",
    description: "Hisobotlar yaratish",
    color: "purple",
  },
  hasExcelImport: {
    label: "Excel import",
    description: "Excel fayllarni import qilish",
    color: "indigo",
  },
  hasPdfReports: {
    label: "PDF hisobotlar",
    description: "PDF formatida hisobotlar",
    color: "pink",
  },
  allowSubColleges: {
    label: "Quyi tashkilotlar",
    description: "Filiallarni boshqarish",
    color: "teal",
  },
} as const

/**
 * Integration configuration
 * Defines integration types and their display properties
 */
export const INTEGRATION_CONFIG = {
  hasBankIntegration: {
    label: "Bank API",
    description: "Bank bilan avtomatik sinxronizatsiya",
    icon: "wallet",
    color: "blue",
  },
  hasTelegramBot: {
    label: "Telegram Bot",
    description: "Avtomatik xabarlar va bildirishnomalar",
    icon: "users",
    color: "cyan",
  },
  hasSmsNotifications: {
    label: "SMS xizmati",
    description: "Ota-onalarga SMS yuborish",
    icon: "phone",
    color: "yellow",
  },
} as const

/**
 * Limit configuration
 * Defines limit types and their display properties
 */
export const LIMIT_CONFIG = {
  studentLimit: {
    label: "Talabalar chegarasi",
    description: "Maksimal talabalar soni",
    color: "blue",
  },
  groupLimit: {
    label: "Guruhlar chegarasi",
    description: "Maksimal guruhlar soni",
    color: "purple",
  },
} as const

/**
 * Tab item type
 */
export interface TabItem {
  value: string
  label: string
  className?: string
}

/**
 * Tab configuration for organization detail page
 */
export const TAB_CONFIG: TabItem[] = [
  { value: "overview", label: "Umumiy" },
  { value: "finance", label: "Moliya" },
  { value: "administrators", label: "Administratorlar" },
  { value: "children", label: "Quyi tashkilotlar" },
  { value: "domains", label: "Domainlar" },
  { value: "settings", label: "Sozlamalar" },
  { value: "danger", label: "Xavfli zona", className: "text-red-600" },
]

/**
 * Default settings data structure
 */
export const DEFAULT_SETTINGS_DATA = {
  hasStudents: false,
  hasPayments: false,
  hasReports: false,
  hasBankIntegration: false,
  hasTelegramBot: false,
  hasSmsNotifications: false,
  hasExcelImport: false,
  hasPdfReports: false,
  allowSubColleges: false,
  studentLimit: 100,
  groupLimit: 10,
}

/**
 * Placeholder transactions for finance tab
 * In production, these would come from API
 */
export const PLACEHOLDER_TRANSACTIONS = [
  { type: 'subscription', name: 'Obuna to\'lovi', plan: 'PRO', amount: 500000, date: new Date(Date.now() - 86400000) },
  { type: 'upgrade', name: 'Tarif yangilash', plan: 'BASIC → PRO', amount: 300000, date: new Date(Date.now() - 7 * 86400000) },
  { type: 'subscription', name: 'Obuna to\'lovi', plan: 'BASIC', amount: 200000, date: new Date(Date.now() - 30 * 86400000) },
  { type: 'addon', name: 'Qo\'shimcha xizmat', plan: 'SMS paket', amount: 50000, date: new Date(Date.now() - 45 * 86400000) },
  { type: 'subscription', name: 'Obuna to\'lovi', plan: 'BASIC', amount: 200000, date: new Date(Date.now() - 60 * 86400000) },
]
