"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface DangerZoneCardProps {
  onTabulaRasa: () => void
}

export function DangerZoneCard({ onTabulaRasa }: DangerZoneCardProps) {
  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg text-orange-600">Tabula Rasa</CardTitle>
        <CardDescription>
          Tashkilot ma'lumotlarini tozalash. Bu amal tashkilot ma'lumotlarini (talabalar, to'lovlar, guruhlar) o'chirib, ro'yxatdan o'tgan sanani bugungi kunga o'zgartiradi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant="outline"
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
          onClick={() => {
            if (confirm("Rostdan ham tashkilot ma'lumotlarini tozlamoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) {
              onTabulaRasa()
            }
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Ma'lumotlarni tozalash
        </Button>
      </CardContent>
    </Card>
  )
}