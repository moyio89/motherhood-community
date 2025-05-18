import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Heart } from "lucide-react"

const mockDiscussions = [
  {
    id: 1,
    title: "نصائح للتعامل مع نوم الطفل",
    author: "سارة م.",
    replies: 23,
    likes: 45,
    category: "النوم",
    time: "قبل ساعتين",
    excerpt: "مشاركة تجربتي مع تنظيم نوم طفلي...",
  },
  {
    id: 2,
    title: "وجبات صحية للأطفال",
    author: "منى ر.",
    replies: 18,
    likes: 32,
    category: "التغذية",
    time: "قبل 4 ساعات",
    excerpt: "قائمة بأفضل الوجبات الخفيفة الصحية...",
  },
  {
    id: 3,
    title: "تجارب التطعيم الشهري",
    author: "نورة ع.",
    replies: 56,
    likes: 89,
    category: "الصحة",
    time: "قبل يوم",
    excerpt: "شاركن تجاربكن مع التطعيمات الشهرية...",
  },
]

export default function CommunityPage() {
  return (
    <div className="space-y-6 py-6 lg:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المجلس</h1>
          <p className="text-muted-foreground">تبادلي الخبرات والنصائح مع أمهات أخريات</p>
        </div>
        <Button>موضوع جديد</Button>
      </div>

      <div className="grid gap-4">
        {mockDiscussions.map((discussion) => (
          <Card key={discussion.id}>
            <CardHeader>
              <CardTitle>{discussion.title}</CardTitle>
              <CardDescription>
                بواسطة {discussion.author} · {discussion.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{discussion.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {discussion.replies} رد
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {discussion.likes} إعجاب
                </span>
                <span className="px-2 py-1 rounded-full bg-muted">{discussion.category}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
