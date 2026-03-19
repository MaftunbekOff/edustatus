/**
 * Organization List Constants
 * 
 * This file contains all constants related to organization list page.
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
 * Plan filter options
 */
export const PLAN_FILTER_OPTIONS = [
  { value: "", label: "Barcha tariflar" },
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
] as const

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Barcha statuslar" },
  { value: "active", label: "Faol" },
  { value: "trial", label: "Sinov" },
  { value: "suspended", label: "To'xtatilgan" },
] as const
