"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Globe, Check, RefreshCw, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { CustomDomain } from "@/lib/hooks"

interface CustomDomainsCardProps {
  domains: CustomDomain[]
  onAdd: () => void
  onVerify: (domainId: string) => void
  onSetPrimary: (domainId: string) => void
  onDelete: (domainId: string) => void
}

export function CustomDomainsCard({
  domains,
  onAdd,
  onVerify,
  onSetPrimary,
  onDelete,
}: CustomDomainsCardProps) {
  const getSslBadge = (sslStatus: string) => {
    if (sslStatus === "active") {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          SSL
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <ShieldAlert className="h-3 w-3" />
        SSL kutilmoqda
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>
            Tashkilotning o'z domenlarini boshqarish
          </CardDescription>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Domain qo'shish
        </Button>
      </CardHeader>
      <CardContent>
        {domains.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Hozircha custom domainlar yo'q</p>
            <Button variant="outline" className="mt-4" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Domain qo'shish
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  domain.isPrimary ? "bg-blue-50 border-blue-200" : ""
                } ${domain.status === "pending" ? "border-yellow-200 bg-yellow-50" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    domain.isPrimary ? "bg-blue-100" : domain.status === "pending" ? "bg-yellow-100" : "bg-gray-100"
                  }`}>
                    <Globe className={`h-5 w-5 ${
                      domain.isPrimary ? "text-blue-600" : domain.status === "pending" ? "text-yellow-600" : "text-gray-600"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{domain.domain}</p>
                      {domain.isPrimary && (
                        <Badge variant="default" className="bg-blue-600">Primary</Badge>
                      )}
                      {domain.status === "pending" && (
                        <Badge variant="warning">Kutilmoqda</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Qo'shilgan: {formatDate(domain.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {domain.status === "active" ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Faol
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Tasdiqlanmoqda
                      </Badge>
                    )}
                    {getSslBadge(domain.sslStatus)}
                  </div>
                  <div className="flex items-center gap-1">
                    {domain.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerify(domain.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tasdiqlash
                      </Button>
                    )}
                    {!domain.isPrimary && domain.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Primary qilish"
                        onClick={() => onSetPrimary(domain.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {!domain.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="O'chirish"
                        onClick={() => onDelete(domain.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DNS Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">DNS sozlamalari yo'riqnomasi</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Yangi domain qo'shgandan so'ng, quyidagi DNS recordlarni sozlang:
          </p>
          <div className="bg-white p-3 rounded border font-mono text-sm overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 text-xs min-w-[400px]">
              <div className="font-medium">Type</div>
              <div className="font-medium">Name</div>
              <div className="font-medium">Value</div>
              <div className="font-medium">TTL</div>
              
              <div>CNAME</div>
              <div>@</div>
              <div>app.edustatus.uz</div>
              <div>3600</div>
              
              <div>TXT</div>
              <div>_edustatus-verification</div>
              <div>edustatus-site-verification=TOKEN</div>
              <div>3600</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}