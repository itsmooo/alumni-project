"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, Users, Shield, Zap } from "lucide-react"
import { useLoginMutation } from "@/lib/api/authApi"
import { setAuthFromStorage } from "@/lib/slices/authSlice"
import { type RootState } from "@/lib/store"
import Link from "next/link"
import { motion } from "motion/react"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useDispatch()
  const router = useRouter()
  
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "moderator") {
        router.push("/moderator/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await login({ identifier, password }).unwrap()
      
      // Save to localStorage
      localStorage.setItem("token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
      
      // Update Redux store
      dispatch(setAuthFromStorage({ user: result.user, token: result.token }))

      // Redirect based on user role
      if (result.user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (result.user.role === "moderator") {
        router.push("/moderator/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      // Error is handled by RTK Query
      console.error("Login failed:", err)
    }
  }

  // Show loading state if already authenticated (redirecting)
  if (isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-gray-600">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-200/30 rounded-full blur-xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sign in to your alumni network
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {typeof error === "string" ? error : "Login failed. Please try again."}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="identifier" className="text-gray-700 font-medium">
                  Email or Phone
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-12 border-gray-200 bg-gray-100 text-black focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-100 text-black border-gray-200 focus:border-blue-500 focus:ring-gray-200 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="mr-2 h-5 w-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center space-y-3"
              >
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 block"
                >
                  Forgot your password?
                </Link>
                <div className="text-sm text-gray-600">
                  {"Don't have an account? "}
                  <Link 
                    href="/auth/register" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto"
      >
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600">Secure</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">Fast</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xs text-gray-600">Connected</p>
        </div>
      </motion.div>
    </div>
  )
}
