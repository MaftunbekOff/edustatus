"use client"

import { ToastProvider as ToastProviderBase } from "@/components/ui/toast"
import { AuthProvider } from "@/lib/auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProviderBase>{children}</ToastProviderBase>
    </AuthProvider>
  )
}
