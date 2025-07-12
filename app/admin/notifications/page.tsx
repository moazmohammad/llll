"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Bell, Check, Trash2 } from "lucide-react"
import Link from "next/link"
import { getNotifications, saveNotifications, getCurrentUser, type Notification } from "@/lib/store"

export default function AdminNotifications() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const currentUser = getCurrentUser()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setNotifications(getNotifications())
    }
  }, [router])

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    setNotifications(updatedNotifications)
    saveNotifications(updatedNotifications)
  }

  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter((notif) => notif.id !== id)
    setNotifications(updatedNotifications)
    saveNotifications(updatedNotifications)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, isRead: true }))
    setNotifications(updatedNotifications)
    saveNotifications(updatedNotifications)
  }

  const typeColors = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  }

  const typeNames = {
    info: "معلومات",
    success: "نجح",
    warning: "تحذير",
    error: "خطأ",
  }

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
              <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            الإشعارات ({notifications.filter((n) => !n.isRead).length} غير مقروءة)
          </h2>
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-600">ستظهر الإشعارات الجديدة هنا</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${!notification.isRead ? "border-blue-200 bg-blue-50" : ""} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <Badge className={typeColors[notification.type]}>{typeNames[notification.type]}</Badge>
                        {!notification.isRead && <Badge className="bg-blue-500">جديد</Badge>}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteNotification(notification.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
