"use client"

import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CabinetHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tashkilot, foydalanuvchi qidirish..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Faol texnikumlar</p>
            <p className="text-sm font-semibold text-green-600">24</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Oylik aylanma</p>
            <p className="text-sm font-semibold text-purple-600">125M so'm</p>
          </div>
        </div>
      </div>
    </header>
  )
}
