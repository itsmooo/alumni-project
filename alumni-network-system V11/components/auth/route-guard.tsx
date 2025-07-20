"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { setAuthFromStorage } from "@/lib/slices/authSlice"
import { isTokenValid, getTokenFromStorage, getUserFromStorage, clearAuthStorage } from "@/lib/utils/tokenUtils"
import { type RootState } from "@/lib/store"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "moderator" | "alumni"
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  redirectTo = "/auth/login" 
}: RouteGuardProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // If already authenticated, check role
        if (isAuthenticated && user && token) {
          if (hasRequiredRole(user.role, requiredRole)) {
            setIsLoading(false)
            return
          } else {
            // User doesn't have required role, redirect to appropriate dashboard
            redirectToUserDashboard(user.role)
            return
          }
        }

        // Check localStorage for token
        const storedToken = getTokenFromStorage()
        const storedUser = getUserFromStorage()

        if (storedToken && storedUser && storedToken.length > 10) {
          // Quick validation - set auth state immediately
          dispatch(setAuthFromStorage({ user: storedUser, token: storedToken }))
          
          if (hasRequiredRole(storedUser.role, requiredRole)) {
            setIsLoading(false)
          } else {
            redirectToUserDashboard(storedUser.role)
          }
        } else {
          clearAuthStorage()
          router.push(redirectTo)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        clearAuthStorage()
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    // Immediate check without delay
    checkAuth()
  }, [isAuthenticated, user, token, requiredRole, router, redirectTo, dispatch])

  const hasRequiredRole = (userRole: string, requiredRole?: string): boolean => {
    if (!requiredRole) return true
    
    const roleHierarchy = {
      admin: 3,
      moderator: 2,
      alumni: 1
    }
    
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
  }

  const redirectToUserDashboard = (userRole: string) => {
    if (userRole === "admin") {
      router.push("/admin/dashboard")
    } else if (userRole === "moderator") {
      router.push("/moderator/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Access...
            </h2>
            <p className="text-gray-600">Verifying your permissions</p>
          </div>
        </div>
      </div>
    )
  }

  // If we reach here, user is authenticated and has proper role
  return <>{children}</>
} 