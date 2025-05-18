import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get request body
    const requestData = await request.json()
    const { id, ...updateData } = requestData

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    // Update the topic with minimal fields
    const { data, error } = await supabase
      .from("topics")
      .update({
        title: updateData.title,
        content: updateData.content,
        category: updateData.category,
        sorting: updateData.sorting,
        is_hot: updateData.is_hot,
        is_sticky: updateData.is_sticky,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating topic:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
