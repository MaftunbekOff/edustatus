/**
 * OverviewTab Component
 * 
 * Displays overview information for an organization including:
 * - Organization details
 * - Plan, status and integrations summary
 * 
 * Following Single Responsibility Principle - handles only overview display.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  CreditCard,
  Shield,
  Wallet,
  Calendar,
  Landmark,
  Home,
  Pencil,
} from "lucide-react"
import {
  PLAN_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/constants/organization-detail"
import {
  formatInn,
  getOrganizationTypeLabel,
  getRegionLabel,
  getDistrictLabel,
  getDisplayDomain,
  formatDate,
  getActiveFeaturesCount,
  getActiveIntegrationsCount,
} from "@/lib/utils/organization"

/**
 * Organization type for overview tab
 */
export interface OrganizationForOverview {
  name: string
  inn: string
  type?: string | null
  isGovernment?: boolean
  region?: string | null
  district?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  customDomain?: string | null
  subdomain?: string | null
  logo?: string | null
  createdAt?: string | Date | null
  plan: string
  status: string
  studentLimit: number
  groupLimit: number
  allowSubColleges?: boolean
  hasBankIntegration?: boolean
  hasTelegramBot?: boolean
  hasSmsNotifications?: boolean
  hasStudents?: boolean
  hasPayments?: boolean
  hasReports?: boolean
  hasExcelImport?: boolean
  hasPdfReports?: boolean
  admins?: Array<unknown>
  children?: Array<unknown>
}

/**
 * Props for OverviewTab component
 */
export interface OverviewTabProps {
  organization: OrganizationForOverview
  onEdit?: () => void
}

/**
 * Info Item Component
 */
interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  )
}

/**
 * Summary Item Component
 */
interface SummaryItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {value}
    </div>
  )
}

/**
 * OverviewTab Component
 * 
 * @param organization - Organization data
 * @param onEdit - Optional callback when edit button is clicked
 */
export function OverviewTab({ organization, onEdit }: OverviewTabProps) {
  const displayDomain = getDisplayDomain(organization)
  const activeFeaturesCount = getActiveFeaturesCount(organization)
  const activeIntegrationsCount = getActiveIntegrationsCount(organization)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Organization Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Tashkilot ma'lumotlari</CardTitle>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            label="Tashkilot turi"
            value={organization.type ? getOrganizationTypeLabel(organization.type) : "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<Landmark className="h-5 w-5 text-muted-foreground" />}
            label="Tashkilot shakli"
            value={organization.isGovernment ? "Davlat tashkiloti" : "Xususiy tashkilot"}
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
            label="Viloyat"
            value={organization.region ? getRegionLabel(organization.region) : "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<Home className="h-5 w-5 text-muted-foreground" />}
            label="Tuman"
            value={organization.region && organization.district ? getDistrictLabel(organization.region, organization.district) : "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<Phone className="h-5 w-5 text-muted-foreground" />}
            label="Telefon"
            value={organization.phone || "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<Mail className="h-5 w-5 text-muted-foreground" />}
            label="Email"
            value={organization.email || "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
            label="Manzil"
            value={organization.address || "Ko'rsatilmagan"}
          />
          <InfoItem
            icon={<Globe className="h-5 w-5 text-muted-foreground" />}
            label="Domain"
            value={displayDomain}
          />
          <InfoItem
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            label="Tashkil etilgan"
            value={organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : "Ko'rsatilmagan"}
          />
        </CardContent>
      </Card>

      {/* Tarif, Status va Integratsiyalar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarif, Status va Integratsiyalar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryItem
            icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
            label="Joriy tarif"
            value={
              <Badge variant={PLAN_COLORS[organization.plan] as "outline" | "secondary" | "default"} className="text-sm">
                {organization.plan.toUpperCase()}
              </Badge>
            }
          />
          <SummaryItem
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            label="Status"
            value={
              <Badge variant={STATUS_COLORS[organization.status]}>
                {STATUS_LABELS[organization.status]}
              </Badge>
            }
          />
          <SummaryItem
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            label="Talabalar chegarasi"
            value={<span className="font-bold text-blue-600">{organization.studentLimit} ta</span>}
          />
          <SummaryItem
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            label="Guruhlar chegarasi"
            value={<span className="font-bold text-purple-600">{organization.groupLimit} ta</span>}
          />
          <SummaryItem
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            label="Adminlar"
            value={<span className="font-bold text-green-600">{organization.admins?.length || 0} ta</span>}
          />
          <SummaryItem
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            label="Quyi tashkilotlar"
            value={<span className="font-bold text-teal-600">{organization.children?.length || 0} ta</span>}
          />
          <SummaryItem
            icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
            label="Integratsiyalar"
            value={
              <span className="font-bold text-cyan-600">
                {activeIntegrationsCount}/3 ta
              </span>
            }
          />
          <SummaryItem
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            label="Tizim funksiyalari"
            value={
              <span className="font-bold text-indigo-600">
                {activeFeaturesCount}/5 ta
              </span>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
