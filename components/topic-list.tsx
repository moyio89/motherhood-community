"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import TopicCard from "@/components/topic-card"
import Pagination from "@/components/pagination"

interface TopicListProps {
  tag?: string
  category?: string
}

export default function TopicList({ tag, category }: TopicListProps) {
  const [topics, setTopics] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTopics()
  }, [currentPage, category, tag])

  async function fetchTopics() {
    let query = supabase
      .from("topics")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * 10, currentPage * 10 - 1)

    if (tag) {
      query = query.contains("tags", [tag])
    } else if (category) {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching topics:", error)
    } else {
      setTopics(data || [])
      setTotalPages(Math.ceil((count || 0) / 10))
    }
  }

  return (
    <div className="space-y-6">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}
