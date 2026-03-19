"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink, Building2 } from "lucide-react"
import Link from "next/link"
import { Organization, ChildOrganization } from "@/lib/hooks/useOrganizationData"
import { statusConfig } from "@/lib/constants/organization"

interface ChildOrganizationsCardProps {
  organization: {
    allowSubOrganizations?: boolean
    allowSubColleges?: boolean
    children?: ChildOrganization[]
  }
  onAddChild: () => void
}

export function ChildOrganizationsCard({
  organization,
  onAddChild,
}: ChildOrganizationsCardProps) {
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status]
    if (!config) return <Badge variant="secondary">{status}</Badge>
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quyi tashkilotlar
          </CardTitle>
          <CardDescription>
            Ushbu tashkilotga biriktirilgan quyi tashkilotlar ro'yxati
          </CardDescription>
        </div>
        {(organization.allowSubOrganizations || organization.allowSubColleges) && (
          <Button size="sm" onClick={onAddChild}>
            <Plus className="mr-2 h-4 w-4" />
            Qo'shish
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!(organization.allowSubOrganizations || organization.allowSubColleges) ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Quyi tashkilotlar funksiyasi faol emas</p>
            <p className="text-sm mt-2">
              Funksiyani aktivlashtirish uchun Sozlamalar tabiga o'ting
            </p>
          </div>
        ) : organization.children && organization.children.length > 0 ? (
          <div className="space-y-4">
            {organization.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{child.name}</p>
                      {getStatusBadge(child.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      INN: {child.inn}  {child._count?.students || 0} talaba  {child._count?.groups || 0} guruh
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/cabinet/organization/${child.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ochish
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Hozircha quyi tashkilotlar yo'q</p>
            <Button variant="outline" className="mt-4" onClick={onAddChild}>
              <Plus className="mr-2 h-4 w-4" />
              Quyi tashkilot qo'shish
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}