"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = React.useState(true)
  const [pendingSync, setPendingSync] = React.useState(0)
  const [showBanner, setShowBanner] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)

  React.useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Simulate pending sync count when offline
    if (!isOnline) {
      setPendingSync(5)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isOnline])

  const handleSync = () => {
    setIsSyncing(true)
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false)
      setPendingSync(0)
    }, 2000)
  }

  // Status indicator in header
  if (!showBanner) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOnline ? (
          <div className="flex items-center gap-1 text-green-600">
            <Cloud className="h-4 w-4" />
            <span className="text-xs hidden md:inline">Sinxronizatsiya</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-yellow-600">
            <CloudOff className="h-4 w-4" />
            <span className="text-xs hidden md:inline">Oflayn</span>
            {pendingSync > 0 && (
              <Badge variant="warning" className="ml-1 text-xs">
                {pendingSync}
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full banner when offline
  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-yellow-200 bg-yellow-50 shadow-lg">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <WifiOff className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-yellow-800">
                Oflayn rejim
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Internet aloqasi uzildi. Ma'lumotlar saqlanadi va keyin sinxronizatsiya qilinadi.
            </p>
            
            {pendingSync > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-yellow-100 p-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {pendingSync} ta amal kutilmoqda
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      Sinxronizatsiya...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Sinxronizatsiya
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600">
              <CheckCircle className="h-3 w-3" />
              <span>Ma'lumotlar xavfsiz saqlanadi</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini status badge for sidebar
export function OfflineBadge() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <Badge variant="warning" className="ml-auto">
      <WifiOff className="mr-1 h-3 w-3" />
      Oflayn
    </Badge>
  )
}
