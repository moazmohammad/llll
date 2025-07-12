"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Download, Calendar, TrendingUp, DollarSign, Package, Users } from "lucide-react"
import Link from "next/link"
import { getOrders, type Order } from "@/lib/store"

export default function AdminReports() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setOrders(getOrders())
    }
  }, [router])

  // حساب الإحصائيات الحقيقية
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const completedOrders = orders.filter((order) => order.status === "مكتمل").length
  const pendingOrders = orders.filter((order) => order.status === "جديد" || order.status === "قيد التجهيز").length
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  // إحصائيات شهرية (محاكاة)
  const monthlyData = [
    { month: "يناير", sales: totalSales * 0.15, orders: Math.floor(totalOrders * 0.15) },
    { month: "فبراير", sales: totalSales * 0.12, orders: Math.floor(totalOrders * 0.12) },
    { month: "مارس", sales: totalSales * 0.18, orders: Math.floor(totalOrders * 0.18) },
    { month: "أبريل", sales: totalSales * 0.2, orders: Math.floor(totalOrders * 0.2) },
    { month: "مايو", sales: totalSales * 0.16, orders: Math.floor(totalOrders * 0.16) },
    { month: "يونيو", sales: totalSales * 0.19, orders: Math.floor(totalOrders * 0.19) },
  ]

  // أفضل المنتجات (محاكاة بناءً على الطلبات)
  const topProducts = [
    { name: "مجموعة أقلام ملونة", sales: Math.floor(totalOrders * 0.3), revenue: totalSales * 0.25 },
    { name: "كتاب الأدب العربي", sales: Math.floor(totalOrders * 0.25), revenue: totalSales * 0.2 },
    { name: "لعبة الشطرنج", sales: Math.floor(totalOrders * 0.2), revenue: totalSales * 0.3 },
    { name: "دفتر ملاحظات جلدي", sales: Math.floor(totalOrders * 0.15), revenue: totalSales * 0.15 },
    { name: "موسوعة العلوم", sales: Math.floor(totalOrders * 0.1), revenue: totalSales * 0.1 },
  ]

  if (!isAuthenticated) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة
                </Button>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
            </div>
            <Button onClick={() => window.print()}>
              <Download className="h-4 w-4 ml-2" />
              طباعة التقرير
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales.toFixed(2)} ج.م</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 ml-1" />
                من {totalOrders} طلب
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات المكتملة</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-blue-600">من أصل {totalOrders} طلب</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-orange-600">تحتاج متابعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOrderValue.toFixed(2)} ج.م</div>
              <p className="text-xs text-purple-600">لكل طلب</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Sales */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
              <CardDescription>توزيع المبيعات على الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-500">{month.orders} طلب</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{month.sales.toFixed(2)} ج.م</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(month.sales / Math.max(...monthlyData.map((m) => m.sales))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>المنتجات الأكثر مبيعاً وإيراداً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} مبيعة</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{product.revenue.toFixed(2)} ج.م</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(product.sales / Math.max(...topProducts.map((p) => p.sales))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>تحليل مفصل</CardTitle>
            <CardDescription>إحصائيات تفصيلية عن أداء المتجر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">معدل إتمام الطلبات</h4>
                <p className="text-2xl font-bold text-green-600">
                  {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">إجمالي الإيرادات</h4>
                <p className="text-2xl font-bold text-blue-600">{totalSales.toFixed(2)} ج.م</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">عدد العملاء</h4>
                <p className="text-2xl font-bold text-purple-600">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
