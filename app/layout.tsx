import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// إضافة Toaster في layout
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "مكتبة الأمل - متجر الكتب والأدوات المكتبية",
  description: "متجر إلكتروني متخصص في بيع الكتب والأدوات المكتبية والألعاب التعليمية",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // في return statement
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
