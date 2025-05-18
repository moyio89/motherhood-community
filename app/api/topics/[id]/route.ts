import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: topic, error } = await supabase
    .from("topics")
    .select(`
      *,
      user_profiles!inner(username, avatar_url, email),
      comments(
        *,
        user_profiles!inner(username, avatar_url, email)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Increment view count
  await supabase
    .from("topics")
    .update({ views: (topic.views || 0) + 1 })
    .eq("id", params.id)

  return NextResponse.json(topic)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { content } = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ content, user_id: user.id, topic_id: params.id })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
