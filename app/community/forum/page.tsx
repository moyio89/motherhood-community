"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  Heart,
  Search,
  Filter,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
} from "lucide-react"

const mockTopics = [
  {
    id: 1,
    title: "نصائح للتعامل مع نوم الطفل",
    author: "سارة م.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    replies: 23,
    views: 230,
    likes: 45,
    category: "النوم",
    time: "قبل ساعتين",
    excerpt: "مشاركة تجربتي مع تنظيم نوم طفلي...",
    isSticky: true,
    isHot: true,
  },
  {
    id: 2,
    title: "وجبات صحية للأطفال",
    author: "منى ر.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    replies: 18,
    views: 150,
    likes: 32,
    category: "التغذية",
    time: "قبل 4 ساعات",
    excerpt: "قائمة بأفضل الوجبات الخفيفة الصحية...",
    isHot: true,
  },
  {
    id: 3,
    title: "تجارب التطعيم الشهري",
    author: "نورة ع.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    replies: 56,
    views: 480,
    likes: 89,
    category: "الصحة",
    time: "قبل يوم",
    excerpt: "شاركن تجاربكن مع التطعيمات الشهرية...",
  },
  {
    id: 4,
    title: "كيفية التعامل مع نوبات الغضب",
    author: "فاطمة ك.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    replies: 41,
    views: 320,
    likes: 67,
    category: "السلوك",
    time: "قبل 3 أيام",
    excerpt: "استراتيجيات فعالة للتعامل مع نوبات الغضب...",
  },
  {
    id: 5,
    title: "أفكار لأنشطة منزلية ممتعة",
    author: "عائشة س.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    replies: 29,
    views: 210,
    likes: 53,
    category: "الأنشطة",
    time: "قبل أسبوع",
    excerpt: "إليكم بعض الأفكار للأنشطة الممتعة مع الأطفال...",
  },
]

const categories = ["الكل", "الحمل والولادة", "تربية الأطفال", "الصحة والتغذية", "النمو والتطور", "الدعم النفسي"]

const nextMeetings = [
  {
    id: 1,
    title: "ورشة عمل: التغذية السليمة للأطفال",
    date: "15 مايو 2024",
    time: "14:00",
    speaker: "د. سارة الخالد",
    attendees: 45,
  },
  {
    id: 2,
    title: "ندوة: التعامل مع تحديات المراهقة",
    date: "20 مايو 2024",
    time: "16:30",
    speaker: "د. منى العتيبي",
    attendees: 32,
  },
  {
    id: 3,
    title: "لقاء مفتوح مع خبيرة الرضاعة الطبيعية",
    date: "25 مايو 2024",
    time: "11:00",
    speaker: "أ. نورة السعيد",
    attendees: 28,
  },
]

export default function CommunityForum() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [aiQuestion, setAiQuestion] = useState("")

  const filteredTopics = mockTopics.filter(
    (topic) =>
      (topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "الكل" || topic.category === selectedCategory),
  )

  return (
    <div className="container py-8 animate-fadeIn">
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">منتدى المجتمع</h1>
          <Button className="bg-pink-600 hover:bg-pink-700 transition-colors duration-300" asChild>
            <Link href="/community/forum/new-topic">
              <PlusCircle className="ml-2 h-4 w-4" /> موضوع جديد
            </Link>
          </Button>
        </div>

        {/* Next Meeting Banner */}
        <div className="bg-gradient-to-l from-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-right">
              <h2 className="text-lg font-semibold text-pink-800">الاجتماع القادم</h2>
              <h3 className="text-xl font-bold">{nextMeetings[0].title}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {nextMeetings[0].date} - {nextMeetings[0].time}
                </span>
              </div>
              <p className="text-gray-600">المتحدث: سما العزاوي</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full p-4 mb-2">
                <span className="text-2xl font-bold text-pink-600">{nextMeetings[0].attendees}</span>
                <span className="block text-sm text-gray-600">مشاركة</span>
              </div>
              <Button variant="secondary">سجلي الآن</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start text-right"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-right">إحصائيات المنتدى</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>المواضيع:</dt>
                  <dd>1,234</dd>
                </div>
                <div className="flex justify-between">
                  <dt>المشاركات:</dt>
                  <dd>5,678</dd>
                </div>
                <div className="flex justify-between">
                  <dt>الأعضاء:</dt>
                  <dd>9,012</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end">
                الاجتماعات القادمة
                <Calendar className="ml-2 h-5 w-5 text-pink-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {nextMeetings.map((meeting) => (
                  <li key={meeting.id} className="border-b pb-2 last:border-b-0 text-right">
                    <h4 className="font-semibold text-sm">{meeting.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {meeting.date} - {meeting.time}
                    </p>
                    <p className="text-xs text-muted-foreground">المتحدث: {meeting.speaker}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full">
                عرض كل الاجتماعات
              </Button>
            </CardFooter>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ابحثي في المنتدى..."
                    className="pl-4 pr-10 text-right"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="اختاري القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="ml-2 h-4 w-4" /> تصفية
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="latest" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="latest">الأحدث</TabsTrigger>
              <TabsTrigger value="popular">الأكثر تفاعلاً</TabsTrigger>
              <TabsTrigger value="unanswered">بدون ردود</TabsTrigger>
            </TabsList>
            <TabsContent value="latest" className="space-y-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4 flex-row-reverse">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {topic.isSticky && <Badge variant="secondary">مثبت</Badge>}
                            {topic.isHot && <Badge variant="destructive">ساخن</Badge>}
                          </div>
                          <CardTitle className="text-lg hover:text-pink-600 transition-colors duration-300 text-right">
                            <Link href={`/community/forum/${topic.id}`}>{topic.title}</Link>
                          </CardTitle>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-2 justify-end mt-2">
                            <span>{topic.time}</span>
                            <span>•</span>
                            <span>{topic.author}</span>
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                              <AvatarFallback>{topic.author[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-right">{topic.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground justify-end">
                      <Badge variant="outline">{topic.category}</Badge>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {topic.views} مشاهدة
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {topic.likes} إعجاب
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {topic.replies} رد
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="popular" className="space-y-4">
              {/* Similar structure to 'latest', but sorted by popularity */}
            </TabsContent>
            <TabsContent value="unanswered" className="space-y-4">
              {/* Similar structure to 'latest', but filtered for unanswered topics */}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center items-center gap-2 mt-8">
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <span>...</span>
            <Button variant="outline" size="sm">
              10
            </Button>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
