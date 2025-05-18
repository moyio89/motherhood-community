import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// Helper function to check if user wants a specific notification
async function userWantsNotification(supabase: any, userId: string, preferenceField: string) {
  const { data, error } = await supabase
    .from("user_notification_settings")
    .select(preferenceField)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    // Default to true if no settings found
    return true
  }

  return data[preferenceField]
}

export { userWantsNotification }
