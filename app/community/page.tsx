"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { formatArabicDate } from "@/lib/date-utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"

// Icons
import {
  MessageCircle,
  Heart,
  PlusCircle,
  Eye,
  TrendingUp,
  Clock,
  Search,
  BookmarkIcon,
  Activity,
  HelpCircle,
} from "lucide-react"

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "newest"
  const initialCategory = searchParams.get("category") || "all"

  const [activeTab, setActiveTab] = useState(initialTab)
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [likedTopics, setLikedTopics] = useState({})
  const [bookmarkedTopics, setBookmarkedTopics] = useState({})
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemPerPage] = useState(10)

  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Categories for filter (example)
  const categories = ["all", "دروس", "أسئلة", "مشاريع", "نقاشات"]

  useEffect(() => {
    if (selectedCategory === "أسئلة") {
      fetchQuestions()
    } else {
      fetchTopics()
    }
    fetchCurrentUser()

    // Load bookmarked topics from localStorage
    const savedBookmarks = localStorage.getItem("bookmarkedTopics")
    if (savedBookmarks) {
      setBookmarkedTopics(JSON.parse(savedBookmarks))
    }

    // Load liked topics from localStorage
    const savedLikes = localStorage.getItem("likedTopics")
    if (savedLikes) {
      setLikedTopics(JSON.parse(savedLikes))
    }
  }, [])

  // Reset to page 1 when category or tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, activeTab])

  // Add a new useEffect to refetch topics when selectedCategory, activeTab, or currentPage changes
  useEffect(() => {
    if (selectedCategory === "أسئلة") {
      fetchQuestions()
    } else {
      fetchTopics()
    }
  }, [selectedCategory, activeTab, currentPage])

  const fetchTopics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, get the count of all matching topics
      let countQuery = supabase.from("topics").select("id", { count: "exact" })

      if (selectedCategory !== "all" && selectedCategory !== "أسئلة") {
        countQuery = countQuery.eq("sorting", selectedCategory)
      }

      const { count, error: countError } = await countQuery

      if (countError) throw countError

      // Calculate total pages
      const calculatedTotalPages = Math.ceil((count || 0) / itemsPerPage)
      setTotalPages(calculatedTotalPages || 1)

      // Now fetch the paginated data
      let query = supabase
        .from("topics")
        .select("*")
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (activeTab === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (activeTab === "popular") {
        query = query.order("likes", { ascending: false })
      }

      if (selectedCategory !== "all" && selectedCategory !== "أسئلة") {
        query = query.eq("sorting", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      setTopics(data || [])
    } catch (error) {
      console.error("Error fetching topics:", error)
      setError(error.message)
      toast({
        title: "خطأ",
        description: `فشل في جلب المواضيع: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, get the count of all questions
      const { count, error: countError } = await supabase.from("questions").select("id", { count: "exact" })

      if (countError) throw countError

      // Calculate total pages
      const calculatedTotalPages = Math.ceil((count || 0) / itemsPerPage)
      setTotalPages(calculatedTotalPages || 1)

      // Now fetch the paginated data
      let query = supabase
        .from("questions")
        .select("*")
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (activeTab === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (activeTab === "popular") {
        query = query.order("likes", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      setQuestions(data || [])
    } catch (error) {
      console.error("Error fetching questions:", error)
      setError(error.message)
      toast({
        title: "خطأ",
        description: `فشل في جلب الأسئلة: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
        } else if (profile) {
          setCurrentUser(profile)
          setIsAdmin(
            profile.is_admin === true ||
              profile.is_admin === "true" ||
              profile.is_admin === 1 ||
              profile.is_admin === "1",
          )
        }
      }
    } catch (error) {
      console.error("Error in fetchCurrentUser:", error)
    }
  }

  const handleLike = async (id, isQuestion = false) => {
    // Create a copy of the topics or questions array
    const updatedItems = isQuestion ? [...questions] : [...topics]
    const itemIndex = updatedItems.findIndex((t) => t.id === id)

    if (itemIndex !== -1) {
      const isLiked = likedTopics[id]

      // Update the likes count
      updatedItems[itemIndex].likes = isLiked
        ? Math.max(0, (updatedItems[itemIndex].likes || 0) - 1)
        : (updatedItems[itemIndex].likes || 0) + 1

      // Update the state
      if (isQuestion) {
        setQuestions(updatedItems)
      } else {
        setTopics(updatedItems)
      }

      // Update the liked topics state
      const newLikedTopics = { ...likedTopics, [id]: !isLiked }
      setLikedTopics(newLikedTopics)

      // Save to localStorage
      localStorage.setItem("likedTopics", JSON.stringify(newLikedTopics))

      // Update the database
      try {
        if (isQuestion) {
          await supabase.from("questions").update({ likes: updatedItems[itemIndex].likes }).eq("id", id)
        } else {
          await supabase.from("topics").update({ likes: updatedItems[itemIndex].likes }).eq("id", id)
        }
      } catch (error) {
        console.error("Error updating likes:", error)
      }

      // Show a toast notification
      toast({
        title: isLiked ? "تم إلغاء الإعجاب" : "تم الإعجاب",
        description: isLiked ? "تم إلغاء إعجابك بهذا الموضوع" : "تم تسجيل إعجابك بهذا الموضوع",
        variant: "default",
      })
    }
  }

  const handleBookmark = (id) => {
    const isBookmarked = bookmarkedTopics[id]

    // Update the bookmarked topics state
    const newBookmarkedTopics = { ...bookmarkedTopics, [id]: !isBookmarked }
    setBookmarkedTopics(newBookmarkedTopics)

    // Save to localStorage
    localStorage.setItem("bookmarkedTopics", JSON.stringify(newBookmarkedTopics))

    // Show a toast notification
    toast({
      title: isBookmarked ? "تم إلغاء الحفظ" : "تم الحفظ",
      description: isBookmarked ? "تم إلغاء حفظ هذا الموضوع" : "تم حفظ هذا الموضوع",
      variant: "default",
    })
  }

  const handleDeleteItem = async (id, isQuestion = false) => {
    if (!isAdmin) return

    // Show confirmation dialog
    if (!confirm("هل أنت متأكد من حذف هذا الموضوع؟")) {
      return // User canceled the deletion
    }

    try {
      // First get the current user's auth token to ensure proper authorization
      const { data: authData } = await supabase.auth.getSession()

      if (!authData.session) {
        throw new Error("جلسة المستخدم غير صالحة")
      }

      // Double check admin status from the database to ensure proper permissions
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", authData.session.user.id)
        .single()

      if (adminCheckError || !adminCheck || !adminCheck.is_admin) {
        throw new Error("ليس لديك صلاحيات كافية لحذف هذا الموضوع")
      }

      // Perform the delete operation with explicit RLS bypass for admins
      const { error } = await supabase
        .from(isQuestion ? "questions" : "topics")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      // Remove the item from the local state
      if (isQuestion) {
        setQuestions(questions.filter((q) => q.id !== id))
      } else {
        setTopics(topics.filter((t) => t.id !== id))
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف الموضوع بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "خطأ",
        description: `فشل في حذف الموضوع: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Filter topics or questions based on search query
  const filteredItems =
    selectedCategory === "أسئلة"
      ? questions.filter((q) => q.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : topics.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-3 sm:px-4 md:px-6" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">المجتمع</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">تواصل مع أعضاء المجتمع وشارك في النقاشات</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Add Ask Question button for all users */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" asChild>
            <Link href="/community/ask-question">
              <HelpCircle className="ml-2 h-4 w-4" />
              طرح سؤال جديد
            </Link>
          </Button>

          {isAdmin && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" asChild>
              <Link href="/community/new-topic">
                <PlusCircle className="ml-2 h-4 w-4" />
                إنشاء منشور جديد
              </Link>
            </Button>
          )}
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/community/bookmarks">
              <BookmarkIcon className="ml-2 h-4 w-4" />
              المواضيع المحفوظة
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في المواضيع..."
            className="pr-10 text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-2 no-scrollbar">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "جميع المواضيع" : category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 sm:mb-6 bg-muted/60 p-1 rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="newest"
            className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow text-xs sm:text-sm whitespace-nowrap"
          >
            <Clock className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            الأحدث
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow text-xs sm:text-sm whitespace-nowrap"
          >
            <TrendingUp className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            الأكثر تفاعلاً
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow text-xs sm:text-sm whitespace-nowrap"
          >
            <Activity className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            الأكثر نشاطاً
          </TabsTrigger>
        </TabsList>

        {/* Content Section */}
        <TabsContent value={activeTab} className="focus-visible:outline-none focus-visible:ring-0">
          {isLoading ? (
            // Loading skeletons
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="w-24 h-24 rounded-2xl" />
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            // Empty state
            <Card className="border-dashed bg-muted/20">
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مواضيع لعرضها</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "لم يتم العثور على نتائج مطابقة لبحثك" : "كن أول من يبدأ محادثة جديدة!"}
                </p>
                <Button asChild>
                  <Link href={selectedCategory === "أسئلة" ? "/community/ask-question" : "/community/new-topic"}>
                    {selectedCategory === "أسئلة" ? (
                      <>
                        <HelpCircle className="ml-2 h-4 w-4" />
                        طرح سؤال جديد
                      </>
                    ) : (
                      <>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إنشاء موضوع جديد
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Topics/Questions grid
            <>
              <motion.div className="grid gap-6" variants={containerVariants} initial="hidden" animate="visible">
                {filteredItems.map((item) => {
                  const isQuestion = selectedCategory === "أسئلة"
                  return (
                    <motion.div key={item.id} variants={itemVariants} transition={{ duration: 0.3 }}>
                      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-muted/60 hover:border-primary/40 group">
                        <CardContent className="pt-6 pb-3 px-4 sm:px-6">
                          <div className="flex flex-col sm:flex-row-reverse gap-4 sm:gap-6">
                            {/* Image container - Now on the right */}
                            {!isQuestion && (
                              <div className="relative w-full sm:w-36 h-32 shrink-0 rounded-xl overflow-hidden shadow-md border border-muted/50 group-hover:border-primary/30 transition-colors">
                                {item.featured_image_url ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${item.featured_image_url}`}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : item.media_urls && item.media_urls.length > 0 ? (
                                  item.media_urls.map((mediaUrl, index) => (
                                    <div key={index} className="absolute inset-0">
                                      {mediaUrl.endsWith(".mp4") ? (
                                        <video
                                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${mediaUrl}`}
                                          className="w-full h-full object-cover"
                                          muted
                                          loop
                                          autoPlay
                                        />
                                      ) : (
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${mediaUrl}`}
                                          alt={`Media ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <img
                                    src="/placeholder.svg?height=144&width=144"
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                            )}

                            {/* Content container */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
                              <div className="space-y-3">
                                {/* Category badges on top */}
                                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                  {!isQuestion && item.category && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-3 py-1 rounded-full font-medium bg-primary/10 text-primary border-none"
                                    >
                                      {item.category}
                                    </Badge>
                                  )}
                                  {isQuestion && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-3 py-1 rounded-full font-medium bg-blue-500/10 text-blue-600 border-none"
                                    >
                                      سؤال
                                    </Badge>
                                  )}
                                  {!isQuestion && item.sorting && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-3 py-1 rounded-full border-blue-500/40 text-blue-600 bg-blue-500/10 font-medium"
                                    >
                                      {item.sorting}
                                    </Badge>
                                  )}
                                  {!isQuestion && item.is_sticky && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-3 py-1 rounded-full border-amber-500/40 text-amber-600 bg-amber-500/10 font-medium"
                                    >
                                      <TrendingUp className="h-3 w-3 ml-1" />
                                      مثبت
                                    </Badge>
                                  )}
                                  {!isQuestion && item.is_featured && (
                                    <Badge className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium">
                                      مميز
                                    </Badge>
                                  )}
                                </div>

                                {/* Title with better styling */}
                                <div className="text-right">
                                  <Link
                                    href={isQuestion ? `/community/question/${item.id}` : `/community/topic/${item.id}`}
                                    className="inline-block text-xl font-bold hover:text-primary transition-colors line-clamp-2 group-hover:text-primary"
                                  >
                                    {item.title}
                                  </Link>
                                </div>

                                {/* Topic excerpt/preview with better formatting */}
                                {!isQuestion && item.excerpt && (
                                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed text-right">
                                    {item.excerpt}
                                  </p>
                                )}
                                {isQuestion && item.content && (
                                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed text-right">
                                    {item.content}
                                  </p>
                                )}
                              </div>

                              {/* Author and stats */}
                              <div className="flex flex-wrap items-center justify-between gap-y-3 text-sm text-muted-foreground pt-4 border-t border-muted/30 mt-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Avatar className="w-6 h-6 sm:w-7 sm:h-7 ring-2 ring-primary/10">
                                    <AvatarImage
                                      src={item.author_avatar || "/placeholder.svg"}
                                      alt={item.author_name || "مستخدم"}
                                    />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                      {(item.author_name || "م").charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-xs sm:text-sm">{item.author_name || "مستخدم"}</span>
                                  <span className="text-muted-foreground/50 hidden xs:inline-block">•</span>
                                  <span
                                    className="text-xs sm:text-sm"
                                    title={new Date(item.created_at).toLocaleString()}
                                  >
                                    {formatArabicDate(item.created_at)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                  <span
                                    className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-muted/30 px-1.5 sm:px-2 py-1 rounded-full text-xs sm:text-sm"
                                    title="عدد المشاهدات"
                                  >
                                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/70" />
                                    {item.views || 0}
                                  </span>
                                  <span
                                    className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-muted/30 px-1.5 sm:px-2 py-1 rounded-full text-xs sm:text-sm"
                                    title="عدد الإعجابات"
                                  >
                                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/70" />
                                    {item.likes || 0}
                                  </span>
                                  <span
                                    className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-muted/30 px-1.5 sm:px-2 py-1 rounded-full text-xs sm:text-sm"
                                    title="عدد التعليقات"
                                  >
                                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/70" />
                                    {item.comments_count || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-3 sm:px-4 py-3 border-t border-muted/30 bg-muted/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-3 sm:px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200 text-sm font-medium"
                              asChild
                            >
                              <Link
                                href={isQuestion ? `/community/question/${item.id}` : `/community/topic/${item.id}`}
                              >
                                {isQuestion ? "عرض السؤال بالكامل" : "عرض الموضوع بالكامل"}
                              </Link>
                            </Button>

                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-3 sm:px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 transition-all duration-200 text-sm font-medium"
                                  asChild
                                >
                                  <Link
                                    href={
                                      isQuestion
                                        ? `/community/edit-question/${item.id}`
                                        : `/community/edit-topic/${item.id}`
                                    }
                                  >
                                    تعديل
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-3 sm:px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-all duration-200 text-sm font-medium"
                                  onClick={() => handleDeleteItem(item.id, isQuestion)}
                                >
                                  حذف
                                </Button>
                              </>
                            )}
                          </div>

                          <div className="flex gap-1 self-end sm:self-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-full hover:bg-primary/10 ${likedTopics[item.id] ? "text-red-500" : "text-muted-foreground hover:text-primary"}`}
                              onClick={() => handleLike(item.id, isQuestion)}
                              title={likedTopics[item.id] ? "إلغاء الإعجاب" : "إعجاب"}
                            >
                              <Heart className={`h-4 w-4 ${likedTopics[item.id] ? "fill-current" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-full hover:bg-primary/10 ${bookmarkedTopics[item.id] ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                              onClick={() => handleBookmark(item.id)}
                              title={bookmarkedTopics[item.id] ? "إلغاء الحفظ" : "حفظ"}
                            >
                              <BookmarkIcon className={`h-4 w-4 ${bookmarkedTopics[item.id] ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
