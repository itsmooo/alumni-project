"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { setAuthFromStorage } from "@/lib/slices/authSlice"
import { isTokenValid, getTokenFromStorage, getUserFromStorage, clearAuthStorage } from "@/lib/utils/tokenUtils"
import { type RootState } from "@/lib/store"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: "admin" | "moderator" | "alumni"
  fallbackPath?: string
}

export function AuthGuard({ 
  children, 
  requiredRole = "alumni", 
  fallbackPath = "/auth/login" 
}: AuthGuardProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // If already authenticated, check role
        if (isAuthenticated && user) {
          if (hasRequiredRole(user.role, requiredRole)) {
            setIsChecking(false)
            return
          } else {
            // User doesn't have required role, redirect to appropriate dashboard
            redirectToUserDashboard(user.role)
            return
          }
        }

        // Check localStorage for token
        const token = getTokenFromStorage()
        const storedUser = getUserFromStorage()

        if (token && storedUser && token.length > 10) {
          // Quick validation - set auth state immediately
          dispatch(setAuthFromStorage({ user: storedUser, token }))
          
          if (hasRequiredRole(storedUser.role, requiredRole)) {
            setIsChecking(false)
          } else {
            redirectToUserDashboard(storedUser.role)
          }
        } else {
          clearAuthStorage()
          router.push(fallbackPath)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        clearAuthStorage()
        router.push(fallbackPath)
      } finally {
        setIsChecking(false)
      }
    }

    // Immediate check without delay
    checkAuth()
  }, [isAuthenticated, user, router, dispatch, requiredRole, fallbackPath])

  const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
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

  if (isChecking) {
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

  return <>{children}</>
} 