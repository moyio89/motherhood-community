"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot } from "lucide-react"

export function AiConsultant() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to your AI service
    // For demonstration, we'll just set a mock answer
    setAnswer(
      "شكرًا على سؤالك! هذه إجابة توضيحية من المستشار الذكي. في التطبيق الفعلي، ستتلقين إجابة مخصصة بناءً على سؤالك.",
    )
    setQuestion("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-6 w-6 text-pink-600" />
          المستشار الذكي
        </CardTitle>
        <CardDescription>اسألي المستشار الذكي أي سؤال عن الأمومة والطفولة</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="اكتبي سؤالك هنا..." value={question} onChange={(e) => setQuestion(e.target.value)} />
          <Button type="submit" className="w-full">
            إرسال السؤال
          </Button>
        </form>
        {answer && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="font-semibold">إجابة المستشار الذكي:</p>
            <p>{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
