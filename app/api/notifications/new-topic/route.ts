import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserEmailsWithPreference } from "@/utils/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { topicName, topicDescription } = await request.json()

    if (!topicName || !topicDescription) {
      return new NextResponse("Missing topic name or description", { status: 400 })
    }

    // Get all user emails
    // const userEmails = await getAllUserEmails(supabase);
    const userEmails = await getUserEmailsWithPreference(supabase, "email_new_topics")

    // Send email to all users
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@meetmealfway.com",
        to: userEmails,
        subject: `New topic "${topicName}" created!`,
        html: `<h1>New topic "${topicName}" created!</h1><p>${topicDescription}</p><a href="https://meetmealfway.com/topics">View all topics</a>`,
      }),
    })

    if (!res.ok) {
      console.error("Resend API error:", await res.text())
      return new NextResponse("Failed to send emails", { status: 500 })
    }

    return NextResponse.json({ message: "Emails sent successfully" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
