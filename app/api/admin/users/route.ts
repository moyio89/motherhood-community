import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Regular client for checking admin status
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create a direct Supabase client with service role key for admin operations
    // This is necessary to access auth.users data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError.message)
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    console.log(`Retrieved ${profiles.length} user profiles`)

    // Get all auth users using the admin client with service role
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error("Error fetching auth users:", authError.message)
      // If we can't get auth data, return just the profiles
      return NextResponse.json({
        users: profiles,
        debug: {
          profilesCount: profiles.length,
          authError: authError.message,
          serviceRoleAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      })
    }

    console.log(`Retrieved ${authUsers.users.length} auth users`)

    // Log first few auth users for debugging (without sensitive info)
    if (authUsers.users.length > 0) {
      console.log(
        "First few auth users:",
        authUsers.users.slice(0, 3).map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
        })),
      )
    }

    // Combine the data from both sources
    const combinedUsers = profiles.map((profile) => {
      const authUser = authUsers.users.find((u) => u.id === profile.id)

      return {
        ...profile,
        email: authUser?.email || null,
        phone: authUser?.phone || profile.phone || null,
        last_sign_in_at: authUser?.last_sign_in_at || null,
      }
    })

    // Log a sample combined user for debugging
    if (combinedUsers.length > 0) {
      console.log("Sample combined user:", {
        id: combinedUsers[0].id,
        username: combinedUsers[0].username,
        email: combinedUsers[0].email,
        created_at: combinedUsers[0].created_at,
      })
    }

    return NextResponse.json({
      users: combinedUsers,
      debug: {
        profilesCount: profiles.length,
        authUsersCount: authUsers.users.length,
        combinedCount: combinedUsers.length,
        serviceRoleAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    })
  } catch (error) {
    console.error("Unexpected error in users API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
