import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { content } = await request.json()

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if the user is the owner of the reply
    const { data: reply, error: fetchError } = await supabase
      .from("question_replies")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError) throw fetchError

    if (reply.user_id !== user.id) {
      // Check if user is admin
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (!userProfile.is_admin) {
        return NextResponse.json({ error: "Unauthorized to edit this reply" }, { status: 403 })
      }
    }

    // Update the reply
    const { data, error } = await supabase
      .from("question_replies")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, reply: data[0] })
  } catch (error) {
    console.error("Error updating reply:", error)
    return NextResponse.json({ error: "Failed to update reply" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if the user is the owner of the reply
    const { data: reply, error: fetchError } = await supabase
      .from("question_replies")
      .select("user_id, question_id")
      .eq("id", params.id)
      .single()

    if (fetchError) throw fetchError

    if (reply.user_id !== user.id) {
      // Check if user is admin
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (!userProfile.is_admin) {
        return NextResponse.json({ error: "Unauthorized to delete this reply" }, { status: 403 })
      }
    }

    // Delete the reply
    const { error } = await supabase.from("question_replies").delete().eq("id", params.id)

    if (error) throw error

    // Update the comments count in the question
    await supabase
      .from("questions")
      .update({
        comments_count: supabase.rpc("decrement", {
          row_id: reply.question_id,
          table: "questions",
          column: "comments_count",
        }),
      })
      .eq("id", reply.question_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reply:", error)
    return NextResponse.json({ error: "Failed to delete reply" }, { status: 500 })
  }
}
