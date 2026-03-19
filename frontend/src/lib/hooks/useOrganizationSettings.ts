/**
 * useOrganizationSettings Hook
 * 
 * Custom hook for managing organization settings state and operations.
 * Following Single Responsibility Principle - handles only settings-related logic.
 */

import { useState, useCallback } from "react"
import { collegesApi } from "@/lib/api"
import { DEFAULT_SETTINGS_DATA } from "@/lib/constants/organization-detail"

/**
 * Section types for editing
 */
export type EditingSection = 'bank' | 'telegram' | 'sms' | 'email' | 'features' | 'limits' | null

/**
 * Settings data type
 */
export interface SettingsData {
  hasStudents: boolean
  hasPayments: boolean
  hasReports: boolean
  hasBankIntegration: boolean
  hasTelegramBot: boolean
  hasSmsNotifications: boolean
  hasExcelImport: boolean
  hasPdfReports: boolean
  allowSubColleges: boolean
  studentLimit: number
  groupLimit: number
  // Bank integration fields
  bankName?: string
  bankAccountNumber?: string
  bankMfoCode?: string
  bankApiKey?: string
  // Telegram bot fields
  telegramBotToken?: string
  telegramChatId?: string
  // SMS fields
  smsProvider?: string
  smsApiKey?: string
  // Email fields
  smtpServer?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
}

/**
 * Organization type for settings extraction
 */
export interface OrganizationForSettings {
  hasStudents: boolean
  hasPayments: boolean
  hasReports: boolean
  hasBankIntegration: boolean
  hasTelegramBot: boolean
  hasSmsNotifications: boolean
  hasExcelImport: boolean
  hasPdfReports: boolean
  allowSubColleges?: boolean
  studentLimit: number
  groupLimit: number
}

/**
 * Hook return type
 */
export interface UseOrganizationSettingsReturn {
  isEditing: boolean
  editingSection: EditingSection
  settingsData: SettingsData
  togglingFeature: string | null
  startEditing: (organization: OrganizationForSettings, section?: EditingSection) => void
  startEditingSection: (organization: OrganizationForSettings, section: EditingSection) => void
  cancelEditing: () => void
  cancelEditingSection: () => void
  updateSetting: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void
  saveSettings: (token: string, organizationId: string) => Promise<void>
  saveSection: (token: string, organizationId: string, section: EditingSection) => Promise<void>
  toggleFeature: (token: string, organizationId: string, feature: string, currentValue: boolean) => Promise<void>
  updateLimit: (token: string, organizationId: string, limitType: 'studentLimit' | 'groupLimit', value: number) => Promise<void>
  updatePlan: (token: string, organizationId: string, plan: string) => Promise<void>
  updateStatus: (token: string, organizationId: string, status: string) => Promise<void>
}

/**
 * Custom hook for managing organization settings
 * 
 * @param onSuccess - Callback function to call after successful operations
 * @returns Object with settings state and operations
 * 
 * @example
 * const {
 *   isEditing,
 *   settingsData,
 *   startEditing,
 *   saveSettings,
 * } = useOrganizationSettings(() => window.location.reload())
 */
