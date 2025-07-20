"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setAuthFromStorage } from "@/lib/slices/authSlice"
import { isTokenValid, getTokenFromStorage, getUserFromStorage, clearAuthStorage } from "@/lib/utils/tokenUtils"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        // Get token and user from localStorage
        const token = getTokenFromStorage()
        const user = getUserFromStorage()

        // Quick validation - check if token exists and has basic structure
        if (token && user && token.length > 10) {
          // Set auth state immediately for faster response
          dispatch(setAuthFromStorage({ user, token }))
          
          // Redirect based on user role
          if (user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (user.role === "moderator") {
            router.push("/moderator/dashboard")
          } else {
            router.push("/dashboard")
          }
        } else {
          // No valid auth, redirect to login
          clearAuthStorage()
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        clearAuthStorage()
        router.push("/auth/login")
      } finally {
        setIsChecking(false)
      }
    }

    // Immediate check without delay for faster response
    checkAuthAndRedirect()
  }, [router, dispatch])

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Alumni Network System
            </h2>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  // This should never be reached as we redirect in useEffect
  return null
} 