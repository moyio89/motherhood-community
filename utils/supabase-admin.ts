import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper function to get all user emails with notification preferences
async function getUserEmailsWithPreference(supabase: any, preferenceField: string) {
  // First get all users with notification settings
  const { data: settings, error: settingsError } = await supabase
    .from("user_notification_settings")
    .select(`user_id, ${preferenceField}`)
    .eq(preferenceField, true)

  if (settingsError) {
    console.error(`Error fetching users with ${preferenceField}:`, settingsError)
    return []
  }

  // Get user IDs who want this notification
  const userIds = settings.map((setting) => setting.user_id)

  if (userIds.length === 0) {
    return []
  }

  // Get emails for these users
  const { data: users, error: usersError } = await supabase.from("auth.users").select("email").in("id", userIds)

  if (usersError || !users) {
    console.error("Error fetching user emails with preferences:", usersError)
    return []
  }

  return users.map((user) => user.email)
}

export { getUserEmailsWithPreference }
