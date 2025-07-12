"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Edit, Menu, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchMenus, saveMenu, deleteMenu, MenuItem } from "@/lib/menu-api-firebase"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function MenusManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    parentId: "",
    order: "1",
    isActive: true,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        loadMenus()
      } else {
        router.push("/admin")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const loadMenus = async () => {
    try {
      const savedMenus = await fetchMenus()
      setMenus(savedMenus)
    } catch (error) {
      console.error("Error loading menus:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل القوائم",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const menuData = {
        name: formData.name,
        url: formData.url,
        parentId: formData.parentId || undefined,
        order: Number(formData.order),
        isActive: formData.isActive,
        ...(editingMenu && { id: editingMenu.id })
      }

      const result = await saveMenu(menuData)
      
      if (result) {
        toast({
          title: "تم بنجاح ✅",
          description: editingMenu ? "تم تحديث القائمة بنجاح" : "تم إضافة القائمة بنجاح",
          variant: "default",
        })
        
        await loadMenus()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error("Failed to save menu")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ القائمة",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      url: menu.url,
      parentId: menu.parentId || "",
      order: menu.order.toString(),
      isActive: menu.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (menuId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه القائمة؟")) {
      try {
        const success = await deleteMenu(menuId)
        
        if (success) {
          toast({
            title: "تم بنجاح ✅",
            description: "تم حذف القائمة بنجاح",
            variant: "default",
          })
          await loadMenus()
        } else {
          throw new Error("Failed to delete menu")
        }
      } catch (error) {
        console.error("Error deleting menu:", error)
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف القائمة",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      parentId: "",
      order: "1",
      isActive: true,
    })
    setEditingMenu(null)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const mainMenus = menus.filter(menu => !menu.parentId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard")}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة
              </Button>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة القوائم</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قائمة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingMenu ? "تعديل القائمة" : "إضافة قائمة جديدة"}</DialogTitle>
                  <DialogDescription>
                    {editingMenu ? "قم بتحديث بيانات القائمة" : "أدخل بيانات القائمة الجديدة"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم القائمة *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">الرابط *</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => handleChange("url", e.target.value)}
                      className="text-right"
                      placeholder="/products"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentId">القائمة الرئيسية</Label>
                    <Select value={formData.parentId || ""} onValueChange={(value) => handleChange("parentId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القائمة الرئيسية (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">لا يوجد (قائمة رئيسية)</SelectItem>
                        {mainMenus.map((menu) => (
                          <SelectItem key={menu.id} value={menu.id}>
                            {menu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">ترتيب العرض *</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleChange("order", e.target.value)}
                      className="text-right"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">نشط</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingMenu ? "تحديث" : "إضافة"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
              قائمة القوائم
            </CardTitle>
            <CardDescription>
              إدارة القوائم الرئيسية والفرعية للموقع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم القائمة</TableHead>
                    <TableHead className="text-right">الرابط</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium text-right">
                        {menu.parentId && "← "}{menu.name}
                      </TableCell>
                      <TableCell className="text-right">{menu.url}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={menu.parentId ? "secondary" : "default"}>
                          {menu.parentId ? "قائمة فرعية" : "قائمة رئيسية"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{menu.order}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={menu.isActive ? "default" : "secondary"}>
                          {menu.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(menu)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(menu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

