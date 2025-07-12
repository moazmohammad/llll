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
import { BookOpen, Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getUsers, saveUsers, getCurrentUser, type User } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsers() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "employee" as "admin" | "manager" | "employee",
    permissions: [] as string[],
  })
  const currentUser = getCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setUsers(getUsers())
    }
  }, [router])

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()

    const userExists = users.find((u) => u.username === newUser.username)
    if (userExists) {
      toast({
        title: "خطأ",
        description: "اسم المستخدم موجود بالفعل",
        variant: "destructive",
      })
      return
    }

    const user: User = {
      id: Date.now(),
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, user]
    setUsers(updatedUsers)
    saveUsers(updatedUsers)

    setNewUser({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "employee",
      permissions: [],
    })
    setShowAddUser(false)

    toast({
      title: "تم بنجاح ✅",
      description: "تم إضافة المستخدم بنجاح",
      variant: "success",
    })
  }

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const updatedUsers = users.map((user) => (user.id === editingUser.id ? { ...editingUser } : user))

    setUsers(updatedUsers)
    saveUsers(updatedUsers)
    setShowEditUser(false)
    setEditingUser(null)

    toast({
      title: "تم التحديث ✅",
      description: "تم تحديث بيانات المستخدم بنجاح",
      variant: "success",
    })
  }

  const handleDeleteUser = (userId: number) => {
    if (userId === currentUser?.id) {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف حسابك الحالي",
        variant: "destructive",
      })
      return
    }

    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
      setUsers(updatedUsers)
      saveUsers(updatedUsers)

      toast({
        title: "تم الحذف ✅",
        description: "تم حذف المستخدم بنجاح",
        variant: "success",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user })
    setShowEditUser(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    employee: "bg-green-100 text-green-800",
  }

  const roleNames = {
    admin: "مدير عام",
    manager: "مدير",
    employee: "موظف",
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
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
                placeholder="البحث في المستخدمين..."
                className="pr-10 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-600">{filteredUsers.length} مستخدم</span>
          </div>
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>أدخل بيانات المستخدم الجديد</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">الاسم الكامل *</Label>
                  <Input
                    id="add-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-username">اسم المستخدم *</Label>
                  <Input
                    id="add-username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">كلمة المرور *</Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">البريد الإلكتروني *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-role">الدور *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="admin">مدير عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">إضافة المستخدم</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>تعديل المستخدم</DialogTitle>
              <DialogDescription>تحديث بيانات المستخدم</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">الاسم الكامل *</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">اسم المستخدم *</Label>
                  <Input
                    id="edit-username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">الدور *</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="admin">مدير عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditUser(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">حفظ التغييرات</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
            <CardDescription>إدارة جميع مستخدمي النظام</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">اسم المستخدم</TableHead>
                  <TableHead className="text-right hidden md:table-cell">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.username}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>{roleNames[user.role]}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
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
