// مخزن البيانات المحلي - محدث ليستخدم API مركزي
import { 
  databaseAPI, 
  getProducts as apiGetProducts,
  saveProducts as apiSaveProducts,
  getOrders as apiGetOrders,
  saveOrders as apiSaveOrders,
  getCategories as apiGetCategories,
  saveCategories as apiSaveCategories,
  getCoupons as apiGetCoupons,
  saveCoupons as apiSaveCoupons,
  getMenus as apiGetMenus,
  saveMenus as apiSaveMenus,
  setupRealTimeUpdates
} from './api'

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[] // إضافة دعم للصور المتعددة
  rating: number
  category: string
  subcategory?: string
  badge?: string
  description: string
  inStock: boolean
  reviews: number
  stock: number
  sales: number
}

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  customer: string
  phone: string
  address: string
  items: CartItem[]
  subtotal?: number
  shipping?: number
  discount?: number
  total: number
  paymentMethod: string
  status: string
  date: string
  notes?: string
  coupon?: string
}

export interface User {
  id: number
  username: string
  password: string
  name: string
  email: string
  role: "admin" | "manager" | "employee"
  permissions: string[]
  createdAt: string
}

export interface Category {
  id: number
  name: string
  subcategories: string[]
}

export interface ForumPost {
  id: number
  title: string
  content: string
  author: string
  category: string
  createdAt: string
  replies: ForumReply[]
  views: number
}

export interface ForumReply {
  id: number
  content: string
  author: string
  createdAt: string
}

// إضافة واجهات جديدة للكوبونات والإشعارات
export interface Coupon {
  id: number
  code: string
  discount: number
  type: "percentage" | "fixed"
  minAmount?: number
  maxUses?: number
  usedCount: number
  expiryDate: string
  isActive: boolean
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: string
}

// متغيرات للتخزين المؤقت المحلي (للأداء)
let cachedProducts: Product[] | null = null
let cachedOrders: Order[] | null = null
let cachedCategories: Category[] | null = null
let cachedCoupons: Coupon[] | null = null
let cachedMenus: any[] | null = null

// تهيئة النظام
let isInitialized = false

export function initializeSync() {
  if (isInitialized) return
  isInitialized = true
  
  // إعداد التحديثات الفورية
  setupRealTimeUpdates()
  
  // الاستماع لأحداث التحديث
  if (typeof window !== 'undefined') {
    window.addEventListener('dataUpdated', () => {
      // مسح الكاش المحلي عند التحديث
      cachedProducts = null
      cachedOrders = null
      cachedCategories = null
      cachedCoupons = null
      cachedMenus = null
      
      // إرسال أحداث للمكونات
      window.dispatchEvent(new CustomEvent('productsUpdated'))
      window.dispatchEvent(new CustomEvent('ordersUpdated'))
      window.dispatchEvent(new CustomEvent('categoriesUpdated'))
    })
  }
}

// دوال المنتجات
export function getProducts(): Product[] {
  if (cachedProducts) return cachedProducts
  
  if (typeof window === "undefined") return []
  
  // استخدام البيانات المحلية كبديل مؤقت
  const localProducts = typeof window !== "undefined" ? localStorage.getItem("products") : null
  if (localProducts) {
    cachedProducts = JSON.parse(localProducts)
    return cachedProducts
  }
  
  // إرجاع مصفوفة فارغة إذا لم توجد بيانات
  return []
}

export async function getProductsAsync(): Promise<Product[]> {
  try {
    const products = await apiGetProducts()
    cachedProducts = products
    // حفظ نسخة محلية للأداء
    if (typeof window !== "undefined") {
      localStorage.setItem("products", JSON.stringify(products))
    }
    return products
  } catch (error) {
    console.error('Failed to get products:', error)
    return getProducts() // استخدام البيانات المحلية كبديل
  }
}

export function saveProducts(products: Product[]): void {
  cachedProducts = products
  if (typeof window !== "undefined") {
    localStorage.setItem("products", JSON.stringify(products))
  }
  
  // حفظ في قاعدة البيانات المركزية
  apiSaveProducts(products).catch(error => {
    console.error("Failed to save products to API:", error)
  })
}

// دوال الطلبات
export function getOrders(): Order[] {
  if (cachedOrders) return cachedOrders
  
  if (typeof window === "undefined") return []
  
  const localOrders = typeof window !== "undefined" ? localStorage.getItem("orders") : null
  if (localOrders) {
    cachedOrders = JSON.parse(localOrders)
    return cachedOrders
  }
  
  return []
}

