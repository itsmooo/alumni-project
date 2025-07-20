"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "moderator") {
        router.push("/moderator/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  // Show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Redirecting...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Network</h1>
          <p className="text-gray-600">Connect with your fellow alumni</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
