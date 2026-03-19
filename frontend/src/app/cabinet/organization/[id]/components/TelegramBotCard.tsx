/**
 * TelegramBotCard Component
 * 
 * Displays and manages Telegram bot settings for an organization.
 * Following Single Responsibility Principle - handles only Telegram bot.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MessageCircle, Edit, Check, X, Loader2 } from "lucide-react"

/**
 * Props for TelegramBotCard component
 */
export interface TelegramBotCardProps {
  /** Whether Telegram bot is active */
  hasTelegramBot: boolean
  /** Telegram bot token */
  telegramBotToken?: string | null
  /** Telegram chat ID */
  telegramChatId?: string | null
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
  /** Callback when hasTelegramBot changes */
  onHasTelegramBotChange: (value: boolean) => void
  /** Callback when bot token changes */
  onBotTokenChange: (value: string) => void
  /** Callback when chat ID changes */
  onChatIdChange: (value: string) => void
}

/**
 * TelegramBotCard Component
 * 
 * @example
 * <TelegramBotCard
 *   hasTelegramBot={organization.hasTelegramBot}
 *   isEditing={editingSection === 'telegram'}
 *   // ... other props
 * />
 */
export function TelegramBotCard({
  hasTelegramBot,
  telegramBotToken,
  telegramChatId,
  isEditing,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSave,
  onHasTelegramBotChange,
  onBotTokenChange,
  onChatIdChange,
}: TelegramBotCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Telegram bot
          </CardTitle>
          <CardDescription>Telegram orqali bildirishnomalar yuborish</CardDescription>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Telegram bot</p>
              <p className="text-sm text-muted-foreground">Telegram orqali xabarlarni yuborish</p>
            </div>
          </div>
          {isEditing ? (
            <Switch
              checked={hasTelegramBot}
              onCheckedChange={onHasTelegramBotChange}
            />
          ) : (
            <Badge variant={hasTelegramBot ? "success" : "secondary"}>
              {hasTelegramBot ? "Faol" : "Faol emas"}
            </Badge>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Bot token</p>
            {isEditing ? (
              <Input 
                placeholder="Bot tokenini kiriting" 
                type="password"
                value={telegramBotToken || ''}
                onChange={(e) => onBotTokenChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{telegramBotToken ? '****' : '-'}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Chat ID</p>
            {isEditing ? (
              <Input 
                placeholder="Chat ID ni kiriting"
                value={telegramChatId || ''}
                onChange={(e) => onChatIdChange(e.target.value)}
              />
            ) : (
              <p className="font-medium">{telegramChatId || '-'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
