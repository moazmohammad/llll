"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // حفظ الرسالة في localStorage
    const messages = JSON.parse(localStorage.getItem("messages") || "[]")
    const newMessage = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      status: "جديد",
    }
    messages.push(newMessage)
    localStorage.setItem("messages", JSON.stringify(messages))

    alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.")
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">مكتبة الأمل</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="outline" size="sm">
                  تصفح المنتجات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">اتصل بنا</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو طلب
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 ml-2" />
                أرسل لنا رسالة
              </CardTitle>
              <CardDescription>املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">موضوع الرسالة *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="text-right"
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 ml-2" />
                  إرسال الرسالة
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">الهاتف</p>
                    <p className="text-gray-600">01096126768</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-gray-600">info@hopestore.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">العنوان</p>
                    <p className="text-gray-600">الفيوم - أبشواي، جمهورية مصر العربية</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">ساعات العمل</p>
                    <p className="text-gray-600">السبت - الخميس: 9:00 ص - 9:00 م</p>
                    <p className="text-gray-600">الجمعة: 2:00 م - 9:00 م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>خدمة العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">الشحن والتوصيل</h4>
                    <p className="text-sm text-blue-700">نوصل لجميع أنحاء محافظة الفيوم خلال 1-3 أيام عمل</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">الدفع عند الاستلام</h4>
                    <p className="text-sm text-green-700">يمكنك الدفع نقداً عند استلام طلبك</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">ضمان الجودة</h4>
                    <p className="text-sm text-purple-700">جميع منتجاتنا أصلية ومضمونة الجودة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
