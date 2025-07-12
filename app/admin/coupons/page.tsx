"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { BookOpen, Plus, Edit, Trash2, Search, ArrowLeft, Percent } from "lucide-react"
import Link from "next/link"
import { getCoupons, saveCoupons, getCurrentUser, type Coupon } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function AdminCoupons() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCoupon, setShowAddCoupon] = useState(false)
  const [showEditCoupon, setShowEditCoupon] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    type: "percentage" as "percentage" | "fixed",
    minAmount: "",
    maxUses: "",
    expiryDate: "",
  })
  const currentUser = getCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setCoupons(getCoupons())
    }
  }, [router])

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault()

    const couponExists = coupons.find((c) => c.code === newCoupon.code.toUpperCase())
    if (couponExists) {
      toast({
        title: "خطأ",
        description: "كود الخصم موجود بالفعل",
        variant: "destructive",
      })
      return
    }

    const coupon: Coupon = {
      id: Date.now(),
      code: newCoupon.code.toUpperCase(),
      discount: Number.parseFloat(newCoupon.discount),
      type: newCoupon.type,
      minAmount: newCoupon.minAmount ? Number.parseFloat(newCoupon.minAmount) : undefined,
      maxUses: newCoupon.maxUses ? Number.parseInt(newCoupon.maxUses) : undefined,
      usedCount: 0,
      expiryDate: newCoupon.expiryDate,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    const updatedCoupons = [...coupons, coupon]
    setCoupons(updatedCoupons)
    saveCoupons(updatedCoupons)

    setNewCoupon({
      code: "",
      discount: "",
      type: "percentage",
      minAmount: "",
      maxUses: "",
      expiryDate: "",
    })
    setShowAddCoupon(false)

    toast({
      title: "تم بنجاح ✅",
      description: "تم إضافة كود الخصم بنجاح",
      variant: "success",
    })
  }

  const handleEditCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return

    const updatedCoupons = coupons.map((coupon) => (coupon.id === editingCoupon.id ? { ...editingCoupon } : coupon))

    setCoupons(updatedCoupons)
    saveCoupons(updatedCoupons)
    setShowEditCoupon(false)
    setEditingCoupon(null)

    toast({
      title: "تم التحديث ✅",
      description: "تم تحديث كود الخصم بنجاح",
      variant: "success",
    })
  }

  const handleDeleteCoupon = (couponId: number) => {
    if (confirm("هل أنت متأكد من حذف كود الخصم؟")) {
      const updatedCoupons = coupons.filter((coupon) => coupon.id !== couponId)
      setCoupons(updatedCoupons)
      saveCoupons(updatedCoupons)

      toast({
        title: "تم الحذف ✅",
        description: "تم حذف كود الخصم بنجاح",
        variant: "success",
      })
    }
  }

  const toggleCouponStatus = (couponId: number) => {
    const updatedCoupons = coupons.map((coupon) =>
      coupon.id === couponId ? { ...coupon, isActive: !coupon.isActive } : coupon,
    )
    setCoupons(updatedCoupons)
    saveCoupons(updatedCoupons)

    toast({
      title: "تم التحديث ✅",
      description: "تم تحديث حالة كود الخصم",
      variant: "success",
    })
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon({ ...coupon })
    setShowEditCoupon(true)
  }

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))

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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة أكواد الخصم</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في أكواد الخصم..."
                className="pr-10 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-600">{filteredCoupons.length} كود خصم</span>
          </div>
          <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 ml-2" />
                إضافة كود خصم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>إضافة كود خصم جديد</DialogTitle>
                <DialogDescription>أدخل بيانات كود الخصم الجديد</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-code">كود الخصم *</Label>
                  <Input
                    id="add-code"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="text-right"
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-discount">قيمة الخصم *</Label>
                    <Input
                      id="add-discount"
                      type="number"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-type">نوع الخصم *</Label>
                    <Select
                      value={newCoupon.type}
                      onValueChange={(value: any) => setNewCoupon({ ...newCoupon, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت (ج.م)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-minAmount">الحد الأدنى للطلب</Label>
                    <Input
                      id="add-minAmount"
                      type="number"
                      value={newCoupon.minAmount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: e.target.value })}
                      className="text-right"
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-maxUses">عدد مرات الاستخدام</Label>
                    <Input
                      id="add-maxUses"
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                      className="text-right"
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-expiry">تاريخ الانتهاء *</Label>
                  <Input
                    id="add-expiry"
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddCoupon(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">إضافة كود الخصم</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Coupon Dialog */}
        <Dialog open={showEditCoupon} onOpenChange={setShowEditCoupon}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>تعديل كود الخصم</DialogTitle>
              <DialogDescription>تحديث بيانات كود الخصم</DialogDescription>
            </DialogHeader>
            {editingCoupon && (
              <form onSubmit={handleEditCoupon} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">كود الخصم *</Label>
                  <Input
                    id="edit-code"
                    value={editingCoupon.code}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-discount">قيمة الخصم *</Label>
                    <Input
                      id="edit-discount"
                      type="number"
                      value={editingCoupon.discount}
                      onChange={(e) =>
                        setEditingCoupon({ ...editingCoupon, discount: Number.parseFloat(e.target.value) })
                      }
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">نوع الخصم *</Label>
                    <Select
                      value={editingCoupon.type}
                      onValueChange={(value: any) => setEditingCoupon({ ...editingCoupon, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت (ج.م)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expiry">تاريخ الانتهاء *</Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={editingCoupon.expiryDate}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditCoupon(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">حفظ التغييرات</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="h-5 w-5 ml-2" />
              قائمة أكواد الخصم
            </CardTitle>
            <CardDescription>إدارة جميع أكواد الخصم في المتجر</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الخصم</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">الاستخدام</TableHead>
                  <TableHead className="text-right hidden md:table-cell">الانتهاء</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discount} {coupon.type === "percentage" ? "%" : "ج.م"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {coupon.usedCount} / {coupon.maxUses || "∞"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(coupon.expiryDate).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleCouponStatus(coupon.id)}
                      >
                        {coupon.isActive ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(coupon)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