export async function getOrdersAsync(): Promise<Order[]> {
  try {
    const orders = await apiGetOrders()
    cachedOrders = orders
    if (typeof window !== "undefined") {
      localStorage.setItem("orders", JSON.stringify(orders))
    }
    return orders
  } catch (error) {
    console.error('Failed to get orders:', error)
    return getOrders()
  }
}

export function saveOrders(orders: Order[]): void {
  cachedOrders = orders
  if (typeof window !== "undefined") {
    localStorage.setItem("orders", JSON.stringify(orders))
  }
  
  apiSaveOrders(orders).catch(error => {
    console.error('Failed to save orders to API:', error)
  })
}

// دوال الفئات
export function getCategories(): Category[] {
  if (cachedCategories) return cachedCategories
  
  if (typeof window === "undefined") {
    // فئات افتراضية للخادم
    const defaultCategories: Category[] = [
      {
        id: 1,
        name: "كتب",
        subcategories: ["كتب تعليمية", "كتب أدبية", "كتب علمية", "كتب دينية"]
      },
      {
        id: 2,
        name: "ألعاب",
        subcategories: ["ألعاب تعليمية", "ألعاب إلكترونية", "ألعاب رياضية"]
      },
      {
        id: 3,
        name: "أدوات مكتبية",
        subcategories: ["أقلام", "دفاتر", "مساطر", "أدوات هندسية"]
      }
    ]
    cachedCategories = defaultCategories
    return defaultCategories
  }
  
  const localCategories = typeof window !== "undefined" ? localStorage.getItem("categories") : null
  if (localCategories) {
    cachedCategories = JSON.parse(localCategories)
    return cachedCategories
  }
  
  // فئات افتراضية
  const defaultCategories: Category[] = [
    {
      id: 1,
      name: "كتب",
      subcategories: ["كتب تعليمية", "كتب أدبية", "كتب علمية", "كتب دينية"]
    },
    {
      id: 2,
      name: "ألعاب",
      subcategories: ["ألعاب تعليمية", "ألعاب إلكترونية", "ألعاب رياضية"]
    },
    {
      id: 3,
      name: "أدوات مكتبية",
      subcategories: ["أقلام", "دفاتر", "مساطر", "أدوات هندسية"]
    }
  ]
  
  cachedCategories = defaultCategories
  return defaultCategories
}

export async function getCategoriesAsync(): Promise<Category[]> {
  try {
    const categories = await apiGetCategories()
    cachedCategories = categories
    if (typeof window !== "undefined") {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
    return categories
  } catch (error) {
    console.error('Failed to get categories:', error)
    return getCategories()
  }
}

export function saveCategories(categories: Category[]): void {
  cachedCategories = categories
  if (typeof window !== "undefined") {
    localStorage.setItem("categories", JSON.stringify(categories))
  }
  
  apiSaveCategories(categories).catch(error => {
    console.error('Failed to save categories to API:', error)
  })
}

// دوال السلة
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : []
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("cart", JSON.stringify(cart))
}


// دوال المستخدم الحالي
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

// دوال المستخدمين
export function getUsers(): User[] {
  if (typeof window === "undefined") {
    // مستخدمين افتراضيين للخادم
    return [
      {
        id: 1,
        username: "admin",
        password: "admin123",
        name: "المدير العام",
        email: "admin@maktabat-alamal.com",
        role: "admin",
        permissions: ["all"],
        createdAt: new Date().toISOString(),
      }
    ]
  }
  
  const users = localStorage.getItem("users")
  if (users) {
    return JSON.parse(users)
  }
  
  // مستخدمين افتراضيين
  const defaultUsers: User[] = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      name: "المدير العام",
      email: "admin@maktabat-alamal.com",
      role: "admin",
      permissions: ["all"],
      createdAt: new Date().toISOString(),
    }
  ]
  
  localStorage.setItem("users", JSON.stringify(defaultUsers))
  return defaultUsers
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("users", JSON.stringify(users))
}

// دوال الكوبونات
export function getCoupons(): Coupon[] {
  if (cachedCoupons) return cachedCoupons
  
  if (typeof window === "undefined") return []
  
  const localCoupons = typeof window !== "undefined" ? localStorage.getItem("coupons") : null
  if (localCoupons) {
    cachedCoupons = JSON.parse(localCoupons)
    return cachedCoupons
  }
  
  return []
}

