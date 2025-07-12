import { NextRequest, NextResponse } from 'next/server'

// بيانات القوائم الافتراضية
const defaultMenus = [
  { id: 1, name: "الرئيسية", url: "/", order: 1, isActive: true },
  { id: 2, name: "المنتجات", url: "/products", order: 2, isActive: true },
  { id: 3, name: "الكتب", url: "/products?category=كتب", parentId: 2, order: 1, isActive: true },
  { id: 4, name: "الألعاب", url: "/products?category=ألعاب", parentId: 2, order: 2, isActive: true },
  { id: 5, name: "أدوات مكتبية", url: "/products?category=أدوات مكتبية", parentId: 2, order: 3, isActive: true },
  { id: 6, name: "اتصل بنا", url: "/contact", order: 3, isActive: true },
  { id: 7, name: "المنتدى", url: "/forum", order: 4, isActive: true },
]

// متغير لتخزين القوائم في الذاكرة (في بيئة الإنتاج يفضل استخدام قاعدة بيانات)
let menusData = [...defaultMenus]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      data: menusData 
    })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch menus',
      data: defaultMenus 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { menus } = body

    if (!Array.isArray(menus)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid menus data' 
      }, { status: 400 })
    }

    // تحديث البيانات
    menusData = menus

    return NextResponse.json({ 
      success: true, 
      message: 'Menus updated successfully' 
    })
  } catch (error) {
    console.error('Error saving menus:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save menus' 
    }, { status: 500 })
  }
}

