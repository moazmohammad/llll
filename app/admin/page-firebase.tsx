"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin/dashboard")
      }
      setCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      // سيتم التوجيه تلقائياً عبر useEffect عند تغيير حالة المصادقة
    } catch (error: any) {
      console.error("Login error:", error)
      
      // ترجمة رسائل الخطأ إلى العربية
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول"
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "المستخدم غير موجود"
          break
        case "auth/wrong-password":
          errorMessage = "كلمة المرور غير صحيحة"
          break
        case "auth/invalid-email":
          errorMessage = "البريد الإلكتروني غير صحيح"
          break
        case "auth/user-disabled":
          errorMessage = "تم تعطيل هذا الحساب"
          break
        case "auth/too-many-requests":
          errorMessage = "تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً"
          break
        case "auth/network-request-failed":
          errorMessage = "خطأ في الاتصال بالشبكة"
          break
        case "auth/invalid-credential":
          errorMessage = "البيانات المدخلة غير صحيحة"
          break
        default:
          errorMessage = error.message || "حدث خطأ غير متوقع"
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // إزالة رسالة الخطأ عند بدء الكتابة
    if (error) setError("")
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            مكتبة الأمل
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            لوحة تحكم المسؤولين
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بيانات المسؤول للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pl-10 text-right"
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="pl-10 pr-10 text-right"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                للحصول على حساب مسؤول، تواصل مع مطور النظام
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 مكتبة الأمل. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  )
}

