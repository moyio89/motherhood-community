import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the route is an API route
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/") && !req.nextUrl.pathname.startsWith("/api/webhooks")
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
  const isCommunityRoute = req.nextUrl.pathname.startsWith("/community")
  const isSubscriptionRoute = req.nextUrl.pathname === "/community/subscription"

  // For API routes (except webhooks), ensure the user is authenticated
  if (isApiRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  }

  // For community routes (except subscription), check subscription status
  if (isCommunityRoute && !isSubscriptionRoute && !isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single()

    if (
      profile?.is_admin === true ||
      profile?.is_admin === "true" ||
      profile?.is_admin === 1 ||
      profile?.is_admin === "1"
    ) {
      return res // Admins can access all routes
    }

    // Check subscription status
    const { data: subscription } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id).single()

    const isSubscribed =
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing") &&
      new Date(subscription.current_period_end) > new Date()

    // If not subscribed, redirect to subscription page
    if (!isSubscribed) {
      return NextResponse.redirect(new URL("/community/subscription", req.url))
    }
  }

  return res
}

// Update the matcher to exclude the webhook route
export const config = {
  matcher: ["/api/:path*", "/community/:path*", "/((?!api/webhooks).*)"],
}
