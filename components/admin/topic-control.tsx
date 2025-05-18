"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function TopicControl() {
  const [mainTopics, setMainTopics] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMainTopics()
  }, [])

  const fetchMainTopics = async () => {
    const { data, error } = await supabase
      .from("main_topics")
      .select("*, subtopics(*)")
      .ilike("title", `%${searchTerm}%`)
    if (error) {
      console.error("Error fetching main topics:", error)
    } else {
      setMainTopics(data)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    fetchMainTopics()
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="البحث عن المواضيع"
        value={searchTerm}
        onChange={handleSearch}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان الرئيسي</TableHead>
            <TableHead>عدد المواضيع الفرعية</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mainTopics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>{topic.title}</TableCell>
              <TableCell>{topic.subtopics.length}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  تعديل
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
