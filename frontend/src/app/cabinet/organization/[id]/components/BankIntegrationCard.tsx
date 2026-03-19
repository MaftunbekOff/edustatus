/**
 * BankIntegrationCard Component
 * 
 * Displays and manages bank integration settings for an organization.
 * Following Single Responsibility Principle - handles only bank integration.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Wallet, Edit, Check, X, Loader2 } from "lucide-react"

/**
 * Props for BankIntegrationCard component
 */
export interface BankIntegrationCardProps {
  /** Whether bank integration is active */
  hasBankIntegration: boolean
  /** Bank name */
  bankName?: string | null
  /** Bank account number */
  bankAccountNumber?: string | null
  /** Bank MFO code */
  bankMfoCode?: string | null
  /** Bank API key */
  bankApiKey?: string | null
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
  /** Callback when hasBankIntegration changes */
  onHasBankIntegrationChange: (value: boolean) => void
  /** Callback when bank name changes */
  onBankNameChange: (value: string) => void
  /** Callback when bank account number changes */
  onBankAccountNumberChange: (value: string) => void
  /** Callback when bank MFO code changes */
  onBankMfoCodeChange: (value: string) => void
  /** Callback when bank API key changes */
  onBankApiKeyChange: (value: string) => void
}

/**
 * BankIntegrationCard Component
 * 
 * @example
 * <BankIntegrationCard
 *   hasBankIntegration={organization.hasBankIntegration}
 *   isEditing={editingSection === 'bank'}
 *   onStartEditing={() => setEditingSection('bank')}
 *   // ... other props
 * />
 */
export function BankIntegrationCard({
  hasBankIntegration,
  bankName,
  bankAccountNumber,
  bankMfoCode,
  bankApiKey,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onHasBankIntegrationChange,
  onBankNameChange,
  onBankAccountNumberChange,
  onBankMfoCodeChange,
  onBankApiKeyChange,
}: BankIntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Bank integratsiyasi
          </CardTitle>
          <CardDescription>Bank tizimlari bilan bog'lanish sozlamalari</CardDescription>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Bank integratsiyasi</p>
              <p className="text-sm text-muted-foreground">Bank orqali to'lovlarni qabul qilish</p>
            </div>
          </div>
          {isEditing ? (
            <Switch
              checked={hasBankIntegration}
              onCheckedChange={onHasBankIntegrationChange}
            />
          ) : (
            <Badge variant={hasBankIntegration ? "success" : "secondary"}>
              {hasBankIntegration ? "Faol" : "Faol emas"}
            </Badge>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Bank nomi</p>
            {isEditing ? (
              <Input 
                placeholder="Bank nomini kiriting" 
                value={bankName || ''}
                onChange={(e) => onBankNameChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{bankName || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Hisob raqami</p>
            {isEditing ? (
              <Input 
                placeholder="Hisob raqamini kiriting"
                value={bankAccountNumber || ''}
                onChange={(e) => onBankAccountNumberChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{bankAccountNumber || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">MFO kodi</p>
            {isEditing ? (
              <Input 
                placeholder="MFO kodini kiriting"
                value={bankMfoCode || ''}
                onChange={(e) => onBankMfoCodeChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{bankMfoCode || '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">API kaliti</p>
            {isEditing ? (
              <Input 
                placeholder="API kalitini kiriting" 
                type="password"
                value={bankApiKey || ''}
                onChange={(e) => onBankApiKeyChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{bankApiKey ? '****' : '-'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
