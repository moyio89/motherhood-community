import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get request body
    const { content, topicId, parentId } = await request.json()

    if (!content || !topicId || !parentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify parent comment exists
    const { data: parentComment, error: parentError } = await supabase
      .from("comments")
      .select("id")
      .eq("id", parentId)
      .single()

    if (parentError || !parentComment) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
    }

    // Insert reply
    const { data, error } = await supabase
      .from("comments")
      .insert({
        content,
        topic_id: topicId,
        user_id: user.id,
        parent_id: parentId,
      })
      .select()

    if (error) {
      console.error("Error inserting reply:", error)
      return NextResponse.json({ error: "Failed to add reply" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in reply API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
