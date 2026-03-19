"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { OrganizationListItem } from "../hooks/useCabinetData"

interface DistributionChartsProps {
  organizations: OrganizationListItem[]
}

export function DistributionCharts({ organizations }: DistributionChartsProps) {
  const planDistribution = [
    { name: "Basic", count: organizations.filter(o => o.plan === 'basic').length, color: "#94a3b8" },
    { name: "Pro", count: organizations.filter(o => o.plan === 'pro').length, color: "#3b82f6" },
    { name: "Enterprise", count: organizations.filter(o => o.plan === 'enterprise').length, color: "#8b5cf6" },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tariflar taqsimoti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <Tooltip
                  formatter={(value: number) => `${value} ta tashkilot`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" name="Soni" radius={[0, 4, 4, 0]}>
                  {planDistribution.map((entry, index) => (
                    <rect key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {planDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.name}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status taqsimoti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Faol</span>
              </div>
              <Badge variant="success">{organizations.filter(o => o.status === 'active').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Sinov</span>
              </div>
              <Badge variant="warning">{organizations.filter(o => o.status === 'trial').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>To'xtatilgan</span>
              </div>
              <Badge variant="error">{organizations.filter(o => o.status === 'suspended').length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
