"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Search, BookOpen, Gamepad2, PenTool, Heart, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import {
  getProducts,
  getCart,
  saveCart,
  getCurrentUser,
  initializeSync,
  type Product,
  type CartItem,
} from "@/lib/store"

// استبدال alert بـ toast في دالة addToCart
import { useToast } from "@/hooks/use-toast"

// إضافة أيقونات الفيسبوك والواتساب في الفوتر
import { Facebook, MessageCircle } from "lucide-react"

const categories = [
  { name: "أدوات مكتبية", icon: PenTool, count: 150 },
  { name: "كتب", icon: BookOpen, count: 300 },
  { name: "ألعاب", icon: Gamepad2, count: 80 },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentUser, setCurrentUserState] = useState(getCurrentUser())

  // في بداية المكون
  const { toast } = useToast()

  useEffect(() => {
    // تهيئة نظام التزامن
    initializeSync()
    
    const loadData = () => {
      setProducts(getProducts())
      setCart(getCart())
    }

    loadData()

    // الاستماع لأحداث التحديث
    const handleProductsUpdate = () => {
      setProducts(getProducts())
    }

    const handleCartUpdate = () => {
      setCart(getCart())
    }

    window.addEventListener('productsUpdated', handleProductsUpdate)
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // استبدال دالة addToCart
  const addToCart = (product: Product) => {
    if (!product.inStock) {
      toast({
        title: "غير متوفر",
        description: "هذا المنتج غير متوفر حالياً",
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)
    let newCart: CartItem[]

    if (existingItem) {
      newCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      newCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ]
    }

    setCart(newCart)
    saveCart(newCart)

    toast({
      title: "تم الإضافة ✅",
      description: `تم إضافة ${product.name} إلى السلة بنجاح`,
      variant: "success",
    })
  }

  // المنتجات الأكثر مبيعاً - محدثة ومطورة
  const bestSellingProducts = products
    .filter((product) => product.sales && product.sales > 0)
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 4)

  const featuredProducts = bestSellingProducts.length > 0 ? bestSellingProducts : products.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">مكتبة الأمل</h1>
                </div>

                <div className="flex-1 max-w-lg mx-4 md:mx-8 hidden sm:block order-first">
                  <Link href="/products">
                    <div className="relative cursor-pointer">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input placeholder="ابحث عن المنتجات..." className="pr-10 text-right" readOnly />
                    </div>
                  </Link>
                </div>
              </div>

            <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
              <Link href="/cart">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-auto" />
                  <span className="hidden sm:inline">السلة</span> ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </Button>
              </Link>
              <Link href="/forum" className="hidden md:block">
                <Button variant="outline" size="sm">
                  المنتدى
                </Button>
              </Link>
              {currentUser ? (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm hidden lg:block">مرحباً {currentUser.name}</span>
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-auto" />
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <Link href="/products">
          <div className="relative cursor-pointer">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="ابحث عن المنتجات..." className="pr-10 text-right" readOnly />
          </div>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">مرحباً بكم في مكتبة الأمل</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              وجهتكم المثالية للحصول على أفضل الكتب والأدوات المكتبية والألعاب التعليمية
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8 md:mb-12">تسوق حسب الفئة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link key={index} href={`/products?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200">
                  <CardHeader className="text-center">
                    <category.icon className="h-10 w-10 md:h-12 md:w-12 mx-auto text-blue-600 mb-4" />
                    <CardTitle className="text-lg md:text-xl">{category.name}</CardTitle>
                    <CardDescription>{category.count} منتج</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8 md:mb-12">
            {bestSellingProducts.length > 0 ? "المنتجات الأكثر مبيعاً" : "المنتجات المميزة"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-40 md:h-48 object-cover rounded-t-lg"
                    />
                    {product.badge && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-xs">{product.badge}</Badge>
                    )}
                    {bestSellingProducts.includes(product) && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-xs">🔥 {product.sales} مبيعة</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm text-gray-500 mb-1">{product.category}</div>
                  <h4 className="font-semibold mb-2 text-right text-sm md:text-base line-clamp-2">{product.name}</h4>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs md:text-sm text-gray-600 mr-1">{product.rating}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm md:text-lg font-bold text-blue-600">{product.price} ج.م</span>
                      {product.originalPrice && (
                        <span className="text-xs md:text-sm text-gray-500 line-through mr-2">
                          {product.originalPrice} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                      {product.inStock ? "أضف للسلة" : "غير متوفر"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <h4 className="text-lg font-semibold">مكتبة الأمل</h4>
              </div>
              <p className="text-gray-400 text-sm">وجهتكم المثالية للحصول على أفضل المنتجات التعليمية والثقافية</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">روابط سريعة</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    المنتجات
                  </Link>
                </li>
                <li>
                  <Link href="/forum" className="hover:text-white">
                    المنتدى
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    اتصل بنا
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white">
                    آراء ومقترحات
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">الفئات</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/products?category=أدوات مكتبية" className="hover:text-white">
                    أدوات مكتبية
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=كتب" className="hover:text-white">
                    كتب
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=ألعاب" className="hover:text-white">
                    ألعاب
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">تواصل معنا</h5>
              <div className="text-gray-400 space-y-2 text-sm">
                <p>الهاتف: 01096126768</p>
                <p>البريد: info@hopestore.com</p>
                <p>العنوان: الفيوم - أبشواي، جمهورية مصر العربية</p>

                {/* Social Media Links */}
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://www.facebook.com/groups/2409254692480219/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://wa.me/201096126768"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 مكتبة الأمل. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
