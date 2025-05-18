"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/components/ui/use-toast"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول لطرح سؤال",
          variant: "destructive",
        })
        return
      }

      // Get user profile to include author information
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()

      // Insert into the new questions table
      const { data, error } = await supabase
        .from("questions")
        .insert({
          title,
          content,
          user_id: user.id,
          author_name: userProfile?.username || "مستخدم",
          author_avatar: userProfile?.avatar_url || null,
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "تم بنجاح",
        description: "تم نشر سؤالك بنجاح",
      })

      // Redirect to the community page with the questions tab selected
      router.push("/community?tab=أسئلة")
    } catch (error) {
      console.error("Error creating question:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نشر السؤال. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 animate-fadeIn">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-right">طرح سؤال جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-gray-700 text-right">
                  عنوان السؤال
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 text-right"
                  placeholder="أدخل عنوان سؤالك هنا"
                />
              </div>
              <div>
                <Label htmlFor="content" className="block text-sm font-medium text-gray-700 text-right">
                  محتوى السؤال
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="mt-1 text-right"
                  rows={5}
                  placeholder="اشرح سؤالك بالتفصيل هنا"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "جاري النشر..." : "نشر السؤال"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
