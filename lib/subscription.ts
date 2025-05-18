import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getUserSubscription(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching subscription:", error)
    return null
  }

  return data
}

export function isSubscriptionActive(subscription: any) {
  if (!subscription) return false

  const isStatusActive = subscription.status === "active" || subscription.status === "trialing"
  const isNotExpired = new Date(subscription.current_period_end) > new Date()

  return isStatusActive && isNotExpired
}
