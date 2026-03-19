/**
 * SettingsTab Component
 * 
 * Displays and manages organization settings including:
 * - Bank integration
 * - Telegram bot
 * - SMS notifications
 * - Email integration
 * - System features
 * - Limits
 * 
 * Following Single Responsibility Principle - orchestrates child components.
 * Following CODING_STANDARDS.md - component size under 300 lines.
 */

"use client"

import {
  SettingsData,
  OrganizationForSettings,
  EditingSection,
} from "@/lib/hooks/useOrganizationSettings"
import { BankIntegrationCard } from "./BankIntegrationCard"
import { TelegramBotCard } from "./TelegramBotCard"
import { SmsNotificationsCard } from "./SmsNotificationsCard"
import { EmailIntegrationCard } from "./EmailIntegrationCard"
import { FeaturesCard, FeatureKey } from "./FeaturesCard"
import { LimitsCard, LimitKey } from "./LimitsCard"
import { FEATURE_CONFIG, LIMIT_CONFIG } from "@/lib/constants/organization-detail"

/**
 * Extended organization type for settings tab
 */
export interface OrganizationForSettingsTab extends OrganizationForSettings {
  phone?: string | null
  email?: string | null
}

/**
 * Props for SettingsTab component
 */
export interface SettingsTabProps {
  organization: OrganizationForSettingsTab
  editingSection: EditingSection
  settingsData: SettingsData
  togglingFeature: string | null
  onStartEditingSection: (section: EditingSection) => void
  onCancelEditingSection: () => void
  onSaveSection: (section: EditingSection) => void
  onUpdateSetting: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void
}

/**
 * SettingsTab Component
 * 
 * @param organization - Organization data
 * @param editingSection - Which section is currently being edited
 * @param settingsData - Current settings data being edited
 * @param togglingFeature - Currently toggling feature key
 * @param onStartEditingSection - Callback to start editing a section
 * @param onCancelEditingSection - Callback to cancel editing
 * @param onSaveSection - Callback to save a section
 * @param onUpdateSetting - Callback to update a setting value
 */
export function SettingsTab({
  organization,
  editingSection,
  settingsData,
  togglingFeature,
  onStartEditingSection,
  onCancelEditingSection,
  onSaveSection,
  onUpdateSetting,
}: SettingsTabProps) {
  // Prepare features data for FeaturesCard
  const currentFeatures = Object.keys(FEATURE_CONFIG).reduce((acc, key) => {
    acc[key as FeatureKey] = organization[key as FeatureKey] as boolean
    return acc
  }, {} as Record<FeatureKey, boolean>)

  const editedFeatures = Object.keys(FEATURE_CONFIG).reduce((acc, key) => {
    acc[key as FeatureKey] = settingsData[key as FeatureKey] as boolean
    return acc
  }, {} as Record<FeatureKey, boolean>)

  // Prepare limits data for LimitsCard
  const currentLimits = {
    studentLimit: organization.studentLimit,
    groupLimit: organization.groupLimit,
  }

  const editedLimits = {
    studentLimit: settingsData.studentLimit,
    groupLimit: settingsData.groupLimit,
  }

  return (
    <div className="space-y-6">
      {/* Bank Integrations */}
      <BankIntegrationCard
        hasBankIntegration={organization.hasBankIntegration}
        bankName={settingsData.bankName}
        bankAccountNumber={settingsData.bankAccountNumber}
        bankMfoCode={settingsData.bankMfoCode}
        bankApiKey={settingsData.bankApiKey}
        isEditing={editingSection === 'bank'}
        isSaving={togglingFeature === 'bank'}
        onStartEditing={() => onStartEditingSection('bank')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('bank')}
        onHasBankIntegrationChange={(value) => onUpdateSetting('hasBankIntegration', value)}
        onBankNameChange={(value) => onUpdateSetting('bankName', value)}
        onBankAccountNumberChange={(value) => onUpdateSetting('bankAccountNumber', value)}
        onBankMfoCodeChange={(value) => onUpdateSetting('bankMfoCode', value)}
        onBankApiKeyChange={(value) => onUpdateSetting('bankApiKey', value)}
      />

      {/* Telegram Bot */}
      <TelegramBotCard
        hasTelegramBot={organization.hasTelegramBot}
        telegramBotToken={settingsData.telegramBotToken}
        telegramChatId={settingsData.telegramChatId}
        isEditing={editingSection === 'telegram'}
        isSaving={togglingFeature === 'telegram'}
        onStartEditing={() => onStartEditingSection('telegram')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('telegram')}
        onHasTelegramBotChange={(value) => onUpdateSetting('hasTelegramBot', value)}
        onBotTokenChange={(value) => onUpdateSetting('telegramBotToken', value)}
        onChatIdChange={(value) => onUpdateSetting('telegramChatId', value)}
      />

      {/* SMS Notifications */}
      <SmsNotificationsCard
        hasSmsNotifications={organization.hasSmsNotifications}
        smsProvider={settingsData.smsProvider}
        smsApiKey={settingsData.smsApiKey}
        isEditing={editingSection === 'sms'}
        isSaving={togglingFeature === 'sms'}
        onStartEditing={() => onStartEditingSection('sms')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('sms')}
        onHasSmsNotificationsChange={(value) => onUpdateSetting('hasSmsNotifications', value)}
        onSmsProviderChange={(value) => onUpdateSetting('smsProvider', value)}
        onSmsApiKeyChange={(value) => onUpdateSetting('smsApiKey', value)}
      />

      {/* Email Integration */}
      <EmailIntegrationCard
        email={organization.email}
        smtpServer={settingsData.smtpServer}
        smtpPort={settingsData.smtpPort}
        smtpUsername={settingsData.smtpUsername}
        smtpPassword={settingsData.smtpPassword}
        isEditing={editingSection === 'email'}
        isSaving={togglingFeature === 'email'}
        onStartEditing={() => onStartEditingSection('email')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('email')}
        onSmtpServerChange={(value) => onUpdateSetting('smtpServer', value)}
        onSmtpPortChange={(value) => onUpdateSetting('smtpPort', value)}
        onSmtpUsernameChange={(value) => onUpdateSetting('smtpUsername', value)}
        onSmtpPasswordChange={(value) => onUpdateSetting('smtpPassword', value)}
      />

      {/* System Features */}
      <FeaturesCard
        features={currentFeatures}
        editedFeatures={editedFeatures}
        isEditing={editingSection === 'features'}
        isSaving={togglingFeature === 'features'}
        onStartEditing={() => onStartEditingSection('features')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('features')}
        onFeatureChange={(key, value) => onUpdateSetting(key as keyof SettingsData, value as SettingsData[keyof SettingsData])}
      />

      {/* Limits */}
      <LimitsCard
        limits={currentLimits}
        editedLimits={editedLimits}
        isEditing={editingSection === 'limits'}
        isSaving={togglingFeature === 'limits'}
        onStartEditing={() => onStartEditingSection('limits')}
        onCancelEditing={onCancelEditingSection}
        onSave={() => onSaveSection('limits')}
        onLimitChange={(key, value) => onUpdateSetting(key as keyof SettingsData, value as SettingsData[keyof SettingsData])}
      />
    </div>
  )
}
