/**
 * LimitsCard Component
 * 
 * Displays and manages organization limits.
 * Following Single Responsibility Principle - handles only limits display.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Check, X, Loader2 } from "lucide-react"
import { LIMIT_CONFIG } from "@/lib/constants/organization-detail"

/**
 * Limit keys type
 */
export type LimitKey = keyof typeof LIMIT_CONFIG

/**
 * Props for LimitItem component
 */
interface LimitItemProps {
  limitKey: LimitKey
  value: number
  isEditing: boolean
  editedValue: number
  onValueChange: (value: number) => void
}

/**
 * Limit Item Component
 */
function LimitItem({ limitKey, value, isEditing, editedValue, onValueChange }: LimitItemProps) {
  const config = LIMIT_CONFIG[limitKey]
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-purple-500">
      <div className="flex-1">
        <p className="font-medium">{config.label}</p>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              type="number"
              className="w-20 text-center text-lg font-bold"
              value={editedValue}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                onValueChange(val)
              }}
              min={0}
            />
            <span className="text-sm text-muted-foreground">ta</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold text-purple-600">{value}</span>
            <span className="text-sm text-muted-foreground">ta</span>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Props for LimitsCard component
 */
export interface LimitsCardProps {
  /** Current limit values from organization */
  limits: Record<LimitKey, number>
  /** Edited limit values */
  editedLimits: Record<LimitKey, number>
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
  /** Callback when a limit changes */
  onLimitChange: (key: LimitKey, value: number) => void
}

/**
 * LimitsCard Component
 * 
 * @example
 * <LimitsCard
 *   limits={{ studentLimit: 100, groupLimit: 10 }}
 *   isEditing={editingSection === 'limits'}
 *   // ... other props
 * />
 */
export function LimitsCard({
  limits,
  editedLimits,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onLimitChange,
}: LimitsCardProps) {
  const limitKeys = Object.keys(LIMIT_CONFIG) as LimitKey[]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Chegaralar</CardTitle>
          <CardDescription>Tashkilot chegaralari</CardDescription>
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
        <div className="grid gap-4 md:grid-cols-2">
          {limitKeys.map((limitKey) => (
            <LimitItem
              key={limitKey}
              limitKey={limitKey}
              value={limits[limitKey]}
              isEditing={isEditing}
              editedValue={editedLimits[limitKey]}
              onValueChange={(value) => onLimitChange(limitKey, value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
