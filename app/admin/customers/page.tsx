"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, ArrowLeft, Download, Users, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { getOrders, getCurrentUser } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  name: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

export default function AdminCustomers() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const currentUser = getCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn")
    if (!loggedIn || !currentUser) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      loadCustomers()
    }
  }, [router])

  const loadCustomers = () => {
    const orders = getOrders()
    const customerMap = new Map<string, Customer>()

    orders.forEach((order) => {
      const key = `${order.customer}-${order.phone}`
      if (customerMap.has(key)) {
        const customer = customerMap.get(key)!
        customer.totalOrders += 1
        customer.totalSpent += order.total
        if (new Date(order.date) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.date
        }
      } else {
        customerMap.set(key, {
          name: order.customer,
          phone: order.phone,
          address: order.address,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.date,
        })
      }
    })

    setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent))
  }

  const exportCustomers = () => {
    const csvContent = [
      ["الاسم", "الهاتف", "العنوان", "عدد الطلبات", "إجمالي الإنفاق", "آخر طلب"].join(","),
      ...customers.map((customer) =>
        [
          customer.name,
          customer.phone,
          customer.address.replace(/,/g, " -"),
          customer.totalOrders,
          customer.totalSpent,
          customer.lastOrderDate,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `customers-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "تم التصدير ✅",
      description: "تم تصدير قائمة العملاء بنجاح",
      variant: "success",
    })
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">قائمة العملاء</h1>
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
                placeholder="البحث في العملاء..."
                className="pr-10 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-600">{filteredCustomers.length} عميل</span>
          </div>
          <Button onClick={exportCustomers} className="w-full sm:w-auto">
            <Download className="h-4 w-4 ml-2" />
            تصدير القائمة
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الإنفاق</CardTitle>
              <Phone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length > 0
                  ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
                  : 0}{" "}
                ج.م
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.totalOrders, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 ml-2" />
              قائمة العملاء
            </CardTitle>
            <CardDescription>جميع العملاء الذين قاموا بطلبات</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right hidden md:table-cell">العنوان</TableHead>
                  <TableHead className="text-right">عدد الطلبات</TableHead>
                  <TableHead className="text-right">إجمالي الإنفاق</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">آخر طلب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                        {customer.phone}
                      </a>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate" title={customer.address}>
                      {customer.address}
                    </TableCell>
                    <TableCell className="text-center">{customer.totalOrders}</TableCell>
                    <TableCell className="font-medium text-green-600">{Math.round(customer.totalSpent)} ج.م</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(customer.lastOrderDate).toLocaleDateString("ar-EG")}
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