export async function getCouponsAsync(): Promise<Coupon[]> {
  try {
    const coupons = await apiGetCoupons()
    cachedCoupons = coupons
    if (typeof window !== "undefined") {
      localStorage.setItem("coupons", JSON.stringify(coupons))
    }
    return coupons
  } catch (error) {
    console.error('Failed to get coupons:', error)
    return getCoupons()
  }
}

export function saveCoupons(coupons: Coupon[]): void {
  cachedCoupons = coupons
  if (typeof window !== "undefined") {
    localStorage.setItem("coupons", JSON.stringify(coupons))
  }
  
  apiSaveCoupons(coupons).catch(error => {
    console.error('Failed to save coupons to API:', error)
  })
}

// دوال الإشعارات
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  const notifications = localStorage.getItem("notifications")
  return notifications ? JSON.parse(notifications) : []
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("notifications", JSON.stringify(notifications))
}

// دوال القوائم
export function getMenus(): any[] {
  if (cachedMenus) return cachedMenus
  
  if (typeof window === "undefined") {
    // قوائم افتراضية للخادم
    const defaultMenus = [
      { id: 1, name: "الرئيسية", url: "/", order: 1, isActive: true },
      { id: 2, name: "المنتجات", url: "/products", order: 2, isActive: true },
      { id: 3, name: "الكتب", url: "/products?category=كتب", parentId: 2, order: 1, isActive: true },
      { id: 4, name: "الألعاب", url: "/products?category=ألعاب", parentId: 2, order: 2, isActive: true },
      { id: 5, name: "أدوات مكتبية", url: "/products?category=أدوات مكتبية", parentId: 2, order: 3, isActive: true },
      { id: 6, name: "اتصل بنا", url: "/contact", order: 3, isActive: true },
      { id: 7, name: "المنتدى", url: "/forum", order: 4, isActive: true }
    ]
    cachedMenus = defaultMenus
    return defaultMenus
  }
  
  const localMenus = typeof window !== "undefined" ? localStorage.getItem("menus") : null
  if (localMenus) {
    cachedMenus = JSON.parse(localMenus)
    return cachedMenus
  }
  
  // قوائم افتراضية
  const defaultMenus = [
    { id: 1, name: "الرئيسية", url: "/", order: 1, isActive: true },
    { id: 2, name: "المنتجات", url: "/products", order: 2, isActive: true },
    { id: 3, name: "الكتب", url: "/products?category=كتب", parentId: 2, order: 1, isActive: true },
    { id: 4, name: "الألعاب", url: "/products?category=ألعاب", parentId: 2, order: 2, isActive: true },
    { id: 5, name: "أدوات مكتبية", url: "/products?category=أدوات مكتبية", parentId: 2, order: 3, isActive: true },
    { id: 6, name: "اتصل بنا", url: "/contact", order: 3, isActive: true },
    { id: 7, name: "المنتدى", url: "/forum", order: 4, isActive: true }
  ]
  
  cachedMenus = defaultMenus
  return defaultMenus
}
export async function getMenusAsync(): Promise<any[]> {
  try {
    const menus = await apiGetMenus()
    cachedMenus = menus
    if (typeof window !== "undefined") {
      localStorage.setItem("menus", JSON.stringify(menus))
    }
    return menus
  } catch (error) {
    console.error('Failed to get menus:', error)
    return getMenus()
  }
}

export function saveMenus(menus: any[]): void {
  cachedMenus = menus
  if (typeof window !== "undefined") {
    localStorage.setItem("menus", JSON.stringify(menus))
  }
  
  apiSaveMenus(menus).catch(error => {
    console.error("Failed to save menus to API:", error)
  })
}

// دوال منتدى النقاش
export function getForumPosts(): ForumPost[] {
  if (typeof window === "undefined") return []
  const posts = localStorage.getItem("forumPosts")
  return posts ? JSON.parse(posts) : []
}

export function saveForumPosts(posts: ForumPost[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("forumPosts", JSON.stringify(posts))
}

// دالة لتحديث البيانات من الخادم
export async function syncWithServer(): Promise<void> {
  try {
    // تحديث جميع البيانات من الخادم
    await Promise.all([
      getProductsAsync(),
      getOrdersAsync(),
      getCategoriesAsync(),
      getCouponsAsync(),
      getMenusAsync()
    ])
    
    console.log('Data synced with server successfully')
  } catch (error) {
    console.error('Failed to sync with server:', error)
  }
}

