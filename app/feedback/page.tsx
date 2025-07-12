"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, MessageSquare, Send, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    rating: "",
    message: "",
  })

  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // حفظ التعليق في localStorage
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]")
    const newFeedback = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      status: "جديد",
    }
    feedbacks.push(newFeedback)
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks))

    toast({
      title: "تم الإرسال ✅",
      description: "شكراً لك! تم إرسال رأيك بنجاح وسنراجعه قريباً",
      variant: "success",
    })

    setFormData({
      name: "",
      email: "",
      type: "",
      rating: "",
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
              <Link href="/">
                <Button variant="outline" size="sm">
                  العودة للمتجر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <MessageSquare className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">آراؤكم ومقترحاتكم</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن نقدر آراءكم ومقترحاتكم لتحسين خدماتنا وتطوير متجرنا
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 ml-2" />
                شاركنا رأيك
              </CardTitle>
              <CardDescription>املأ النموذج أدناه لإرسال رأيك أو مقترحك</CardDescription>
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
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع التعليق *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التعليق" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">اقتراح</SelectItem>
                        <SelectItem value="complaint">شكوى</SelectItem>
                        <SelectItem value="compliment">إعجاب</SelectItem>
                        <SelectItem value="question">استفسار</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">التقييم العام</Label>
                    <Select value={formData.rating} onValueChange={(value) => handleChange("rating", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="قيم تجربتك" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">ممتاز ⭐⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="4">جيد جداً ⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="3">جيد ⭐⭐⭐</SelectItem>
                        <SelectItem value="2">مقبول ⭐⭐</SelectItem>
                        <SelectItem value="1">ضعيف ⭐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">رسالتك *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="text-right"
                    rows={6}
                    placeholder="شاركنا رأيك أو اقتراحك بالتفصيل..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 ml-2" />
                  إرسال التعليق
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>لماذا رأيك مهم؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">تحسين الخدمة</h4>
                    <p className="text-sm text-gray-600">آراؤكم تساعدنا في تطوير خدماتنا باستمرار</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">إضافة منتجات جديدة</h4>
                    <p className="text-sm text-gray-600">اقتراحاتكم تساعدنا في اختيار المنتجات المناسبة</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">تجربة أفضل</h4>
                    <p className="text-sm text-gray-600">نسعى لتوفير أفضل تجربة تسوق لعملائنا</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>طرق التواصل الأخرى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">الهاتف</h4>
                  <p className="text-sm text-blue-700">01096126768</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">واتساب</h4>
                  <p className="text-sm text-green-700">تواصل معنا مباشرة</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">فيسبوك</h4>
                  <p className="text-sm text-purple-700">تابعنا على صفحتنا الرسمية</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
