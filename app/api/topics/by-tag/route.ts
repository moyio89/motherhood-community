import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get("tag")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = 10
  const offset = (page - 1) * limit

  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: topics,
    error,
    count,
  } = await supabase
    .from("topics")
    .select("*, user_profiles!inner(username, avatar_url), comments(count)", { count: "exact" })
    .contains("tags", [tag])
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ topics, count, page, totalPages: Math.ceil((count || 0) / limit) })
}
