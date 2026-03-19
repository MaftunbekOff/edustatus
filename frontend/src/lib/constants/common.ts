/**
 * Common constants used across the application
 * These constants are shared between multiple pages and components
 */

// ==========================================
// PLAN TYPES AND COLORS
// ==========================================

/**
 * Subscription plan types
 */
export type PlanType = "basic" | "pro" | "enterprise"

/**
 * Plan display labels (Uzbek)
 */
export const PLAN_LABELS: Record<PlanType, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
}

/**
 * Plan badge variants for UI components
 */
export const PLAN_COLORS: Record<PlanType, "outline" | "secondary" | "default"> = {
  basic: "outline",
  pro: "secondary",
  enterprise: "default",
}

/**
 * Plan prices in UZS
 */
export const PLAN_PRICES: Record<PlanType, number> = {
  basic: 500000,
  pro: 1500000,
  enterprise: 5000000,
}

/**
 * Plan features
 */
export const PLAN_FEATURES: Record<PlanType, string[]> = {
  basic: [
    "500 ta talaba",
    "To'lov monitoringi",
    "SMS bildirishnomalar (100/oy)",
    "Hisobotlar",
  ],
  pro: [
    "2000 ta talaba",
    "To'lov monitoringi",
    "SMS bildirishnomalar (500/oy)",
    "Hisobotlar",
    "API integratsiya",
    "Custom domain",
  ],
  enterprise: [
    "Cheksiz talabalar",
    "To'lov monitoringi",
    "SMS bildirishnomalar (cheksiz)",
    "Hisobotlar",
    "API integratsiya",
    "Custom domain",
    "Priority support",
    "Custom integrations",
  ],
}

// ==========================================
// STATUS TYPES AND COLORS
// ==========================================

/**
 * Organization/Subscription status types
 */
export type StatusType = "active" | "trial" | "suspended" | "expired"

/**
 * Status display labels (Uzbek)
 */
export const STATUS_LABELS: Record<StatusType, string> = {
  active: "Faol",
  trial: "Sinov",
  suspended: "To'xtatilgan",
  expired: "Muddati o'tgan",
}

/**
 * Status badge variants for UI components
 */
export const STATUS_COLORS: Record<StatusType, "success" | "warning" | "error" | "secondary"> = {
  active: "success",
  trial: "warning",
  suspended: "error",
  expired: "secondary",
}

/**
 * Status descriptions (Uzbek)
 */
export const STATUS_DESCRIPTIONS: Record<StatusType, string> = {
  active: "Obuna faol holatda",
  trial: "Sinov davri",
  suspended: "Obuna to'xtatilgan",
  expired: "Obuna muddati tugagan",
}

// ==========================================
// PAYMENT STATUS TYPES AND COLORS
// ==========================================

/**
 * Payment status types
 */
export type PaymentStatusType = "pending" | "confirmed" | "rejected" | "refunded"

/**
 * Payment status display labels (Uzbek)
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatusType, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  rejected: "Rad etilgan",
  refunded: "Qaytarilgan",
}

/**
 * Payment status badge variants
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatusType, "warning" | "success" | "error" | "secondary"> = {
  pending: "warning",
  confirmed: "success",
  rejected: "error",
  refunded: "secondary",
}

// ==========================================
// PAYMENT METHODS
// ==========================================

/**
 * Payment method types
 */
export type PaymentMethodType = "cash" | "bank" | "click" | "payme" | "uzum" | "other"

/**
 * Payment method display labels (Uzbek)
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: "Naqd",
  bank: "Bank",
  click: "Click",
  payme: "Payme",
  uzum: "Uzum",
  other: "Boshqa",
}

/**
 * Payment method icons (lucide-react icon names)
 */
export const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, string> = {
  cash: "Banknote",
  bank: "Building2",
  click: "Smartphone",
  payme: "Wallet",
  uzum: "CreditCard",
  other: "CircleDollarSign",
}

// ==========================================
// DURATION TYPES
// ==========================================

/**
 * Subscription duration types
 */
export type DurationType = "monthly" | "quarterly" | "yearly"

/**
 * Duration display labels (Uzbek)
 */
