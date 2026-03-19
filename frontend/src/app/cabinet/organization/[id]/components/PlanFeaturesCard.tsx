"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { planFeatures } from "@/lib/constants"

interface PlanFeaturesCardProps {
  plan: string
  features: {
    key: string
    label: string
    value: boolean
  }[]
}

export function PlanFeaturesCard({ plan, features }: PlanFeaturesCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Joriy tarif</CardTitle>
            <CardDescription>{plan.toUpperCase()} reja</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Tarifni o'zgartirish
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Tarif imkoniyatlari</h4>
            <div className="space-y-3">
              {planFeatures[plan]?.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Faol funksiyalar</h4>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                    feature.value ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span>{feature.label}</span>
                  <Badge variant={feature.value ? "success" : "secondary"} className="text-xs">
                    {feature.value ? "Faol" : "Nofaol"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}