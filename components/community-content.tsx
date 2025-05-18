"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, PlusCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { AiConsultant } from "@/components/ai-consultant"

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

export default function CommunityContent() {
  return (
    <div className="container py-8 animate-fadeIn">
      <AiConsultant />
      <div className="space-y-6 mt-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">آخر المواضيع</h1>
          <Button className="bg-pink-600 hover:bg-pink-700 transition-colors duration-300" asChild>
            <Link href="/community/new-topic">
              <PlusCircle className="ml-2 h-4 w-4" /> موضوع جديد
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {mockTopics.map((topic) => (
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
        </div>
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
      </div>
    </div>
  )
}
