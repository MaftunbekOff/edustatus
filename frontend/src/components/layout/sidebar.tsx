"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  QrCode,
  FileSignature,
  GraduationCap,
  UserCog,
  Calculator,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  getNavigationForOrganizationType,
  NavItem,
  organizationTypeToCategory,
} from "@/lib/constants/navigation"
import { useOrganization } from "@/lib/organization-context"

interface SidebarProps {
  className?: string
}

function NavItemComponent({ item, pathname, onClose, depth = 0 }: { 
  item: NavItem
  pathname: string
  onClose: () => void
  depth?: number 
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
  
  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.children?.some(child => pathname === child.href)) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.children])

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            {item.name}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-slate-700 pl-2">
            {item.children!.map((child) => (
              <NavItemComponent 
                key={child.name} 
                item={child} 
                pathname={pathname} 
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.name}
    </Link>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { organization, organizationType, isLoading } = useOrganization()

  // Get navigation based on organization type
  const navigation = React.useMemo(() => {
    if (isLoading) {
      // Return default education navigation while loading
      return getNavigationForOrganizationType('college')
    }
    return getNavigationForOrganizationType(organizationType)
  }, [organizationType, isLoading])

  // Get organization display info
  const orgInfo = React.useMemo(() => {
    const category = organizationTypeToCategory[organizationType] || 'other'
    return {
      name: organization?.name || 'Tashkilot',
      type: category,
    }
  }, [organization, organizationType])

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
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-slate-700">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold">E</span>
              </div>
              <span className="text-lg font-semibold">EduStatus</span>
            </Link>
          </div>

          {/* Organization Info */}
          {organization && (
            <div className="border-b border-slate-700 px-4 py-3">
              <p className="text-sm font-medium text-white truncate">{orgInfo.name}</p>
              <p className="text-xs text-slate-400 capitalize">{orgInfo.type}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavItemComponent 
                key={item.name} 
                item={item} 
                pathname={pathname} 
                onClose={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                <span className="text-sm font-medium">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-slate-400">admin@texnikum.uz</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  localStorage.clear()
                  window.location.href = "/login"
                }}
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
