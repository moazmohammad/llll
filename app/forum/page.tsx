"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MessageSquare, Plus, Eye, User, Calendar, Search } from "lucide-react"
import Link from "next/link"
import { getForumPosts, saveForumPosts, getCurrentUser, type ForumPost } from "@/lib/store"

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [showNewPost, setShowNewPost] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("الكل")
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
  })
  const currentUser = getCurrentUser()

  useEffect(() => {
    setPosts(getForumPosts())
  }, [])

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      alert("يجب تسجيل الدخول أولاً")
      return
    }

    const post: ForumPost = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      author: currentUser.name,
      category: newPost.category,
      createdAt: new Date().toISOString(),
      replies: [],
      views: 0,
    }

    const updatedPosts = [post, ...posts]
    setPosts(updatedPosts)
    saveForumPosts(updatedPosts)

    setNewPost({ title: "", content: "", category: "" })
    setShowNewPost(false)
    alert("تم نشر المقال بنجاح!")
  }

  const categories = ["الكل", "عام", "كتب", "تعليم", "تقنية", "ثقافة"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "الكل" || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">مكتبة الأمل - المنتدى</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  العودة للمتجر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">منتدى مكتبة الأمل</h2>
            <p className="text-gray-600">شارك أفكارك ومقالاتك مع المجتمع</p>
          </div>
          {currentUser && (
            <Button onClick={() => setShowNewPost(!showNewPost)}>
              <Plus className="h-4 w-4 ml-2" />
              مقال جديد
            </Button>
          )}
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>إنشاء مقال جديد</CardTitle>
              <CardDescription>شارك مقالك أو فكرتك مع المجتمع</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المقال</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة</Label>
                    <Select
                      value={newPost.category}
                      onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">محتوى المقال</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="text-right"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">نشر المقال</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المقالات..."
              className="pr-10 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts List */}
        {!currentUser && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-blue-800 text-center">
                <Link href="/login" className="font-semibold hover:underline">
                  سجل الدخول
                </Link>{" "}
                لتتمكن من إنشاء مقالات جديدة والمشاركة في النقاشات
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مقالات</h3>
                <p className="text-gray-600">كن أول من ينشر مقالاً في المنتدى!</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                    </div>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 ml-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-1" />
                        {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 ml-1" />
                        {post.views} مشاهدة
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 ml-1" />
                        {post.replies.length} رد
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
