import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc 
} from "firebase/firestore"
import { db } from "./firebase"

export interface MenuItem {
  id: string
  name: string
  url: string
  parentId?: string
  order: number
  isActive: boolean
}

// جلب القوائم من Firestore
export async function fetchMenus(): Promise<MenuItem[]> {
  try {
    const menusCollection = collection(db, "menus")
    const menusQuery = query(menusCollection, orderBy("order"))
    const querySnapshot = await getDocs(menusQuery)
    
    const menus: MenuItem[] = []
    querySnapshot.forEach((doc) => {
      menus.push({
        id: doc.id,
        ...doc.data()
      } as MenuItem)
    })
    
    // إذا لم توجد قوائم، إنشاء القوائم الافتراضية
    if (menus.length === 0) {
      await initializeDefaultMenus()
      return await fetchMenus() // إعادة جلب القوائم بعد إنشاء الافتراضية
    }
    
    return menus
  } catch (error) {
    console.error("Error fetching menus from Firestore:", error)
    return getDefaultMenus()
  }
}

// حفظ قائمة جديدة أو تحديث موجودة
export async function saveMenu(menu: Omit<MenuItem, 'id'> & { id?: string }): Promise<string | null> {
  try {
    const menusCollection = collection(db, "menus")
    
    if (menu.id) {
      // تحديث قائمة موجودة
      const menuDoc = doc(db, "menus", menu.id)
      await updateDoc(menuDoc, {
        name: menu.name,
        url: menu.url,
        parentId: menu.parentId || null,
        order: menu.order,
        isActive: menu.isActive
      })
      return menu.id
    } else {
      // إضافة قائمة جديدة
      const docRef = await addDoc(menusCollection, {
        name: menu.name,
        url: menu.url,
        parentId: menu.parentId || null,
        order: menu.order,
        isActive: menu.isActive
      })
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving menu to Firestore:", error)
    return null
  }
}

// حذف قائمة
export async function deleteMenu(menuId: string): Promise<boolean> {
  try {
    const menuDoc = doc(db, "menus", menuId)
    await deleteDoc(menuDoc)
    return true
  } catch (error) {
    console.error("Error deleting menu from Firestore:", error)
    return false
  }
}

// إنشاء القوائم الافتراضية
async function initializeDefaultMenus(): Promise<void> {
  const defaultMenus = getDefaultMenus()
  
  try {
    for (const menu of defaultMenus) {
      const menuDoc = doc(db, "menus", menu.id)
      await setDoc(menuDoc, {
        name: menu.name,
        url: menu.url,
        parentId: menu.parentId || null,
        order: menu.order,
        isActive: menu.isActive
      })
    }
    console.log("Default menus initialized successfully")
  } catch (error) {
    console.error("Error initializing default menus:", error)
  }
}

// القوائم الافتراضية
function getDefaultMenus(): MenuItem[] {
  return [
    { id: "1", name: "الرئيسية", url: "/", order: 1, isActive: true },
    { id: "2", name: "المنتجات", url: "/products", order: 2, isActive: true },
    { id: "3", name: "الكتب", url: "/products?category=كتب", parentId: "2", order: 1, isActive: true },
    { id: "4", name: "الألعاب", url: "/products?category=ألعاب", parentId: "2", order: 2, isActive: true },
    { id: "5", name: "أدوات مكتبية", url: "/products?category=أدوات مكتبية", parentId: "2", order: 3, isActive: true },
    { id: "6", name: "اتصل بنا", url: "/contact", order: 3, isActive: true },
    { id: "7", name: "المنتدى", url: "/forum", order: 4, isActive: true },
  ]
}

