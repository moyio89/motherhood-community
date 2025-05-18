import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

  // Create a service role client for admin operations
  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Get user from auth
    const {
      data: { user },
      error,
    } = await serviceClient.auth.admin.getUserById(userId)

    if (error) {
      console.error("Error fetching auth user:", error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in get-auth-user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
