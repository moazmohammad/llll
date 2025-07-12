"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUsers, setCurrentUser } from "@/lib/store"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const users = getUsers()
      const user = users.find((u) => u.username === credentials.username && u.password === credentials.password)

      if (user) {
        setCurrentUser(user)
        localStorage.setItem("adminLoggedIn", "true")
        alert(`مرحباً ${user.name}!`)
        router.push("/")
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة")
      }
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">مكتبة الأمل</h1>
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>تسجيل الدخول</span>
          </CardTitle>
          <CardDescription>قم بتسجيل الدخول للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="text-right"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
              العودة إلى المتجر
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
