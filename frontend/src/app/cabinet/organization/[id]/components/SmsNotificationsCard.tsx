/**
 * SmsNotificationsCard Component
 * 
 * Displays and manages SMS notifications settings for an organization.
 * Following Single Responsibility Principle - handles only SMS notifications.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Phone, Edit, Check, X, Loader2 } from "lucide-react"

/**
 * Props for SmsNotificationsCard component
 */
export interface SmsNotificationsCardProps {
  /** Whether SMS notifications are active */
  hasSmsNotifications: boolean
  /** SMS provider name */
  smsProvider?: string | null
  /** SMS API key */
  smsApiKey?: string | null
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
  /** Callback when hasSmsNotifications changes */
  onHasSmsNotificationsChange: (value: boolean) => void
  /** Callback when SMS provider changes */
  onSmsProviderChange: (value: string) => void
  /** Callback when SMS API key changes */
  onSmsApiKeyChange: (value: string) => void
}

/**
 * SmsNotificationsCard Component
 * 
 * @example
 * <SmsNotificationsCard
 *   hasSmsNotifications={organization.hasSmsNotifications}
 *   isEditing={editingSection === 'sms'}
 *   // ... other props
 * />
 */
export function SmsNotificationsCard({
  hasSmsNotifications,
  smsProvider,
  smsApiKey,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onHasSmsNotificationsChange,
  onSmsProviderChange,
  onSmsApiKeyChange,
}: SmsNotificationsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS bildirishnomalar
          </CardTitle>
          <CardDescription>SMS orqali ota-onalarga xabar yuborish</CardDescription>
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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Phone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium">SMS bildirishnomalar</p>
              <p className="text-sm text-muted-foreground">SMS orqali ota-onalarga xabar yuborish</p>
            </div>
          </div>
          {isEditing ? (
            <Switch
              checked={hasSmsNotifications}
              onCheckedChange={onHasSmsNotificationsChange}
            />
          ) : (
            <Badge variant={hasSmsNotifications ? "success" : "secondary"}>
              {hasSmsNotifications ? "Faol" : "Faol emas"}
            </Badge>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">SMS provayder</p>
            {isEditing ? (
              <Input 
                placeholder="SMS provayderni kiriting"
                value={smsProvider || ''}
                onChange={(e) => onSmsProviderChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{smsProvider || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">API kaliti</p>
            {isEditing ? (
              <Input 
                placeholder="API kalitini kiriting" 
                type="password"
                value={smsApiKey || ''}
                onChange={(e) => onSmsApiKeyChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{smsApiKey ? '****' : '-'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
