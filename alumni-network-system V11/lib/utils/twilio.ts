// Twilio SMS integration utilities
export interface SMSMessage {
  to: string
  body: string
  from?: string
}

export interface SMSResponse {
  sid: string
  status: string
  errorCode?: string
  errorMessage?: string
}

export class TwilioService {
  private static instance: TwilioService
  private accountSid: string
  private authToken: string
  private fromNumber: string

  private constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ""
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ""
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ""
  }

  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService()
    }
    return TwilioService.instance
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: message.to,
          body: message.body,
          from: message.from || this.fromNumber,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send SMS")
      }

      return await response.json()
    } catch (error) {
      console.error("SMS sending failed:", error)
      throw error
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    try {
      const response = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        throw new Error("Failed to send bulk SMS")
      }

      return await response.json()
    } catch (error) {
      console.error("Bulk SMS sending failed:", error)
      throw error
    }
  }

  async verifyPhoneNumber(phoneNumber: string): Promise<{ verificationSid: string }> {
    try {
      const response = await fetch("/api/sms/verify/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error("Failed to start phone verification")
      }

      return await response.json()
    } catch (error) {
      console.error("Phone verification failed:", error)
      throw error
    }
  }

  async checkVerificationCode(phoneNumber: string, code: string): Promise<{ status: string }> {
    try {
      const response = await fetch("/api/sms/verify/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify code")
      }

      return await response.json()
    } catch (error) {
      console.error("Code verification failed:", error)
      throw error
    }
  }
}

// SMS Templates
export const smsTemplates = {
  eventReminder: (eventName: string, date: string) =>
    `Reminder: ${eventName} is coming up on ${date}. Don't forget to attend!`,

  eventRegistration: (eventName: string) =>
    `You've successfully registered for ${eventName}. We'll send you more details soon.`,

  passwordReset: (code: string) => `Your password reset code is: ${code}. This code expires in 10 minutes.`,

  phoneVerification: (code: string) =>
    `Your verification code is: ${code}. Enter this code to verify your phone number.`,

  paymentConfirmation: (amount: string, purpose: string) =>
    `Payment confirmed! You've successfully paid ${amount} for ${purpose}.`,

  announcementAlert: (title: string) => `New announcement: ${title}. Check the alumni portal for more details.`,
}
