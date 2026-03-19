// Hooks index file - barcha hooklarni bitta joydan eksport qilish
export * from './useCollegeData'
export * from './usePhoneFormat'

// Explicitly re-export from useOrganizationData to avoid conflicts with useCollegeData
// Both hooks export CustomDomain, so we only export unique types
export {
  useOrganizationData,
  type OrganizationAdmin,
  type Organization,
  type ChildOrganization,
  type OrganizationStats,
  type UseOrganizationDataReturn,
  type CustomDomain,
} from './useOrganizationData'

// Organization labels hook
export { useOrganizationLabels, useOrganizationNavigation } from './useOrganizationLabels'
