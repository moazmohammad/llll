"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Plus, ArrowLeft, Trash2, FolderPlus } from "lucide-react"
import Link from "next/link"
import { getCategories, saveCategories, getCurrentUser, type Category } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function AdminCategories() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newSubcategory, setNewSubcategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const currentUser = getCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setCategories(getCategories())
    }
  }, [router])

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    const categoryExists = categories.find((cat) => cat.name === newCategory.trim())
    if (categoryExists) {
      toast({
        title: "خطأ",
        description: "هذه الفئة موجودة بالفعل",
        variant: "destructive",
      })
      return
    }

    const newCat: Category = {
      id: Date.now(),
      name: newCategory.trim(),
      subcategories: [],
    }

    const updatedCategories = [...categories, newCat]
    setCategories(updatedCategories)
    saveCategories(updatedCategories)
    setNewCategory("")
    setShowAddCategory(false)

    toast({
      title: "تم بنجاح ✅",
      description: "تم إضافة الفئة الرئيسية بنجاح",
      variant: "success",
    })
  }

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !newSubcategory.trim()) return

    const category = categories.find((cat) => cat.name === selectedCategory)
    if (category?.subcategories.includes(newSubcategory.trim())) {
      toast({
        title: "خطأ",
        description: "هذه الفئة الفرعية موجودة بالفعل",
        variant: "destructive",
      })
      return
    }

    const updatedCategories = categories.map((cat) =>
      cat.name === selectedCategory ? { ...cat, subcategories: [...cat.subcategories, newSubcategory.trim()] } : cat,
    )

    setCategories(updatedCategories)
    saveCategories(updatedCategories)
    setNewSubcategory("")
    setShowAddSubcategory(false)

    toast({
      title: "تم بنجاح ✅",
      description: "تم إضافة الفئة الفرعية بنجاح",
      variant: "success",
    })
  }

  const handleDeleteSubcategory = (categoryName: string, subcategory: string) => {
    if (confirm(`هل أنت متأكد من حذف "${subcategory}"؟`)) {
      const updatedCategories = categories.map((cat) =>
        cat.name === categoryName
          ? { ...cat, subcategories: cat.subcategories.filter((sub) => sub !== subcategory) }
          : cat,
      )

      setCategories(updatedCategories)
      saveCategories(updatedCategories)

      toast({
        title: "تم الحذف ✅",
        description: "تم حذف الفئة الفرعية بنجاح",
        variant: "success",
      })
    }
  }

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة وجميع فئاتها الفرعية؟")) {
      const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
      setCategories(updatedCategories)
      saveCategories(updatedCategories)

      toast({
        title: "تم الحذف ✅",
        description: "تم حذف الفئة بنجاح",
        variant: "success",
      })
    }
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الفئات</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Add Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-6">
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <FolderPlus className="h-4 w-4 ml-2" />
                إضافة فئة رئيسية
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>إضافة فئة رئيسية جديدة</DialogTitle>
                <DialogDescription>أدخل اسم الفئة الرئيسية الجديدة</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">اسم الفئة الرئيسية</Label>
                  <Input
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="text-right"
                    placeholder="مثال: إلكترونيات"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">إضافة الفئة</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddSubcategory} onOpenChange={setShowAddSubcategory}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 ml-2" />
                إضافة فئة فرعية
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>إضافة فئة فرعية جديدة</DialogTitle>
                <DialogDescription>اختر الفئة الرئيسية وأدخل اسم الفئة الفرعية</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة الرئيسية</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة الرئيسية" />
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
                <div className="space-y-2">
                  <Label htmlFor="subcategory">اسم الفئة الفرعية</Label>
                  <Input
                    id="subcategory"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    className="text-right"
                    placeholder="مثال: مشغولات يدوية"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddSubcategory(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">إضافة الفئة الفرعية</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories List */}
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.subcategories.length} فئة فرعية</CardDescription>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.subcategories.map((subcategory, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium text-sm">{subcategory}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubcategory(category.name, subcategory)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {category.subcategories.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-4">لا توجد فئات فرعية</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
