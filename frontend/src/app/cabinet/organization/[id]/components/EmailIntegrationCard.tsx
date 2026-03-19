/**
 * EmailIntegrationCard Component
 * 
 * Displays and manages email integration settings for an organization.
 * Following Single Responsibility Principle - handles only email integration.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Mail, Edit, Check, X, Loader2 } from "lucide-react"

/**
 * Props for EmailIntegrationCard component
 */
export interface EmailIntegrationCardProps {
  /** Organization email address */
  email?: string | null
  /** SMTP server */
  smtpServer?: string | null
  /** SMTP port */
  smtpPort?: number | null
  /** SMTP username */
  smtpUsername?: string | null
  /** SMTP password */
  smtpPassword?: string | null
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
  /** Callback when SMTP server changes */
  onSmtpServerChange: (value: string) => void
  /** Callback when SMTP port changes */
  onSmtpPortChange: (value: number) => void
  /** Callback when SMTP username changes */
  onSmtpUsernameChange: (value: string) => void
  /** Callback when SMTP password changes */
  onSmtpPasswordChange: (value: string) => void
}

/**
 * EmailIntegrationCard Component
 * 
 * @example
 * <EmailIntegrationCard
 *   email={organization.email}
 *   isEditing={editingSection === 'email'}
 *   // ... other props
 * />
 */
export function EmailIntegrationCard({
  email,
  smtpServer,
  smtpPort,
  smtpUsername,
  smtpPassword,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onSmtpServerChange,
  onSmtpPortChange,
  onSmtpUsernameChange,
  onSmtpPasswordChange,
}: EmailIntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email integratsiyasi
          </CardTitle>
          <CardDescription>Email orqali bildirishnomalar yuborish</CardDescription>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Email yuborish</p>
              <p className="text-sm text-muted-foreground">
                Tizimdan email xabarlarni yuborish
              </p>
            </div>
          </div>
          <Badge variant={email ? "success" : "secondary"}>
            {email ? "Biriktirilgan" : "Biriktirilmagan"}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Email manzil</p>
            <p className="font-medium">{email || "-"}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">SMTP server</p>
            {isEditing ? (
              <Input 
                placeholder="SMTP serverni kiriting"
                value={smtpServer || ''}
                onChange={(e) => onSmtpServerChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{smtpServer || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">SMTP port</p>
            {isEditing ? (
              <Input 
                placeholder="SMTP portni kiriting"
                type="number"
                value={smtpPort || ''}
                onChange={(e) => onSmtpPortChange(parseInt(e.target.value) || 0)}
              />
            ) : (
              <p className="font-medium">{smtpPort || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">SMTP username</p>
            {isEditing ? (
              <Input 
                placeholder="SMTP username kiriting"
                value={smtpUsername || ''}
                onChange={(e) => onSmtpUsernameChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{smtpUsername || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">SMTP password</p>
            {isEditing ? (
              <Input 
                placeholder="SMTP password kiriting"
                type="password"
                value={smtpPassword || ''}
                onChange={(e) => onSmtpPasswordChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{smtpPassword ? '****' : '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Holat</p>
            <Badge variant={email ? "success" : "secondary"}>
              {email ? "Faol" : "Faol emas"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
