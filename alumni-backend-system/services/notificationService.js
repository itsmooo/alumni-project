const nodemailer = require("nodemailer")
const twilio = require("twilio")

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

// SMS configuration (Twilio)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Format phone number to E.164 format
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // If it starts with 0 (local format), assume it's Somali number and add +252
  if (cleaned.startsWith('0')) {
    return `+252${cleaned.substring(1)}`
  }
  
  // If it starts with 252 (without +), add the +
  if (cleaned.startsWith('252')) {
    return `+${cleaned}`
  }
  
  // If it doesn't start with +, add +252 (assuming Somalia)
  if (!phoneNumber.startsWith('+')) {
    return `+252${cleaned}`
  }
  
  // Already has + sign
  return phoneNumber
}

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

// Send SMS with improved error handling
const sendSMS = async ({ to, message }) => {
  try {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(to)
    console.log(`Attempting to send SMS to: ${to} → Formatted: ${formattedPhone}`)
    
    // Validate phone number format
    if (!formattedPhone.startsWith('+') || formattedPhone.length < 10) {
      console.error(`Invalid phone number format: ${formattedPhone}`)
      return null
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    console.log("SMS sent successfully:", result.sid)
    return result
  } catch (error) {
    console.error("SMS sending error:", error)
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo
    })
    // Don't throw error for SMS failures - log and return null
    return null
  }
}

// Send SMS with strict error handling (throws error)
const sendSMSStrict = async ({ to, message }) => {
  try {
    const formattedPhone = formatPhoneNumber(to)
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    console.log("SMS sent:", result.sid)
    return result
  } catch (error) {
    console.error("SMS sending error:", error)
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

// Send bulk SMS
const sendBulkSMS = async (recipients, message) => {
  try {
    const promises = recipients.map((recipient) => sendSMS({ to: recipient, message }))

    const results = await Promise.allSettled(promises)

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return { successful, failed, results }
  } catch (error) {
    console.error("Bulk SMS error:", error)
    throw error
  }
}

module.exports = {
  sendEmail,
  sendSMS,
  sendSMSStrict,
  sendBulkEmail,
  sendBulkSMS,
  formatPhoneNumber,
}
