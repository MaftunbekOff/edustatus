"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CabinetSidebar } from "@/components/layout/cabinet-sidebar"
import { CabinetHeader } from "@/components/layout/cabinet-header"

interface CabinetLayoutProps {
  children: React.ReactNode
}

export default function CabinetLayout({ children }: CabinetLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "creator") {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Not authorized
  if (!user || user.role !== "creator") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CabinetSidebar />
      <div className="lg:pl-64">
        <CabinetHeader />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
