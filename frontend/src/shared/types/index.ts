// Shared Types Index
// Export all types from a single location

export * from './college'

// Re-export utils and constants
export { formatCurrency, formatDate, getStatusColor, getStatusText, cn } from '@/lib/utils'
export { organizationTypes, statusConfig } from '@/lib/constants/organization'
export { regions, districtsByRegion } from '@/lib/constants/regions'