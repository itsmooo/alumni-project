"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store"
import { isTokenValid, getTokenFromStorage, getUserFromStorage } from "@/lib/utils/tokenUtils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function AuthTest() {
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [localToken, setLocalToken] = useState<string | null>(null)
  const [localUser, setLocalUser] = useState<any>(null)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Check localStorage directly
    const storedToken = getTokenFromStorage()
    const storedUser = getUserFromStorage()
    
    setLocalToken(storedToken)
    setLocalUser(storedUser)
    setTokenValid(storedToken ? isTokenValid(storedToken) : false)
  }, [])

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Checking..."
    return status ? "Valid" : "Invalid/Expired"
  }

  const clearStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status Test</CardTitle>
          <CardDescription>
            Debug information about the current authentication state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Redux State */}
          <div className="space-y-2">
            <h3 className="font-semibold">Redux State:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                {getStatusIcon(isAuthenticated)}
                <span>Authenticated: {isAuthenticated ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(!!user)}
                <span>User: {user ? "Present" : "None"}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(!!token)}
                <span>Token: {token ? "Present" : "None"}</span>
              </div>
              {user && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{user.role}</Badge>
                  <span>Role: {user.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* LocalStorage State */}
          <div className="space-y-2">
            <h3 className="font-semibold">LocalStorage State:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                {getStatusIcon(!!localToken)}
                <span>Token: {localToken ? "Present" : "None"}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(!!localUser)}
                <span>User: {localUser ? "Present" : "None"}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(tokenValid)}
                <span>Token Valid: {getStatusText(tokenValid)}</span>
              </div>
              {localUser && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{localUser.role}</Badge>
                  <span>Role: {localUser.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Actions:</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={clearStorage}>
                Clear Storage
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Debug Info:</h3>
              <details className="text-xs">
                <summary className="cursor-pointer">Show Token (if exists)</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {localToken ? localToken.substring(0, 50) + "..." : "No token"}
                </pre>
              </details>
              <details className="text-xs">
                <summary className="cursor-pointer">Show User Data (if exists)</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {localUser ? JSON.stringify(localUser, null, 2) : "No user data"}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 