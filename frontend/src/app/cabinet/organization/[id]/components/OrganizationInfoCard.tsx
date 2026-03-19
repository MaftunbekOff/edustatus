"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { districtsByRegion, shortenDistrictLabel } from "@/lib/constants"

interface OrganizationInfoCardProps {
  inn: string
  subdomain?: string | null
  email?: string | null
  phone?: string | null
  region?: string | null
  district?: string | null
  address?: string | null
  createdAt: string
  onEdit: () => void
}

export function OrganizationInfoCard({
  inn,
  subdomain,
  email,
  phone,
  region,
  district,
  address,
  createdAt,
  onEdit,
}: OrganizationInfoCardProps) {
  const getFullAddress = () => {
    if (district && region) {
      const districtInfo = districtsByRegion[region]?.find(d => d.value === district)
      const districtLabel = districtInfo?.label || district
      return `${shortenDistrictLabel(districtLabel)}${address ? `, ${address}` : ""}`
    }
    return address || "-"
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Ma'lumotlar</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* INN */}
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 flex items-center justify-center text-muted-foreground mt-0.5">
            <span className="text-xs font-bold">INN</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">INN (Soliq ID)</p>
            <p className="font-medium font-mono">{inn}</p>
          </div>
        </div>

        {/* Subdomain */}
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Subdomain</p>
            <p className="font-medium">
              {subdomain ? `${subdomain}.edustatus.uz` : "Sozlanmagan"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email || "-"}</p>
          </div>
        </div>

        {/* Telefon */}
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Telefon</p>
            <p className="font-medium">{phone || "-"}</p>
          </div>
        </div>

        {/* Manzil */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Manzil</p>
            <p className="font-medium">{getFullAddress()}</p>
          </div>
        </div>

        {/* Ro'yxatdan o'tgan */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan</p>
            <p className="font-medium">{formatDate(createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}