import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Check if the requesting user is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (!userProfile?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Get user from auth
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError) {
    console.error("Error fetching user:", authError)

    // Try to get from user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: profileData })
  }

  return NextResponse.json({ user: authUser.user })
}
