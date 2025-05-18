"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export function TopicsManagement() {
  const [topics, setTopics] = useState([])
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "" })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("topics").select("*")
    if (error) {
      toast({ title: "Error", description: "Failed to fetch topics", variant: "destructive" })
    } else {
      setTopics(data)
    }
    setIsLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTopic((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.from("topics").insert([newTopic])
    if (error) {
      toast({ title: "Error", description: "Failed to add topic", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Topic added successfully" })
      fetchTopics()
      setNewTopic({ title: "", content: "", category: "" })
    }
  }

  const toggleSticky = async (id, isSticky) => {
    const { error } = await supabase.from("topics").update({ is_sticky: !isSticky }).eq("id", id)
    if (error) {
      toast({ title: "Error", description: "Failed to update topic", variant: "destructive" })
    } else {
      fetchTopics()
    }
  }

  const toggleHot = async (id, isHot) => {
    const { error } = await supabase.from("topics").update({ is_hot: !isHot }).eq("id", id)
    if (error) {
      toast({ title: "Error", description: "Failed to update topic", variant: "destructive" })
    } else {
      fetchTopics()
    }
  }

  if (isLoading) return <div>جاري التحميل...</div>

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input name="title" value={newTopic.title} onChange={handleInputChange} placeholder="عنوان الموضوع" required />
        <Input
          name="content"
          value={newTopic.content}
          onChange={handleInputChange}
          placeholder="محتوى الموضوع"
          required
        />
        <Input name="category" value={newTopic.category} onChange={handleInputChange} placeholder="الفئة" required />
        <Button type="submit">إضافة موضوع</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>المشاهدات</TableHead>
            <TableHead>الإعجابات</TableHead>
            <TableHead>مثبت</TableHead>
            <TableHead>ساخن</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>{topic.title}</TableCell>
              <TableCell>{topic.category}</TableCell>
              <TableCell>{topic.views}</TableCell>
              <TableCell>{topic.likes}</TableCell>
              <TableCell>
                <Checkbox checked={topic.is_sticky} onCheckedChange={() => toggleSticky(topic.id, topic.is_sticky)} />
              </TableCell>
              <TableCell>
                <Checkbox checked={topic.is_hot} onCheckedChange={() => toggleHot(topic.id, topic.is_hot)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