export const useOrganizationSettings = (
  onSuccess?: () => void
): UseOrganizationSettingsReturn => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<EditingSection>(null)
  const [settingsData, setSettingsData] = useState<SettingsData>(DEFAULT_SETTINGS_DATA)
  const [togglingFeature, setTogglingFeature] = useState<string | null>(null)

  /**
   * Start editing settings with current organization data
   */
  const startEditing = useCallback((organization: OrganizationForSettings, section: EditingSection = 'features') => {
    setSettingsData({
      hasStudents: organization.hasStudents,
      hasPayments: organization.hasPayments,
      hasReports: organization.hasReports,
      hasBankIntegration: organization.hasBankIntegration,
      hasTelegramBot: organization.hasTelegramBot,
      hasSmsNotifications: organization.hasSmsNotifications,
      hasExcelImport: organization.hasExcelImport,
      hasPdfReports: organization.hasPdfReports,
      allowSubColleges: organization.allowSubColleges || false,
      studentLimit: organization.studentLimit,
      groupLimit: organization.groupLimit,
    })
    setIsEditing(true)
    setEditingSection(section)
  }, [])

  /**
   * Start editing a specific section
   */
  const startEditingSection = useCallback((organization: OrganizationForSettings, section: EditingSection) => {
    setSettingsData({
      hasStudents: organization.hasStudents,
      hasPayments: organization.hasPayments,
      hasReports: organization.hasReports,
      hasBankIntegration: organization.hasBankIntegration,
      hasTelegramBot: organization.hasTelegramBot,
      hasSmsNotifications: organization.hasSmsNotifications,
      hasExcelImport: organization.hasExcelImport,
      hasPdfReports: organization.hasPdfReports,
      allowSubColleges: organization.allowSubColleges || false,
      studentLimit: organization.studentLimit,
      groupLimit: organization.groupLimit,
    })
    setEditingSection(section)
  }, [])

  /**
   * Cancel editing and reset settings data
   */
  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditingSection(null)
    setSettingsData(DEFAULT_SETTINGS_DATA)
  }, [])

  /**
   * Cancel editing for a specific section
   */
  const cancelEditingSection = useCallback(() => {
    setEditingSection(null)
    setSettingsData(DEFAULT_SETTINGS_DATA)
  }, [])

  /**
   * Update a single setting value
   */
  const updateSetting = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettingsData(prev => ({ ...prev, [key]: value }))
  }, [])

  /**
   * Save settings to API
   */
  const saveSettings = useCallback(async (token: string, organizationId: string) => {
    try {
      setTogglingFeature('settings')
      await collegesApi.update(token, organizationId, settingsData)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    } finally {
      setTogglingFeature(null)
      setIsEditing(false)
      setEditingSection(null)
    }
  }, [settingsData, onSuccess])

  /**
   * Save a specific section to API
   */
  const saveSection = useCallback(async (token: string, organizationId: string, section: EditingSection) => {
    try {
      setTogglingFeature(section || 'settings')
      
      // Prepare section-specific data
      let sectionData: Record<string, unknown> = {}
      
      switch (section) {
        case 'bank':
          sectionData = {
            hasBankIntegration: settingsData.hasBankIntegration,
            bankName: settingsData.bankName,
            bankAccountNumber: settingsData.bankAccountNumber,
            bankMfoCode: settingsData.bankMfoCode,
            bankApiKey: settingsData.bankApiKey,
          }
          break
        case 'telegram':
          sectionData = {
            hasTelegramBot: settingsData.hasTelegramBot,
            telegramBotToken: settingsData.telegramBotToken,
            telegramChatId: settingsData.telegramChatId,
          }
          break
        case 'sms':
          sectionData = {
            hasSmsNotifications: settingsData.hasSmsNotifications,
            smsProvider: settingsData.smsProvider,
            smsApiKey: settingsData.smsApiKey,
          }
          break
        case 'email':
          sectionData = {
            smtpServer: settingsData.smtpServer,
            smtpPort: settingsData.smtpPort,
            smtpUsername: settingsData.smtpUsername,
            smtpPassword: settingsData.smtpPassword,
          }
          break
        case 'features':
          sectionData = {
            hasStudents: settingsData.hasStudents,
            hasPayments: settingsData.hasPayments,
            hasReports: settingsData.hasReports,
            hasExcelImport: settingsData.hasExcelImport,
            hasPdfReports: settingsData.hasPdfReports,
            allowSubColleges: settingsData.allowSubColleges,
          }
          break
        case 'limits':
          sectionData = {
            studentLimit: settingsData.studentLimit,
            groupLimit: settingsData.groupLimit,
          }
          break
        default:
          sectionData = { ...settingsData }
      }
      
      await collegesApi.update(token, organizationId, sectionData)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save section:', error)
      throw error
    } finally {
      setTogglingFeature(null)
      setEditingSection(null)
    }
  }, [settingsData, onSuccess])

  /**
   * Toggle a single feature
   */
  const toggleFeature = useCallback(async (
    token: string,
    organizationId: string,
    feature: string,
    currentValue: boolean
  ) => {
    try {
      setTogglingFeature(feature)
      await collegesApi.update(token, organizationId, { [feature]: !currentValue })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to toggle feature:', error)
      throw error
    } finally {
      setTogglingFeature(null)
    }
  }, [onSuccess])

  /**
   * Update a limit value
   */
  const updateLimit = useCallback(async (
    token: string,
    organizationId: string,
    limitType: 'studentLimit' | 'groupLimit',
    value: number
  ) => {
    try {
      setTogglingFeature(limitType)
      await collegesApi.update(token, organizationId, { [limitType]: value })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update limit:', error)
      throw error
    } finally {
      setTogglingFeature(null)
    }
  }, [onSuccess])

  /**
   * Update organization plan
   */
  const updatePlan = useCallback(async (token: string, organizationId: string, plan: string) => {
    try {
      setTogglingFeature('plan')
      await collegesApi.update(token, organizationId, { plan })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update plan:', error)
      throw error
    } finally {
      setTogglingFeature(null)
    }
  }, [onSuccess])

  /**
   * Update organization status
   */
  const updateStatus = useCallback(async (token: string, organizationId: string, status: string) => {
    try {
      setTogglingFeature('status')
      await collegesApi.update(token, organizationId, { status })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    } finally {
      setTogglingFeature(null)
    }
  }, [onSuccess])

  return {
    isEditing,
    editingSection,
    settingsData,
    togglingFeature,
    startEditing,
    startEditingSection,
    cancelEditing,
    cancelEditingSection,
    updateSetting,
    saveSettings,
    saveSection,
    toggleFeature,
    updateLimit,
    updatePlan,
    updateStatus,
  }
}
