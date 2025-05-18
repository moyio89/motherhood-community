"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import ProtectedRoute from "@/components/protected-route"

export default function NewQATopicPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase.from("qa_topics").insert({ title, content, user_id: user.id }).select()

      if (error) {
        console.error("Error creating QA topic:", error)
      } else {
        router.push(`/community/qa/${data[0].id}`)
      }
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-right">
                  عنوان السؤال
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 text-right"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 text-right">
                  محتوى السؤال
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="mt-1 text-right"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">
                نشر السؤال
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
