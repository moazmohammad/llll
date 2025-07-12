"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, BookOpen, Plus, Minus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getCart, saveCart, type CartItem } from "@/lib/store"

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

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

  const clearCart = () => {
    setCart([])
    saveCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cart.length > 0 ? 15 : 0
  const total = subtotal + shipping

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
                  متابعة التسوق
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">سلة التسوق</h2>
            <p className="text-gray-600">{cart.length === 0 ? "السلة فارغة" : `لديك ${cart.length} منتج في السلة`}</p>
          </div>
          {cart.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              <Trash2 className="h-4 w-4 ml-2" />
              إفراغ السلة
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">السلة فارغة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة المنتجات التي تريد شراءها</p>
            <Link href="/products">
              <Button>تصفح المنتجات</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-right">{item.name}</h4>
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
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم الشحن:</span>
                    <span>{shipping} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>المجموع الكلي:</span>
                    <span>{total} ج.م</span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      إتمام الطلب
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
