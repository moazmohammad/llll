// نظام API مركزي للبيانات
import { Product, CartItem, Order, User, Category, ForumPost, Coupon, Notification } from './store'

// إعدادات JSONBin.io
const API_BASE_URL = 'https://api.jsonbin.io/v3'
const BIN_ID = '676b8e4ead19ca34f8c8f8a0' // معرف المخزن
const API_KEY = '$2a$10$8vQzKjGxLHqY.8Qz5Qz5QuKjGxLHqY.8Qz5Qz5QuKjGxLHqY.8Qz5Q' // مفتاح API

interface DatabaseSchema {
  products: Product[]
  orders: Order[]
  users: User[]
  categories: Category[]
  forumPosts: ForumPost[]
  coupons: Coupon[]
  notifications: Notification[]
  menus: any[]
  lastUpdated: string
}

// البيانات الافتراضية
const defaultData: DatabaseSchema = {
  products: [
    {
      id: 1,
      name: "كتاب الرياضيات المتقدمة",
      price: 120,
      originalPrice: 150,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
      rating: 4.5,
      category: "كتب",
      subcategory: "كتب تعليمية",
      badge: "الأكثر مبيعاً",
      description: "كتاب شامل في الرياضيات المتقدمة يغطي جميع المواضيع الأساسية",
      inStock: true,
      reviews: 45,
      stock: 25,
      sales: 120
    },
    {
      id: 2,
      name: "لعبة الذكاء التعليمية",
      price: 85,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      rating: 4.8,
      category: "ألعاب",
      subcategory: "ألعاب تعليمية",
      description: "لعبة تعليمية تنمي مهارات التفكير والذكاء",
      inStock: true,
      reviews: 32,
      stock: 15,
      sales: 85
    },
    {
      id: 3,
      name: "مجموعة أقلام ملونة",
      price: 45,
      originalPrice: 60,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      rating: 4.3,
      category: "أدوات مكتبية",
      subcategory: "أقلام",
      description: "مجموعة أقلام ملونة عالية الجودة للرسم والكتابة",
      inStock: true,
      reviews: 28,
      stock: 40,
      sales: 95
    }
  ],
  orders: [],
  users: [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      name: "المدير العام",
      email: "admin@maktabat-alamal.com",
      role: "admin",
      permissions: ["all"],
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
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
  ],
  forumPosts: [],
  coupons: [
    {
      id: 1,
      code: "WELCOME10",
      discount: 10,
      type: "percentage",
      minAmount: 100,
      maxUses: 100,
      usedCount: 0,
      expiryDate: "2024-12-31",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  notifications: [],
  menus: [
    { id: 1, name: "الرئيسية", url: "/", order: 1, isActive: true },
    { id: 2, name: "المنتجات", url: "/products", order: 2, isActive: true },
    { id: 3, name: "الكتب", url: "/products?category=كتب", parentId: 2, order: 1, isActive: true },
    { id: 4, name: "الألعاب", url: "/products?category=ألعاب", parentId: 2, order: 2, isActive: true },
    { id: 5, name: "أدوات مكتبية", url: "/products?category=أدوات مكتبية", parentId: 2, order: 3, isActive: true },
    { id: 6, name: "اتصل بنا", url: "/contact", order: 3, isActive: true },
    { id: 7, name: "المنتدى", url: "/forum", order: 4, isActive: true }
  ],
  lastUpdated: new Date().toISOString()
}

class DatabaseAPI {
  private cache: DatabaseSchema | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 30000 // 30 ثانية

  private async makeRequest(method: string, endpoint: string, data?: any) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY
    }

    const options: RequestInit = {
      method,
      headers,
      cache: 'no-store' // منع التخزين المؤقت
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      // في حالة فشل الطلب، استخدم البيانات المحلية كبديل
      return this.getFallbackData()
    }
  }

  private getFallbackData(): DatabaseSchema {
    try {
      const localData = localStorage.getItem('fallback_data')
      if (localData) {
        return JSON.parse(localData)
      }
    } catch (error) {
      console.error('Failed to get fallback data:', error)
    }
    return defaultData
  }

  private saveFallbackData(data: DatabaseSchema) {
    try {
      localStorage.setItem('fallback_data', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save fallback data:', error)
    }
  }

  async getData(): Promise<DatabaseSchema> {
    // التحقق من الكاش
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache
    }

    try {
      const response = await this.makeRequest('GET', `/b/${BIN_ID}/latest`)
      const data = response.record || defaultData
      
      // تحديث الكاش
      this.cache = data
      this.cacheExpiry = Date.now() + this.CACHE_DURATION
      
      // حفظ نسخة احتياطية محلية
      this.saveFallbackData(data)
      
      return data
    } catch (error) {
      console.error('Failed to get data:', error)
      return this.getFallbackData()
    }
  }

  async updateData(data: DatabaseSchema): Promise<boolean> {
    try {
      data.lastUpdated = new Date().toISOString()
      
      const response = await this.makeRequest('PUT', `/b/${BIN_ID}`, data)
      
      if (response) {
        // تحديث الكاش
        this.cache = data
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
        
        // حفظ نسخة احتياطية محلية
        this.saveFallbackData(data)
        
        // إرسال حدث للتحديث الفوري
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dataUpdated', { detail: data }))
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update data:', error)
      return false
    }
  }

  // إنشاء قاعدة البيانات الأولية
  async initializeDatabase(): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', '/b', defaultData)
      console.log('Database initialized:', response)
      return true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      return false
    }
  }

  // مسح الكاش
  clearCache() {
    this.cache = null
    this.cacheExpiry = 0
  }
}

// إنشاء مثيل واحد من API
export const databaseAPI = new DatabaseAPI()

// دوال مساعدة للوصول السريع للبيانات
export async function getProducts(): Promise<Product[]> {
  const data = await databaseAPI.getData()
  return data.products || []
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  const data = await databaseAPI.getData()
  data.products = products
  return await databaseAPI.updateData(data)
}

export async function getOrders(): Promise<Order[]> {
  const data = await databaseAPI.getData()
  return data.orders || []
}

export async function saveOrders(orders: Order[]): Promise<boolean> {
  const data = await databaseAPI.getData()
  data.orders = orders
  return await databaseAPI.updateData(data)
}

export async function getCategories(): Promise<Category[]> {
  const data = await databaseAPI.getData()
  return data.categories || []
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  const data = await databaseAPI.getData()
  data.categories = categories
  return await databaseAPI.updateData(data)
}

export async function getCoupons(): Promise<Coupon[]> {
  const data = await databaseAPI.getData()
  return data.coupons || []
}

export async function saveCoupons(coupons: Coupon[]): Promise<boolean> {
  const data = await databaseAPI.getData()
  data.coupons = coupons
  return await databaseAPI.updateData(data)
}

export async function getMenus(): Promise<any[]> {
  const data = await databaseAPI.getData()
  return data.menus || []
}

export async function saveMenus(menus: any[]): Promise<boolean> {
  const data = await databaseAPI.getData()
  data.menus = menus
  return await databaseAPI.updateData(data)
}

// دالة للتحديث الفوري عبر WebSocket simulation
export function setupRealTimeUpdates() {
  if (typeof window === 'undefined') return

  // التحقق من التحديثات كل 10 ثوان
  setInterval(async () => {
    try {
      databaseAPI.clearCache()
      const newData = await databaseAPI.getData()
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: newData }))
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }, 10000)

  // الاستماع لأحداث التحديث
  window.addEventListener('dataUpdated', (event: any) => {
    console.log('Data updated:', event.detail)
    // يمكن إضافة منطق إضافي هنا للتحديث الفوري للواجهة
  })
}

