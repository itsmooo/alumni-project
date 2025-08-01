import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, message, recipientType, selectedUsers, emailInput, sendEmail, sendNotification } = body

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "Subject and message are required" },
        { status: 400 }
      )
    }

    // Validate recipient selection based on type
    if (recipientType === "specific" || recipientType === "multiple") {
      if (!selectedUsers || selectedUsers.length === 0) {
        return NextResponse.json(
          { success: false, message: "Please select at least one user" },
          { status: 400 }
        )
      }
    }

    if (recipientType === "email") {
      if (!emailInput || !emailInput.trim()) {
        return NextResponse.json(
          { success: false, message: "Please enter an email address" },
          { status: 400 }
        )
      }
    }

    // Get the authorization token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // Call the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const response = await fetch(`${backendUrl}/api/emails/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject,
        message,
        recipientType,
        selectedUsers,
        emailInput,
        sendEmail,
        sendNotification,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to send email" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Send email API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 