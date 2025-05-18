import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import TopicList from "@/components/topic-list"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "مواضيع تربية الأطفال - مجتمع الأمومة",
    description: "استكشف المواضيع المتعلقة بتربية الأطفال في مجتمع الأمومة",
  }
}

export default async function CategoryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: topics, error } = await supabase.from("topics").select("*").eq("category", "تربية الأطفال").limit(1)

  if (error || topics.length === 0) {
    notFound()
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-right">مواضيع تربية الأطفال</h1>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <TopicList category="تربية الأطفال" />
      </Suspense>
    </div>
  )
}
