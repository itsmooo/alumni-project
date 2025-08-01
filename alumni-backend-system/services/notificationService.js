const nodemailer = require("nodemailer")

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})



// Send email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log("Email sent:", result.messageId)
    return result
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}



// Send bulk email
const sendBulkEmail = async (recipients, { subject, html, text }) => {
  try {
    const promises = recipients.map((recipient) => sendEmail({ to: recipient, subject, html, text }))

    const results = await Promise.allSettled(promises)

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return { successful, failed, results }
  } catch (error) {
    console.error("Bulk email error:", error)
    throw error
  }
}



module.exports = {
  sendEmail,
  sendBulkEmail,
}
