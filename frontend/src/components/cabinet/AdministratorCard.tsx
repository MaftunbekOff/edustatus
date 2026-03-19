"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, UserCircle } from "lucide-react"
import { OrganizationAdmin } from "@/lib/hooks/useOrganizationData"
import { adminRoles, adminStatusConfig } from "@/lib/constants/organization"

interface AdministratorCardProps {
  admins: OrganizationAdmin[]
  onAddAdmin: () => void
  onEditAdmin: (admin: OrganizationAdmin) => void
  onDeleteAdmin: (adminId: string) => void
}

export function AdministratorCard({
  admins,
  onAddAdmin,
  onEditAdmin,
  onDeleteAdmin,
}: AdministratorCardProps) {
  return (
    <Card className="lg:col-span-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-lg">Administratorlar</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddAdmin}
          title="Yangi administrator qo'shish"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        {admins && admins.length > 0 ? (
          <div className="space-y-2 flex-1 overflow-y-auto max-h-80 pr-1">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <UserCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{admin.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Badge
                    variant={admin.role === "admin" ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {admin.role === "admin"
                      ? "Admin"
                      : admin.role === "accountant"
                      ? "Bux"
                      : "Op"}
                  </Badge>
                  <Badge
                    variant={admin.status === "active" ? "success" : "error"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {adminStatusConfig[admin.status]?.label || admin.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onEditAdmin(admin)}
                    title="Tahrirlash"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => onDeleteAdmin(admin.id)}
                    title="O'chirish"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground flex-1">
            <UserCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Administrator topilmadi</p>
          </div>
        )}

        {/* Yangi admin qo'shish tugmasi */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 shrink-0"
          onClick={onAddAdmin}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi administrator
        </Button>
      </CardContent>
    </Card>
  )
}