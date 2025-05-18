import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import TopicList from "@/components/topic-list"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface TagPageProps {
  params: {
    tag: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag)
  return {
    title: `مواضيع ${decodedTag} - مجتمع الأمومة`,
    description: `استكشف المواضيع المتعلقة بـ ${decodedTag} في مجتمع الأمومة`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const supabase = createServerComponentClient({ cookies })
  const decodedTag = decodeURIComponent(params.tag)

  // Check if it's a category
  const { data: categoryTopics, error: categoryError } = await supabase
    .from("topics")
    .select("*")
    .eq("category", decodedTag)
    .limit(1)

  // If not a category, check if it's a tag
  const { data: tagTopics, error: tagError } = await supabase
    .from("topics")
    .select("*")
    .contains("tags", [decodedTag])
    .limit(1)

  if ((categoryError && tagError) || (categoryTopics.length === 0 && tagTopics.length === 0)) {
    notFound()
  }

  const isCategory = categoryTopics.length > 0

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-right">مواضيع {decodedTag}</h1>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <TopicList tag={isCategory ? undefined : decodedTag} category={isCategory ? decodedTag : undefined} />
      </Suspense>
    </div>
  )
}
