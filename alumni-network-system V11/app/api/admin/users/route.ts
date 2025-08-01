import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const searchQuery = request.nextUrl.searchParams.get("search") || ""

    // Call the backend API to get users
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const response = await fetch(`${backendUrl}/api/admin/users?search=${encodeURIComponent(searchQuery)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch users" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      users: data.users || [],
      total: data.total || 0,
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 