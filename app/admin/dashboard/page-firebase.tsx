"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Menu, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Eye
} from "lucide-react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        setUserEmail(user.email || "")
      } else {
        router.push("/admin")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">لوحة تحكم مكتبة الأمل</h1>
                <p className="text-sm text-gray-600">مرحباً، {userEmail}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 ml-2" />
                  عرض الموقع
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 من الشهر الماضي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القوائم النشطة</CardTitle>
              <Menu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">5 رئيسية، 2 فرعية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الزوار اليوم</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+5% من أمس</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,340 ر.س</div>
              <p className="text-xs text-muted-foreground">+15% من الأسبوع الماضي</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Cards */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">إدارة المحتوى</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  إدارة القوائم
                </CardTitle>
                <CardDescription>
                  إضافة وتعديل وحذف قوائم الموقع الرئيسية والفرعية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Badge variant="default">7 قوائم نشطة</Badge>
                    <Badge variant="secondary">Firebase متصل</Badge>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Link href="/admin/menus">
                      <Button size="sm">
                        <Edit className="h-4 w-4 ml-2" />
                        إدارة
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  إدارة المنتجات
                </CardTitle>
                <CardDescription>
                  إضافة وتعديل وحذف المنتجات والكتب والأدوات المكتبية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Badge variant="default">156 منتج</Badge>
                    <Badge variant="outline">قريباً</Badge>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button size="sm" disabled>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة منتج
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">حالة النظام</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إعدادات Firebase
                </CardTitle>
                <CardDescription>
                  حالة الاتصال بخدمات Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">المصادقة (Authentication)</span>
                    <Badge variant="default">متصل</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">قاعدة البيانات (Firestore)</span>
                    <Badge variant="default">متصل</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">التخزين (Storage)</span>
                    <Badge variant="secondary">غير مفعل</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
                <CardDescription>
                  مهام شائعة يمكنك القيام بها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/menus">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة قائمة جديدة
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة منتج جديد
                  </Button>
                  <Link href="/" target="_blank">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة الموقع
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

