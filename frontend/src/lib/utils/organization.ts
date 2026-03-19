/**
 * Organization Utility Functions
 * 
 * This file contains utility functions for organization-related operations.
 * Following Single Responsibility Principle - utilities are pure functions.
 */

import { organizationTypes } from "@/lib/constants/organization"
import { regions, districtsByRegion } from "@/lib/constants/regions"

/**
 * Formats INN (Individual Taxpayer Number) string
 * @param inn - The INN string to format
 * @returns Formatted INN string (XXX XXX XXX) or original if invalid
 * @example
 * formatInn("123456789") // "123 456 789"
 * formatInn("123") // "123"
 */
export const formatInn = (inn: string): string => {
  const cleaned = inn.replace(/\D/g, "")
  if (cleaned.length !== 9) return inn
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}

/**
 * Gets the display label for an organization type
 * @param value - The organization type value
 * @returns The display label or the original value if not found
 */
export const getOrganizationTypeLabel = (value: string): string => {
  return organizationTypes.find(t => t.value === value)?.label || value
}

/**
 * Gets the display label for a region
 * @param value - The region value
 * @returns The display label or the original value if not found
 */
export const getRegionLabel = (value: string): string => {
  return regions.find(r => r.value === value)?.label || value
}

/**
 * Gets the display label for a district
 * @param regionValue - The region value
 * @param districtValue - The district value
 * @returns The display label or the original value if not found
 */
export const getDistrictLabel = (regionValue: string, districtValue: string): string => {
  const districts = districtsByRegion[regionValue]
  return districts?.find(d => d.value === districtValue)?.label || districtValue
}

/**
 * Formats a number as Uzbek currency (so'm)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return "0"
  return amount.toLocaleString()
}

/**
 * Formats a date for display
 * @param date - The date to format
 * @returns Formatted date string or "Cheklanmagan" if null
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "Cheklanmagan"
  return new Date(date).toLocaleDateString()
}

/**
 * Calculates the count of active features
 * @param organization - Organization object with feature flags
 * @returns Count of active features
 */
export const getActiveFeaturesCount = (organization: {
  hasStudents?: boolean
  hasPayments?: boolean
  hasReports?: boolean
  hasExcelImport?: boolean
  hasPdfReports?: boolean
}): number => {
  return [
    organization.hasStudents,
    organization.hasPayments,
    organization.hasReports,
    organization.hasExcelImport,
    organization.hasPdfReports,
  ].filter(Boolean).length
}

/**
 * Calculates the count of active integrations
 * @param organization - Organization object with integration flags
 * @returns Count of active integrations
 */
export const getActiveIntegrationsCount = (organization: {
  hasBankIntegration?: boolean
  hasTelegramBot?: boolean
  hasSmsNotifications?: boolean
}): number => {
  return [
    organization.hasBankIntegration,
    organization.hasTelegramBot,
    organization.hasSmsNotifications,
  ].filter(Boolean).length
}

/**
 * Gets the display domain for an organization
 * @param organization - Organization object with domain info
 * @returns The display domain string
 */
export const getDisplayDomain = (organization: {
  customDomain?: string | null
  subdomain?: string | null
}): string => {
  if (organization.customDomain) {
    return organization.customDomain
  }
  if (organization.subdomain) {
    return `${organization.subdomain}.edustatus.uz`
  }
  return "Sozlanmagan"
}

/**
 * Organization display value type
 */
export interface OrganizationDisplayValues {
  type: string
  region: string
  district: string
  domain: string
  createdAt: string
  subscriptionEndsAt: string
}

/**
 * Gets all display values for an organization
 * @param organization - Organization object
 * @returns Object with all display values
 */
export const getOrganizationDisplayValues = (organization: {
  type?: string | null
  region?: string | null
  district?: string | null
  customDomain?: string | null
  subdomain?: string | null
  createdAt?: string | Date | null
  subscriptionEndsAt?: string | Date | null
}): OrganizationDisplayValues => {
  return {
    type: organization.type ? getOrganizationTypeLabel(organization.type) : "Ko'rsatilmagan",
    region: organization.region ? getRegionLabel(organization.region) : "Ko'rsatilmagan",
    district: organization.region && organization.district 
      ? getDistrictLabel(organization.region, organization.district) 
      : "Ko'rsatilmagan",
    domain: getDisplayDomain(organization),
    createdAt: organization.createdAt 
      ? new Date(organization.createdAt).toLocaleDateString() 
      : "Ko'rsatilmagan",
    subscriptionEndsAt: formatDate(organization.subscriptionEndsAt),
  }
}
