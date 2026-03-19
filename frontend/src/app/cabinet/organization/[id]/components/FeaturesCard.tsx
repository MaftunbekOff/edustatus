/**
 * FeaturesCard Component
 * 
 * Displays and manages system features for an organization.
 * Following Single Responsibility Principle - handles only features display.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Edit, Check, X, Loader2 } from "lucide-react"
import { FEATURE_CONFIG } from "@/lib/constants/organization-detail"

/**
 * Feature keys type
 */
export type FeatureKey = keyof typeof FEATURE_CONFIG

/**
 * Props for FeatureItem component
 */
interface FeatureItemProps {
  featureKey: FeatureKey
  isActive: boolean
  isEditing: boolean
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * Feature Item Component
 */
function FeatureItem({ featureKey, isActive, isEditing, checked, onCheckedChange }: FeatureItemProps) {
  const config = FEATURE_CONFIG[featureKey]
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-blue-500">
      <div>
        <p className="font-medium">{config.label}</p>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
      {isEditing ? (
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      ) : (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Faol" : "Faol emas"}
        </Badge>
      )}
    </div>
  )
}

/**
 * Props for FeaturesCard component
 */
export interface FeaturesCardProps {
  /** Current feature states from organization */
  features: Record<FeatureKey, boolean>
  /** Edited feature states */
  editedFeatures: Record<FeatureKey, boolean>
  /** Whether this section is being edited */
  isEditing: boolean
  /** Whether a save operation is in progress */
  isSaving: boolean
  /** Callback when edit button is clicked */
  onStartEditing: () => void
  /** Callback when cancel button is clicked */
  onCancelEditing: () => void
  /** Callback when save button is clicked */
  onSave: () => void
  /** Callback when a feature changes */
  onFeatureChange: (key: FeatureKey, value: boolean) => void
}

/**
 * FeaturesCard Component
 * 
 * @example
 * <FeaturesCard
 *   features={{ hasClients: true, hasPayments: true, ... }}
 *   isEditing={editingSection === 'features'}
 *   // ... other props
 * />
 */
export function FeaturesCard({
  features,
  editedFeatures,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onFeatureChange,
}: FeaturesCardProps) {
  const featureKeys = Object.keys(FEATURE_CONFIG) as FeatureKey[]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Tizim funksiyalari</CardTitle>
          <CardDescription>Tashkilot uchun mavjud funksiyalar</CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onStartEditing}>
            <Edit className="mr-2 h-4 w-4" />
            Tahrirlash
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancelEditing}>
              <X className="mr-2 h-4 w-4" />
              Bekor qilish
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Saqlash
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((featureKey) => (
            <FeatureItem
              key={featureKey}
              featureKey={featureKey}
              isActive={features[featureKey]}
              isEditing={isEditing}
              checked={editedFeatures[featureKey]}
              onCheckedChange={(checked) => onFeatureChange(featureKey, checked)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
