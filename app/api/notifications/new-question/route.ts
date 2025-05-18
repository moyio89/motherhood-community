import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { getUserEmailsWithPreference } from "@/utils/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const ticket = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get all user emails
    // const userEmails = await getAllUserEmails(supabase);
    const userEmails = await getUserEmailsWithPreference(supabase, "email_new_questions")

    // Send email to all users
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Support <support@acme.com>",
        to: userEmails,
        subject: "New Question Posted",
        html: `<p>A new question has been posted: <strong>${ticket.title}</strong></p><p>Please check it out!</p>`,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log("Email sent successfully!")
      return NextResponse.json({ data })
    } else {
      console.error("Failed to send email:", res.status, res.statusText)
      const errorData = await res.json()
      console.error("Error details:", errorData)
      return NextResponse.error()
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.error()
  }
}
