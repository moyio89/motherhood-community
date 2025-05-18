import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { activeSubscriptionId } = await request.json()

    // Get the user from Supabase
    const cookieSupabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await cookieSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .neq("id", activeSubscriptionId)

    if (error) {
      throw error
    }

    // Delete all subscriptions except the active one
    if (subscriptions && subscriptions.length > 0) {
      const subscriptionIds = subscriptions.map((sub) => sub.id)

      const { error: deleteError } = await supabase.from("user_subscriptions").delete().in("id", subscriptionIds)

      if (deleteError) {
        throw deleteError
      }

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${subscriptions.length} duplicate subscriptions`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "No duplicate subscriptions found",
    })
  } catch (error) {
    console.error("Error cleaning up subscriptions:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
