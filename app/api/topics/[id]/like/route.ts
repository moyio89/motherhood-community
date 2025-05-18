import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase.from("topic_likes").insert({ user_id: user.id, topic_id: params.id }).select()

  if (error) {
    if (error.code === "23505") {
      // Unique violation error code
      // User has already liked this topic, so unlike it
      const { error: unlikeError } = await supabase
        .from("topic_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("topic_id", params.id)

      if (unlikeError) {
        return NextResponse.json({ error: unlikeError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Topic unliked successfully" })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Topic liked successfully" })
}
