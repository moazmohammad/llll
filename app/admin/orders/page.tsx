"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Search, ArrowLeft, Eye, Edit, Phone } from "lucide-react"
import Link from "next/link"
import { getOrders, saveOrders, type Order } from "@/lib/store"

export default function AdminOrders() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("الكل")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      setOrders(getOrders())
    }
  }, [router])

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
    alert("تم تحديث حالة الطلب بنجاح!")
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "الكل" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return <div>جاري التحميل...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الطلبات..."
                className="pr-10 w-64 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">جميع الحالات</SelectItem>
                <SelectItem value="جديد">جديد</SelectItem>
                <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                <SelectItem value="مشحون">مشحون</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">{filteredOrders.length} طلب</span>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>إدارة جميع طلبات العملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 ml-1" />
                          {order.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.total} ج.م</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="جديد">جديد</SelectItem>
                          <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                          <SelectItem value="مشحون">مشحون</SelectItem>
                          <SelectItem value="مكتمل">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل الطلب {order.id}</DialogTitle>
                              <DialogDescription>معلومات مفصلة عن الطلب والعميل</DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">معلومات العميل</h4>
                                    <p>
                                      <strong>الاسم:</strong> {selectedOrder.customer}
                                    </p>
                                    <p>
                                      <strong>الهاتف:</strong> {selectedOrder.phone}
                                    </p>
                                    <p>
                                      <strong>العنوان:</strong> {selectedOrder.address}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">معلومات الطلب</h4>
                                    <p>
                                      <strong>التاريخ:</strong> {selectedOrder.date}
                                    </p>
                                    <p>
                                      <strong>الحالة:</strong> {selectedOrder.status}
                                    </p>
                                    <p>
                                      <strong>طريقة الدفع:</strong> {selectedOrder.paymentMethod}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">المنتجات</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                      >
                                        <span>{item.name}</span>
                                        <span>الكمية: {item.quantity}</span>
                                        <span>{item.price * item.quantity} ج.م</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 p-2 bg-blue-50 rounded">
                                    <strong>المجموع الكلي: {selectedOrder.total} ج.م</strong>
                                  </div>
                                </div>
                                {selectedOrder.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">ملاحظات</h4>
                                    <p className="text-gray-600">{selectedOrder.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
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
