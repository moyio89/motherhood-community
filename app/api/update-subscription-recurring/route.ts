import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { isRecurring } = await request.json()

    // Get the user from Supabase
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the user's subscription
    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !subscription) {
      return NextResponse.json({ message: "No subscription found" }, { status: 404 })
    }

    // If it's a Stripe subscription, update it
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: !isRecurring,
      })
    }

    // Update the subscription in the database
    await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: !isRecurring,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating subscription recurring status:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
