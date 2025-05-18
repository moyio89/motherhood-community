import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { sendEmail } from "@/lib/email"
import { userWantsNotification } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const comment = String(formData.get("comment"))
  const postId = String(formData.get("postId"))
  const authorId = String(formData.get("authorId"))
  const postTitle = String(formData.get("postTitle"))

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if the author wants comment notifications
    const wantsNotification = await userWantsNotification(supabase, authorId, "email_comments")
    if (!wantsNotification) {
      return NextResponse.json({ success: true, message: "Author has disabled comment notifications" })
    }

    // Fetch the author's email from auth.users table using the service role client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(authorId)

    if (authError) {
      console.error("Error fetching author email:", authError)
      return NextResponse.json({ error: "Failed to fetch author email" }, { status: 500 })
    }

    const authorEmail = authUser.user?.email

    if (!authorEmail) {
      console.error("Author email not found")
      return NextResponse.json({ error: "Author email not found" }, { status: 400 })
    }

    const res = await sendEmail({
      from: "منصة الأمومة <notifications@updates.motherhoodclub.net>",
      to: authorEmail,
      subject: `تعليق جديد على موضوعك: ${postTitle}`,
      html: `
     <!DOCTYPE html>
     <html dir="rtl" lang="ar">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>تعليق جديد</title>
     </head>
     <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; color: #333;">
       <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
         <!-- Header with Logo -->
         <div style="background-color: #f8f2f7; padding: 20px; text-align: center; border-bottom: 1px solid #eaeaea;">
           <img src="/images/motherhood-logo.png" alt="منصة الأمومة" style="max-width: 180px; height: auto;">
         </div>
         
         <!-- Email Content -->
         <div style="padding: 30px; text-align: right;">
           <h2 style="color: #9c27b0; margin-bottom: 20px; font-size: 24px;">مرحباً،</h2>
           <p style="margin-bottom: 20px; line-height: 1.6; font-size: 16px;">تمت إضافة تعليق جديد على موضوعك: <strong>${postTitle}</strong></p>
           
           <div style="background-color: #f8f2f7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
             <h3 style="color: #9c27b0; margin-top: 0; margin-bottom: 15px; font-size: 18px;">نص التعليق:</h3>
             <p style="font-size: 16px; line-height: 1.6;">${comment}</p>
           </div>
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${requestUrl.origin}/community/topic/${postId}" style="background-color: #9c27b0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">عرض الموضوع</a>
           </div>
         </div>
         
         <!-- Footer -->
         <div style="background-color: #f8f2f7; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eaeaea;">
           <p>فريق منصة الأمومة</p>
           <div style="margin-top: 15px; font-size: 12px; color: #888;">
             <p>© 2025 منصة الأمومة. جميع الحقوق محفوظة.</p>
           </div>
         </div>
       </div>
     </body>
     </html>
     `,
    })

    if (res?.error) {
      console.error("Failed to send email", res.error)
      return NextResponse.error()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
