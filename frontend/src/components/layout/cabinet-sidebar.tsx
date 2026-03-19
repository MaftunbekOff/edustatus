"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  TrendingUp,
  Bell,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Dashboard", href: "/cabinet", icon: LayoutDashboard },
  { name: "Tashkilotlar", href: "/cabinet/organization", icon: Building2 },
  { name: "Tashkilot turlari", href: "/cabinet/organization-types", icon: Globe },
  { name: "Obunalar", href: "/cabinet/subscriptions", icon: CreditCard },
  { name: "To'lovlar", href: "/cabinet/billing", icon: TrendingUp },
  { name: "Foydalanuvchilar", href: "/cabinet/users", icon: Users },
  { name: "Sozlamalar", href: "/cabinet/settings", icon: Settings },
]

interface CabinetSidebarProps {
  className?: string
}

export function CabinetSidebar({ className }: CabinetSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-white/10">
            <Link href="/cabinet" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-lg font-bold text-purple-900">C</span>
              </div>
              <div>
                <span className="text-lg font-semibold">Cabinet</span>
                <p className="text-xs text-white/60">SaaS Boshqaruvi</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Notifications */}
          <div className="border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Bell className="mr-2 h-5 w-5" />
              Bildirishnomalar
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                3
              </span>
            </Button>
          </div>

          {/* User section */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm font-medium">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.fullName || 'Super Admin'}</p>
                <p className="text-xs text-white/60">{user?.email || 'admin@platform.uz'}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/60 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
