"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ShoppingCart, Star, Search, BookOpen, Heart, Filter, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  getProducts,
  getCart,
  saveCart,
  getCategories,
  type Product,
  type CartItem,
} from "@/lib/store"

// تحديث دالة addToCart لاستخدام Toast
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [categories, setCategories] = useState(getCategories())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [selectedSubcategory, setSelectedSubcategory] = useState("الكل")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("الأحدث")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  // في بداية المكون
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    // Handle category parameter from URL
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }

    const loadData = () => {
      setProducts(getProducts())
      setCart(getCart())
    }

    loadData()

    const handleProductsUpdate = () => setProducts(getProducts())
    const handleCartUpdate = () => setCart(getCart())

    window.addEventListener("productsUpdated", handleProductsUpdate)
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdate)
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [searchParams, isMounted])

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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory
      const matchesSubcategory = selectedSubcategory === "الكل" || product.subcategory === selectedSubcategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStock = !inStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStock
    })

    // Sort products
    switch (sortBy) {
      case "السعر: من الأقل للأعلى":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "السعر: من الأعلى للأقل":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "التقييم":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "الأكثر مبيعاً":
        filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0))
        break
      default:
        // الأحدث
        break
    }

    return filtered
  }, [products, searchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy, inStockOnly])

  const allCategories = ["الكل", ...categories.map((c) => c.name)]
  const subcategories =
    selectedCategory === "الكل"
      ? ["الكل"]
      : ["الكل", ...(categories.find((c) => c.name === selectedCategory)?.subcategories || [])]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">مكتبة الأمل</h1>
            </Link>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث عن المنتجات..."
                  className="pr-10 text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  السلة ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 ml-2" />
                  الفلاتر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">الفئة</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value)
                      setSelectedSubcategory("الكل")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Filter */}
                {selectedCategory !== "الكل" && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">الفئة الفرعية</Label>
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    نطاق السعر: {priceRange[0]} - {priceRange[1]} ج.م
                  </Label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={200} step={5} className="w-full" />
                </div>

                {/* Stock Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
                  <Label htmlFor="inStock" className="text-sm cursor-pointer">
                    المتوفر فقط
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                  الفلاتر
                </Button>
                <span className="text-sm text-gray-600">{filteredProducts.length} منتج</span>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الأحدث">الأحدث</SelectItem>
                    <SelectItem value="السعر: من الأقل للأعلى">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="السعر: من الأعلى للأقل">السعر: من الأعلى للأقل</SelectItem>
                    <SelectItem value="التقييم">التقييم</SelectItem>
                    <SelectItem value="الأكثر مبيعاً">الأكثر مبيعاً</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">لم يتم العثور على منتجات مطابقة</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex flex-row" : ""}`}
                  >
                    <CardHeader className={`p-0 ${viewMode === "list" ? "w-48" : ""}`}>
                      <div className="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className={`object-cover rounded-t-lg ${
                            viewMode === "list" ? "w-48 h-32 rounded-r-lg rounded-t-none" : "w-full h-48"
                          }`}
                        />
                        {product.badge && <Badge className="absolute top-2 right-2 bg-red-500">{product.badge}</Badge>}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                            <span className="text-white font-semibold">غير متوفر</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <div className="text-sm text-gray-500 mb-1">
                        {product.category} {product.subcategory && `- ${product.subcategory}`}
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <h4 className="font-semibold mb-2 text-right hover:text-blue-600 transition-colors">{product.name}</h4>
                      </Link>
                      {viewMode === "list" && (
                        <p className="text-sm text-gray-600 mb-3 text-right">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 mr-1">{product.rating}</span>
                          <span className="text-xs text-gray-500 mr-1">({product.reviews})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">{product.price} ج.م</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">{product.originalPrice} ج.م</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                          disabled={!product.inStock}
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          {product.inStock ? "أضف للسلة" : "غير متوفر"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
