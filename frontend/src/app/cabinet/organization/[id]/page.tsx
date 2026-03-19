/**
 * Organization Detail Page
 * 
 * Main page for viewing and managing organization details.
 * Refactored to follow Single Responsibility Principle:
 * - Constants moved to lib/constants/organization-detail.ts
 * - Utilities moved to lib/utils/organization.ts
 * - Settings logic moved to useOrganizationSettings hook
 * - Tab content moved to separate components (OverviewTab, FinanceTab, SettingsTab)
 */

"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Plus,
  AlertTriangle,
  Trash2,
  Archive,
} from "lucide-react"
import Link from "next/link"

// Hooks
import { useOrganizationData, OrganizationAdmin, CustomDomain } from "@/lib/hooks/useOrganizationData"
import { useOrganizationSettings } from "@/lib/hooks/useOrganizationSettings"
import { useAuth } from "@/lib/auth-context"

// Components
import { ChildOrganizationsCard } from "@/components/cabinet/ChildOrganizationsCard"
import { AdministratorCard } from "@/components/cabinet/AdministratorCard"
import {
  AdminModal,
  DomainModal,
  ChildOrganizationModal,
  EditOrganizationModal,
  OverviewTab,
  FinanceTab,
  SettingsTab,
} from "./components"

// Constants
import { TAB_CONFIG } from "@/lib/constants/organization-detail"

// Utils
import { formatInn } from "@/lib/utils/organization"

/**
 * Organization Detail Page Component
 */
export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const organizationId = params.id as string

  // Data fetching hook
  const {
    organization,
    stats,
    domains,
    loading,
    error,
    toggleSubOrganizations,
  } = useOrganizationData(organizationId)

  // Settings management hook
  const {
    editingSection,
    settingsData,
    togglingFeature,
    startEditingSection,
    cancelEditingSection,
    updateSetting,
    saveSection,
  } = useOrganizationSettings(() => window.location.reload())

  // Modal states
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<OrganizationAdmin | null>(null)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [isChildOrgModalOpen, setIsChildOrgModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  // Not found state
  if (!organization) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Tashkilot topilmadi
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cabinet/organization">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          {organization.logo ? (
            <Image
              src={organization.logo}
              alt={organization.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center border">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-muted-foreground">
              INN: {formatInn(organization.inn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/dashboard?org=${organizationId}`)}>
            <Globe className="mr-2 h-4 w-4" />
            Tashkilot paneliga o'tish
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Talabalar</p>
                <p className="text-xl font-bold">{stats?.studentsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daromad</p>
                <p className="text-xl font-bold">
                  {stats?.totalRevenue?.toLocaleString() || 0} so'm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guruhlar</p>
                <p className="text-xl font-bold">{stats?.groupsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Obuna tugashi</p>
                <p className="text-xl font-bold">
                  {organization.subscriptionEndsAt
                    ? new Date(organization.subscriptionEndsAt).toLocaleDateString()
                    : "Cheklanmagan"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tab.className}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            organization={organization} 
            onEdit={() => setIsEditModalOpen(true)}
          />
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <FinanceTab organization={organization} stats={stats} token={token} />
        </TabsContent>

        {/* Administrators Tab */}
        <TabsContent value="administrators" className="space-y-6">
          <AdministratorCard
            admins={organization.admins || []}
            onAddAdmin={() => {
              setEditingAdmin(null)
              setIsAddAdminModalOpen(true)
            }}
            onEditAdmin={(admin: OrganizationAdmin) => {
              setEditingAdmin(admin)
              setIsAddAdminModalOpen(true)
            }}
            onDeleteAdmin={(adminId: string) => {
              // TODO: Delete admin
            }}
          />
        </TabsContent>

        {/* Child Organizations Tab */}
        <TabsContent value="children" className="space-y-6">
          <ChildOrganizationsCard
            organization={organization}
            onAddChild={() => setIsChildOrgModalOpen(true)}
          />
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Domainlar</CardTitle>
              <Button size="sm" onClick={() => setIsDomainModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Qo'shish
              </Button>
            </CardHeader>
            <CardContent>
              {domains.length > 0 ? (
                <div className="space-y-4">
                  {domains.map((domain: CustomDomain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <p className="text-sm text-muted-foreground">
                            {domain.isPrimary ? "Asosiy" : "Qo'shimcha"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={domain.status === "active" ? "success" : "secondary"}>
                        {domain.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Domainlar yo'q</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <SettingsTab
            organization={organization}
            editingSection={editingSection}
            settingsData={settingsData}
            togglingFeature={togglingFeature}
            onStartEditingSection={(section) => startEditingSection(organization, section)}
            onCancelEditingSection={cancelEditingSection}
            onSaveSection={(section) => {
              if (token) {
                saveSection(token, organizationId, section)
              }
            }}
            onUpdateSetting={updateSetting}
          />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Xavfli zona
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ehtiyot bo'ling! Bu amallar qaytarib bo'lmaydi
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tabula Rasa */}
              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div>
                  <p className="font-medium">Tabula Rasa</p>
                  <p className="text-sm text-muted-foreground">
                    Barcha ma'lumotlarni o'chirish (talabalar, to'lovlar, guruhlar)
                  </p>
                </div>
                <Button variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-100">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Tozalash
                </Button>
              </div>

              {/* Archive Organization */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium">Tashkilotni arxivlash</p>
                  <p className="text-sm text-muted-foreground">
                    Tashkilotni arxivga o'tkazish, ma'lumotlar saqlanadi
                  </p>
                </div>
                <Button variant="destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  Arxivlash
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => {
          setIsAddAdminModalOpen(false)
          setEditingAdmin(null)
        }}
        organizationId={organizationId}
        organizationName={organization.name}
        token={token!}
        editingAdmin={editingAdmin}
        onSuccess={() => window.location.reload()}
      />

      <DomainModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        organizationId={organizationId}
        token={token!}
        currentSubdomain={organization.subdomain}
        onSuccess={() => window.location.reload()}
      />

      <ChildOrganizationModal
        isOpen={isChildOrgModalOpen}
        onClose={() => setIsChildOrgModalOpen(false)}
        organizationId={organizationId}
        organizationName={organization.name}
        token={token!}
        onSuccess={() => window.location.reload()}
      />

      <EditOrganizationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organization={organization}
        organizationId={organizationId}
        token={token!}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
