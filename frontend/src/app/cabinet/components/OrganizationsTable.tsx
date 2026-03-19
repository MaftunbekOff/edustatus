"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrganizationListItem } from "../hooks/useCabinetData"

interface OrganizationsTableProps {
  organizations: OrganizationListItem[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tashkilotlar ro'yxati</CardTitle>
        <Link
          href="/cabinet/organization"
          className="text-sm text-primary hover:underline"
        >
          Barchasini ko'rish
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tashkilot nomi</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Talabalar</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Tashkilotlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              organizations.slice(0, 5).map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell className="font-medium">{organization.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {organization.subdomain ? `${organization.subdomain}.edustatus.uz` : "Sozlanmagan"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        organization.plan === "enterprise"
                          ? "default"
                          : organization.plan === "pro"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {organization.plan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{organization._count?.students || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        organization.status === "active"
                          ? "success"
                          : organization.status === "trial"
                          ? "warning"
                          : "error"
                      }
                    >
                      {organization.status === "active"
                        ? "Faol"
                        : organization.status === "trial"
                        ? "Sinov"
                        : "To'xtatilgan"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
