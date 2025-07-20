"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Key, User, RefreshCw, AlertTriangle } from "lucide-react"
import type { RootState } from "@/lib/store"

interface AuthDebugProps {
  error?: any
  showAlways?: boolean
}

export function AuthDebug({ error, showAlways = false }: AuthDebugProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const authState = useSelector((state: RootState) => state.auth)
  
  const testApiConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('http://localhost:5000/api/announcements/admin/statistics', {
        headers: {
          'Authorization': authState.token ? `Bearer ${authState.token}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ API Connection Successful! Data received: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorData = await response.text()
        setTestResult(`❌ API Error (${response.status}): ${errorData}`)
      }
    } catch (error) {
      setTestResult(`❌ Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Only show in development or when there's an error
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  // Hide if no error and not forced to show always
  if (!error && !showAlways) {
    return null
  }
  
  return (
    <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100/50">
            <CardTitle className="flex items-center gap-2 text-sm text-orange-700">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {error ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  🚨 Authentication Error Debug Panel
                </>
              ) : (
                <>
                  🔧 Development: Authentication Debug Panel
                </>
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error Details:</strong> {error.message || JSON.stringify(error)}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Authentication State
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Logged In:</span>
                    <Badge variant={authState.isAuthenticated ? "default" : "secondary"}>
                      {authState.isAuthenticated ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-mono text-xs">{authState.user?._id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <Badge variant="outline">{authState.user?.role || "N/A"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-xs">{authState.user?.email || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Token Information
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Token Present:</span>
                    <Badge variant={authState.token ? "default" : "destructive"}>
                      {authState.token ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Length:</span>
                    <span className="font-mono text-xs">{authState.token?.length || 0} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Preview:</span>
                    <span className="font-mono text-xs">
                      {authState.token ? `${authState.token.substring(0, 10)}...` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">API Connection Test</h4>
                <Button 
                  size="sm" 
                  onClick={testApiConnection}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test API Connection"
                  )}
                </Button>
              </div>
              
              {testResult && (
                <Alert className={testResult.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                    {testResult}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-xs">
                <strong>Debug Info:</strong> This panel appears when there are authentication errors. 
                If authentication is failing, try logging in again or check your backend setup.
              </AlertDescription>
            </Alert>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
} 