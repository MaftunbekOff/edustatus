/**
 * Utils Barrel Export
 * 
 * This file re-exports all utility functions for clean imports.
 * Following CODING_STANDARDS.md - Module organization pattern.
 * 
 * @example
 * import { formatInn, formatCurrency } from "@/lib/utils"
 */

// Organization utilities
export {
  formatInn,
  getOrganizationTypeLabel,
  getRegionLabel,
  getDistrictLabel,
  formatCurrency,
  formatDate,
  getActiveFeaturesCount,
  getActiveIntegrationsCount,
  getDisplayDomain,
  getOrganizationDisplayValues,
  type OrganizationDisplayValues,
} from "./organization"
