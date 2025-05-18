import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get("questionId")

  if (!questionId) {
    return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch replies for the question
    const { data: replies, error } = await supabase
      .from("question_replies")
      .select(`
        *,
        user_profiles:user_id(username, avatar_url)
      `)
      .eq("question_id", questionId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ replies })
  } catch (error) {
    console.error("Error fetching question replies:", error)
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { content, questionId } = await request.json()

  if (!content || !questionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Insert the reply
    const { data, error } = await supabase
      .from("question_replies")
      .insert({
        content,
        user_id: user.id,
        question_id: questionId,
      })
      .select()

    if (error) throw error

    // Update the comments count in the question
    await supabase
      .from("questions")
      .update({
        comments_count: supabase.rpc("increment", { row_id: questionId, table: "questions", column: "comments_count" }),
      })
      .eq("id", questionId)

    // Get user data for the reply
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single()

    if (userError) throw userError

    return NextResponse.json({
      success: true,
      reply: {
        ...data[0],
        user_profiles: userData,
      },
    })
  } catch (error) {
    console.error("Error adding reply:", error)
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 })
  }
}
