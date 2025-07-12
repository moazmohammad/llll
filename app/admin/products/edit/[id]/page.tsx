"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import { getProducts, saveProducts, getCategories, type Product } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = Number(params.id)
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState(getCategories())
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    stock: "",
    image: "",
    rating: "",
  })

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      const products = getProducts()
      const foundProduct = products.find((p) => p.id === productId)
      if (foundProduct) {
        setProduct(foundProduct)
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description,
          price: foundProduct.price.toString(),
          originalPrice: foundProduct.originalPrice?.toString() || "",
          category: foundProduct.category,
          subcategory: foundProduct.subcategory || "",
          stock: foundProduct.stock.toString(),
          image: foundProduct.image,
          rating: foundProduct.rating.toString(),
        })
        // تحميل الصور الموجودة
        if (foundProduct.images && foundProduct.images.length > 0) {
          setImages(foundProduct.images)
        } else if (foundProduct.image) {
          setImages([foundProduct.image])
        }
      } else {
        toast({
          title: "خطأ",
          description: "المنتج غير موجود",
          variant: "destructive",
        })
        router.push("/admin/products")
      }
    }
  }, [router, productId, toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    const products = getProducts()
    const updatedProducts = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
            category: formData.category,
            subcategory: formData.subcategory || undefined,
            stock: Number.parseInt(formData.stock),
            image: images[0] || formData.image,
            images: images.length > 0 ? images : undefined,
            rating: Number.parseFloat(formData.rating),
            inStock: Number.parseInt(formData.stock) > 0,
          }
        : p,
    )

    saveProducts(updatedProducts)
    toast({
      title: "تم بنجاح ✅",
      description: "تم تحديث المنتج بنجاح",
      variant: "success",
    })
    router.push("/admin/products")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedCategory = categories.find((c) => c.name === formData.category)
  const subcategories = selectedCategory?.subcategories || []

  if (!isAuthenticated || !product) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة
                </Button>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">تعديل المنتج</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>تعديل بيانات المنتج</CardTitle>
            <CardDescription>قم بتحديث تفاصيل المنتج</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>صور المنتج</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          اختر صور المنتج أو اسحبها هنا
                        </span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-2 bg-transparent pointer-events-none"
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById('images')?.click()
                          }}
                        >
                          <Upload className="h-4 w-4 ml-2" />
                          اختر الصور
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            الصورة الرئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      handleChange("category", value)
                      handleChange("subcategory", "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {subcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">الفئة الفرعية</Label>
                    <Select value={formData.subcategory} onValueChange={(value) => handleChange("subcategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة الفرعية" />
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

                <div className="space-y-2">
                  <Label htmlFor="price">السعر (ج.م) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">السعر الأصلي (ج.م)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleChange("originalPrice", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية المتوفرة *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">التقييم</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleChange("rating", e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">رابط الصورة</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  className="text-right"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف المنتج *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="text-right"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/products">
                  <Button variant="outline">إلغاء</Button>
                </Link>
                <Button type="submit">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
