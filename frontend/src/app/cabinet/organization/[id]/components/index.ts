/**
 * Organization detail page components - barrel export
 * Following CODING_STANDARDS.md - Module organization pattern
 */

// Card components
export { StatsCards } from "./StatsCards"
export { OrganizationInfoCard } from "./OrganizationInfoCard"
export { AdminsCard } from "./AdminsCard"
export { PlanFeaturesCard } from "./PlanFeaturesCard"
export { CustomDomainsCard } from "./CustomDomainsCard"
export { DangerZoneCard } from "./DangerZoneCard"

// Modal components
export { AdminModal } from "./AdminModal"
export { DomainModal } from "./DomainModal"
export { ChildOrganizationModal } from "./ChildOrganizationModal"
export { EditOrganizationModal } from "./EditOrganizationModal"

// Tab components
export { OverviewTab } from "./OverviewTab"
export { FinanceTab } from "./FinanceTab"
export { SettingsTab } from "./SettingsTab"

// Settings sub-components
export { BankIntegrationCard } from "./BankIntegrationCard"
export { TelegramBotCard } from "./TelegramBotCard"
export { SmsNotificationsCard } from "./SmsNotificationsCard"
export { EmailIntegrationCard } from "./EmailIntegrationCard"
export { FeaturesCard } from "./FeaturesCard"
export { LimitsCard } from "./LimitsCard"

// Type exports
export type { OrganizationForOverview, OverviewTabProps } from "./OverviewTab"
export type { OrganizationForFinance, OrganizationStats, FinanceTabProps } from "./FinanceTab"
export type { OrganizationForSettingsTab, SettingsTabProps } from "./SettingsTab"
export type { BankIntegrationCardProps } from "./BankIntegrationCard"
export type { TelegramBotCardProps } from "./TelegramBotCard"
export type { SmsNotificationsCardProps } from "./SmsNotificationsCard"
export type { EmailIntegrationCardProps } from "./EmailIntegrationCard"
export type { FeaturesCardProps, FeatureKey } from "./FeaturesCard"
export type { LimitsCardProps, LimitKey } from "./LimitsCard"