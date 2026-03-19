"use client"

import { useMemo } from 'react'
import { useOrganization } from '../organization-context'
import {
  getNavigationForOrganizationType,
  organizationTypeToCategory,
  departmentLabelsByCategory,
  clientLabelsByCategory,
  staffLabelsByCategory,
} from '../constants/navigation'
import {
  getDepartmentTypesForOrganizationType,
  getDefaultDepartmentType,
  getOrganizationTypeByValue,
} from '../constants/organization'

/**
 * Hook to get organization-specific labels and configurations
 * This hook provides dynamic labels based on organization type
 */
export function useOrganizationLabels() {
  const { organization, organizationType, isLoading } = useOrganization()

  const labels = useMemo(() => {
    const category = organizationTypeToCategory[organizationType] || 'other'
    const orgTypeInfo = getOrganizationTypeByValue(organizationType)

    // Get department labels
    const deptLabels = departmentLabelsByCategory[category] || departmentLabelsByCategory.other
    
    // Get client labels
    const clientLabelInfo = clientLabelsByCategory[category] || clientLabelsByCategory.other
    
    // Get staff labels
    const staffLabelInfo = staffLabelsByCategory[category] || staffLabelsByCategory.other

    // Get department types for this organization
    const departmentTypes = getDepartmentTypesForOrganizationType(organizationType)
    const defaultDepartmentType = getDefaultDepartmentType(organizationType)

    return {
      // Organization info
      organizationId: organization?.id,
      organizationName: organization?.name || 'Tashkilot',
      organizationType,
      organizationCategory: category,
      organizationTypeName: orgTypeInfo?.label || 'Boshqa',
      
      // Department labels
      departmentSingular: deptLabels.singular,
      departmentPlural: deptLabels.plural,
      departmentTypes,
      defaultDepartmentType,
      
      // Client/Person labels
      clientSingular: clientLabelInfo.singular,
      clientPlural: clientLabelInfo.plural,
      
      // Staff labels
      staffSingular: staffLabelInfo.singular,
      staffPlural: staffLabelInfo.plural,
      
      // Raw organization data
      organization,
      
      // Loading state
      isLoading,
    }
  }, [organization, organizationType, isLoading])

  return labels
}

/**
 * Hook to get navigation items for current organization
 */
export function useOrganizationNavigation() {
  const { organizationType, isLoading } = useOrganization()
  
  const navigation = useMemo(() => {
    if (isLoading) {
      return getNavigationForOrganizationType('college') // Default
    }
    return getNavigationForOrganizationType(organizationType)
  }, [organizationType, isLoading])

  return navigation
}

export default useOrganizationLabels
