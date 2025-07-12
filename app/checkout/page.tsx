"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BookOpen, ShoppingCart, CreditCard, Truck, Percent, Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCoupons, getCart, saveCart, type Coupon, type CartItem } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  })
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    setCart(getCart())
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }

    const newCart = cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCart(newCart)
    saveCart(newCart)
  }

  const removeFromCart = (id: number) => {
    const newCart = cart.filter((item) => item.id !== id)
    setCart(newCart)
    saveCart(newCart)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cart.length > 0 ? 15 : 0

  // حساب الخصم
  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = (subtotal * appliedCoupon.discount) / 100
    } else {
      discount = appliedCoupon.discount
    }
  }

  const total = Math.round(subtotal + shipping - discount)

  const applyCoupon = () => {
    const coupons = getCoupons()
    const coupon = coupons.find(
      (c) => c.code === couponCode.toUpperCase() && c.isActive && new Date(c.expiryDate) > new Date(),
    )

    if (!coupon) {
      toast({
        title: "كود خصم غير صالح",
        description: "تأكد من صحة الكود أو تاريخ انتهائه",
        variant: "destructive",
      })
      return
    }

    if (coupon.minAmount && subtotal < coupon.minAmount) {
      toast({
        title: "الحد الأدنى غير مستوفى",
        description: `الحد الأدنى للطلب ${coupon.minAmount} ج.م`,
        variant: "destructive",
      })
      return
    }

    setAppliedCoupon(coupon)
    toast({
      title: "تم تطبيق الكود ✅",
      description: `تم خصم ${coupon.type === "percentage" ? coupon.discount + "%" : coupon.discount + " ج.م"}`,
      variant: "success",
    })
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast({
      title: "تم إلغاء الكود",
      description: "تم إلغاء كود الخصم",
      variant: "success",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "أضف منتجات إلى السلة أولاً",
        variant: "destructive",
      })
      return
    }

    // إنشاء الطلب
    const order = {
      id: `#${Date.now()}`,
      customer: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: cart,
      subtotal: subtotal,
      shipping: shipping,
      discount: discount,
      total: total,
      paymentMethod: formData.paymentMethod,
      status: "جديد",
      date: new Date().toISOString().split("T")[0],
      notes: formData.notes,
      coupon: appliedCoupon?.code,
    }

    // حفظ الطلب في localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    existingOrders.push(order)
    localStorage.setItem("orders", JSON.stringify(existingOrders))

    // مسح السلة
    setCart([])
    saveCart([])

    toast({
      title: "تم إرسال الطلب ✅",
      description: "تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً",
      variant: "success",
    })

    router.push("/")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">مكتبة الأمل</h1>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">السلة فارغة</h2>
          <p className="text-gray-600 mb-6">أضف منتجات إلى السلة لإتمام الطلب</p>
          <Link href="/products">
            <Button>تصفح المنتجات</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">مكتبة الأمل</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  بيانات الطلب
                </CardTitle>
                <CardDescription>أدخل بياناتك لإتمام الطلب</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان بالتفصيل *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="text-right"
                      placeholder="المحافظة - المدينة - الشارع - رقم المنزل"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      className="text-right"
                      placeholder="أي ملاحظات خاصة بالطلب..."
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>طريقة الدفع</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleChange("paymentMethod", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash_on_delivery" id="cash" />
                        <Label htmlFor="cash" className="flex items-center cursor-pointer">
                          <Truck className="h-4 w-4 ml-2" />
                          الدفع عند الاستلام
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 opacity-50">
                        <RadioGroupItem value="online" id="online" disabled />
                        <Label htmlFor="online" className="flex items-center cursor-not-allowed">
                          <CreditCard className="h-4 w-4 ml-2" />
                          الدفع الإلكتروني (قريباً)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    تأكيد الطلب ({total} ج.م)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>منتجات السلة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-right text-sm">{item.name}</h4>
                      <p className="text-blue-600 font-medium">{item.price} ج.م</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.price * item.quantity} ج.م</p>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Section */}
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span className="font-medium">كود الخصم</span>
                  </div>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="أدخل كود الخصم"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-right"
                      />
                      <Button onClick={applyCoupon} variant="outline" disabled={!couponCode.trim()}>
                        تطبيق
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-green-800 font-medium">{appliedCoupon.code}</span>
                      <Button onClick={removeCoupon} variant="ghost" size="sm">
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم الشحن:</span>
                    <span>{shipping} ج.م</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم:</span>
                      <span>-{Math.round(discount)} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>المجموع الكلي:</span>
                    <span>{total} ج.م</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">معلومات الشحن:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• الشحن داخل الفيوم: 15 ج.م</li>
                    <li>• مدة التوصيل: 1-3 أيام عمل</li>
                    <li>• الدفع عند الاستلام متاح</li>
                    <li>• للاستفسار: 01096126768</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
