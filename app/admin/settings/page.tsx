"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ArrowLeft, Save, Settings, Truck, CreditCard, Database, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  storeName: string
  storeDescription: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  shippingCost: number
  freeShippingThreshold: number
  enableOnlinePayment: boolean
  enableCashOnDelivery: boolean
  autoBackup: boolean
  backupInterval: number
  enableAnalytics: boolean
  enableNotifications: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    storeName: "مكتبة الأمل",
    storeDescription: "وجهتكم المثالية للحصول على أفضل المنتجات التعليمية والثقافية",
    storePhone: "01096126768",
    storeEmail: "info@hopestore.com",
    storeAddress: "الفيوم - أبشواي، جمهورية مصر العربية",
    shippingCost: 15,
    freeShippingThreshold: 200,
    enableOnlinePayment: false,
    enableCashOnDelivery: true,
    autoBackup: true,
    backupInterval: 24,
    enableAnalytics: true,
    enableNotifications: true,
  })
  const currentUser = getCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      loadSettings()
    }
  }, [router])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const saveSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings))
    toast({
      title: "تم الحفظ ✅",
      description: "تم حفظ إعدادات النظام بنجاح",
      variant: "success",
    })
  }

  const handleChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const createBackup = () => {
    const backupData = {
      products: localStorage.getItem("products"),
      orders: localStorage.getItem("orders"),
      users: localStorage.getItem("users"),
      categories: localStorage.getItem("categories"),
      coupons: localStorage.getItem("coupons"),
      settings: localStorage.getItem("systemSettings"),
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "تم إنشاء النسخة الاحتياطية ✅",
      description: "تم تحميل النسخة الاحتياطية بنجاح",
      variant: "success",
    })
  }

  const restoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)

        // Restore data
        if (backupData.products) localStorage.setItem("products", backupData.products)
        if (backupData.orders) localStorage.setItem("orders", backupData.orders)
        if (backupData.users) localStorage.setItem("users", backupData.users)
        if (backupData.categories) localStorage.setItem("categories", backupData.categories)
        if (backupData.coupons) localStorage.setItem("coupons", backupData.coupons)
        if (backupData.settings) localStorage.setItem("systemSettings", backupData.settings)

        toast({
          title: "تم الاستعادة ✅",
          description: "تم استعادة النسخة الاحتياطية بنجاح",
          variant: "success",
        })

        // Reload page to reflect changes
        window.location.reload()
      } catch (error) {
        toast({
          title: "خطأ في الاستعادة",
          description: "فشل في استعادة النسخة الاحتياطية",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إعدادات النظام</h1>
            </div>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              عام
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              الشحن
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              الدفع
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              النسخ الاحتياطي
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إعدادات المتجر الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">اسم المتجر</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => handleChange("storeName", e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">رقم الهاتف</Label>
                    <Input
                      id="storePhone"
                      value={settings.storePhone}
                      onChange={(e) => handleChange("storePhone", e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => handleChange("storeEmail", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">وصف المتجر</Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.storeDescription}
                    onChange={(e) => handleChange("storeDescription", e.target.value)}
                    className="text-right"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">عنوان المتجر</Label>
                  <Textarea
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => handleChange("storeAddress", e.target.value)}
                    className="text-right"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الشحن</CardTitle>
                <CardDescription>إعدادات الشحن والتوصيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">تكلفة الشحن (ج.م)</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      value={settings.shippingCost}
                      onChange={(e) => handleChange("shippingCost", Number.parseFloat(e.target.value))}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">الحد الأدنى للشحن المجاني (ج.م)</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => handleChange("freeShippingThreshold", Number.parseFloat(e.target.value))}
                      className="text-right"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الدفع</CardTitle>
                <CardDescription>طرق الدفع المتاحة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الدفع عند الاستلام</Label>
                    <p className="text-sm text-gray-500">السماح بالدفع عند استلام الطلب</p>
                  </div>
                  <Switch
                    checked={settings.enableCashOnDelivery}
                    onCheckedChange={(checked) => handleChange("enableCashOnDelivery", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الدفع الإلكتروني</Label>
                    <p className="text-sm text-gray-500">السماح بالدفع عبر الإنترنت</p>
                  </div>
                  <Switch
                    checked={settings.enableOnlinePayment}
                    onCheckedChange={(checked) => handleChange("enableOnlinePayment", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>النسخ الاحتياطي</CardTitle>
                <CardDescription>إدارة النسخ الاحتياطية للبيانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>النسخ الاحتياطي التلقائي</Label>
                    <p className="text-sm text-gray-500">إنشاء نسخة احتياطية تلقائياً</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleChange("autoBackup", checked)}
                  />
                </div>

                {settings.autoBackup && (
                  <div className="space-y-2">
                    <Label htmlFor="backupInterval">فترة النسخ الاحتياطي (ساعة)</Label>
                    <Input
                      id="backupInterval"
                      type="number"
                      value={settings.backupInterval}
                      onChange={(e) => handleChange("backupInterval", Number.parseInt(e.target.value))}
                      className="text-right w-32"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={createBackup} className="flex-1">
                    <Database className="h-4 w-4 ml-2" />
                    إنشاء نسخة احتياطية
                  </Button>
                  <div className="flex-1">
                    <input type="file" accept=".json" onChange={restoreBackup} className="hidden" id="restore-backup" />
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <label htmlFor="restore-backup" className="cursor-pointer">
                        <BarChart3 className="h-4 w-4 ml-2" />
                        استعادة نسخة احتياطية
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
