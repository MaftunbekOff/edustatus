import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tibbiyot Texnikumi - Moliyaviy Tizim",
  description: "Tibbiyot texnikumi buxgalteriyasi uchun moliyaviy monitoring tizimi",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
