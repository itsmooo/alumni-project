"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Bug,
  Shield,
  Zap
} from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
                <div className="absolute inset-0 bg-red-200/30 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Something went wrong!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  We encountered an unexpected error. Our team has been notified and is working to fix it.
                </p>
              </div>

              {/* Error Details */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bug className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">Error Details</h3>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Error:</strong> {error.message || "Unknown error occurred"}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-gray-500">
                        <strong>Error ID:</strong> {error.digest}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={reset}
                  size="lg" 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Try Again
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              {/* Help Section */}
              <div className="mt-8">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-800">Need Help?</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      If this error persists, please contact our support team with the error details above.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Zap className="mr-2 h-4 w-4" />
                        Contact Support
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bug className="mr-2 h-4 w-4" />
                        Report Bug
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Status: Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Support: Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 