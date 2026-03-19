/**
 * Organization List Page
 * 
 * Main page for viewing and managing organizations list.
 * Refactored to follow Single Responsibility Principle:
 * - Constants moved to lib/constants/organization-list.ts
 * - Types moved to types/organization.ts
 * - Logic moved to useOrganizationList hook
 * - Utils imported from lib/utils/organization.ts
 */

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  Filter,
  Eye,
  Globe,
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Hooks
import { useAuth } from "@/lib/auth-context"
import { useOrganizationList } from "@/lib/hooks/useOrganizationList"

// Components
import { AddOrganizationModal } from "./components/AddOrganizationModal"

// Constants
import {
  PLAN_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  PLAN_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/lib/constants/organization-list"

// Utils
import { formatInn, getDisplayDomain } from "@/lib/utils/organization"

/**
 * Organization List Page Component
 */
export default function OrganizationPage() {
  const { token } = useAuth()

  // --- Data Hook ---
  const {
    organizations,
    loading,
    error,
    filters,
    stats,
    filteredOrganizations,
    setSearch,
    setPlanFilter,
    setStatusFilter,
    reload,
  } = useOrganizationList(token)

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --- Callbacks ---
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleSuccess = async () => await reload()

  // --- Early Returns ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  // --- Render ---
  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tashkilotlar</h1>
            <p className="text-muted-foreground">
              Barcha tashkilotlar ro'yxati va ularning holati
            </p>
          </div>
          <Button onClick={handleOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi tashkilot qo'shish
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <FiltersCard
          search={filters.search}
          planFilter={filters.plan}
          statusFilter={filters.status}
          onSearchChange={setSearch}
          onPlanChange={setPlanFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Organizations Table */}
        <OrganizationsTable organizations={filteredOrganizations} />

        {/* Pagination Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jami: {filteredOrganizations.length} ta tashkilot
          </p>
        </div>
      </div>

      {/* Add Organization Modal */}
      <AddOrganizationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        token={token!}
        organizations={organizations}
        onSuccess={handleSuccess}
      />
    </>
  )
}

/**
 * Stats Cards Component
 */
interface StatsCardsProps {
  stats: {
    total: number
    active: number
    trial: number
    suspended: number
    totalStudents: number
  }
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami tashkilotlar</p>
              <p className="text-xl font-bold">{stats.total}</p>
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
              <p className="text-sm text-muted-foreground">Faol</p>
              <p className="text-xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sinov / To'xtatilgan</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.trial} / {stats.suspended}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami talabalar</p>
              <p className="text-xl font-bold">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Filters Card Component
 */
interface FiltersCardProps {
  search: string
  planFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onPlanChange: (value: string) => void
  onStatusChange: (value: string) => void
}

function FiltersCard({
  search,
  planFilter,
  statusFilter,
  onSearchChange,
  onPlanChange,
  onStatusChange,
}: FiltersCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nomi, subdomain yoki email bo'yicha qidirish..."
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[150px]"
            value={planFilter}
            onChange={(e) => onPlanChange(e.target.value)}
          >
            {PLAN_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[150px]"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Organizations Table Component
 */
import type { Organization } from "@/types/organization"

interface OrganizationsTableProps {
  organizations: Organization[]
}

function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tashkilot</TableHead>
                <TableHead>INN</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Tarif</TableHead>
                <TableHead>Talabalar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Tashkilotlar topilmadi
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tashkilot</TableHead>
              <TableHead>INN</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Talabalar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <OrganizationRow key={org.id} organization={org} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/**
 * Organization Row Component
 */
function OrganizationRow({ organization }: { organization: Organization }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          {organization.logo ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border">
              <Image
                src={organization.logo}
                alt={organization.name}
                fill
                sizes="40px"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center border">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <div>
            <p className="font-medium">{organization.name}</p>
            <p className="text-sm text-muted-foreground">{organization.phone}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">{formatInn(organization.inn)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{getDisplayDomain(organization)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={PLAN_COLORS[organization.plan] as "outline" | "secondary" | "default"}>
          {organization.plan.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell>{organization._count?.students || 0}</TableCell>
      <TableCell>
        <Badge variant={STATUS_COLORS[organization.status]}>
          {STATUS_LABELS[organization.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <Link href={`/cabinet/organization/${organization.id}`}>
          <Button variant="ghost" size="icon" title="Ko'rish">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  )
}
