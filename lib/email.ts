import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail({ from, to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    console.log("Email sent successfully:", data)
    return data
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export { sendEmail }