export const DURATION_LABELS: Record<DurationType, string> = {
  monthly: "Oylik",
  quarterly: "Choraklik",
  yearly: "Yillik",
}

/**
 * Duration in months
 */
export const DURATION_MONTHS: Record<DurationType, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
}

// ==========================================
// LANGUAGE TYPES
// ==========================================

/**
 * Supported language types
 */
export type LanguageType = "uz" | "ru" | "en"

/**
 * Language display labels
 */
export const LANGUAGE_LABELS: Record<LanguageType, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English",
}

/**
 * Language native names
 */
export const LANGUAGE_NATIVE_NAMES: Record<LanguageType, string> = {
  uz: "O'zbek tili",
  ru: "Русский язык",
  en: "English language",
}

// ==========================================
// DATE FORMAT CONSTANTS
// ==========================================

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  /** Full date with time: "15 Yanvar 2025, 14:30" */
  full: "d MMMM yyyy, HH:mm",
  /** Short date: "15.01.2025" */
  short: "dd.MM.yyyy",
  /** Date only: "15 Yanvar 2025" */
  dateOnly: "d MMMM yyyy",
  /** Time only: "14:30" */
  timeOnly: "HH:mm",
  /** ISO format: "2025-01-15" */
  iso: "yyyy-MM-dd",
} as const

// ==========================================
// CURRENCY CONSTANTS
// ==========================================

/**
 * Currency types
 */
export type CurrencyType = "UZS" | "USD"

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  UZS: "so'm",
  USD: "$",
}

/**
 * Currency formatting options
 */
export const CURRENCY_FORMAT_OPTIONS: Record<CurrencyType, Intl.NumberFormatOptions> = {
  UZS: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  USD: {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
}

// ==========================================
// PAGINATION CONSTANTS
// ==========================================

/**
 * Default page size for tables
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Page size options for tables
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

/**
 * Maximum items per page
 */
export const MAX_PAGE_SIZE = 100

// ==========================================
// VALIDATION CONSTANTS
// ==========================================

/**
 * INN length (Uzbekistan)
 */
export const INN_LENGTH = 9

/**
 * PINFL length (Uzbekistan)
 */
export const PINFL_LENGTH = 14

/**
 * Phone number length (Uzbekistan, without +998)
 */
export const PHONE_LENGTH = 9

/**
 * Phone number prefix (Uzbekistan)
 */
export const PHONE_PREFIX = "+998"

/**
 * Password minimum length
 */
export const PASSWORD_MIN_LENGTH = 8

/**
 * Password maximum length
 */
export const PASSWORD_MAX_LENGTH = 128

// ==========================================
// FILE UPLOAD CONSTANTS
// ==========================================

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Allowed image file types
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

/**
 * Allowed document file types
 */
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const

// ==========================================
// API CONSTANTS
// ==========================================

/**
 * API base URL (from environment)
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = 30000

/**
 * API retry count
 */
export const API_RETRY_COUNT = 3

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================

/**
 * Local storage key names
 */
export const STORAGE_KEYS = {
  /** Auth token */
  AUTH_TOKEN: "auth_token",
  /** Refresh token */
  REFRESH_TOKEN: "refresh_token",
  /** User preferences */
  USER_PREFERENCES: "user_preferences",
  /** Theme preference */
  THEME: "theme",
  /** Language preference */
  LANGUAGE: "language",
  /** Sidebar collapsed state */
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
} as const

// ==========================================
// UI CONSTANTS
// ==========================================

/**
 * Sidebar width in pixels
 */
export const SIDEBAR_WIDTH = 280

/**
 * Sidebar collapsed width in pixels
 */
export const SIDEBAR_COLLAPSED_WIDTH = 80

/**
 * Header height in pixels
 */
export const HEADER_HEIGHT = 64

/**
 * Toast notification duration in milliseconds
 */
export const TOAST_DURATION = 5000

/**
 * Modal animation duration in milliseconds
 */
export const MODAL_ANIMATION_DURATION = 200

/**
 * Debounce delay in milliseconds
 */
export const DEBOUNCE_DELAY = 300

/**
 * Throttle delay in milliseconds
 */
export const THROTTLE_DELAY = 100
