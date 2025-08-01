"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Mail, Users, CheckCircle, AlertCircle, Activity, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useGetAdminUsersQuery } from "@/lib/api/adminApi"
import { useSendEmailMutation } from "@/lib/api/emailsApi"

interface EmailResponse {
  success: boolean
  message: string
  emailResults: {
    sent: number
    failed: number
  }
  notificationResults: {
    sent: number
    failed: number
  }
  totalRecipients: number
}

export default function SendEmailPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipientType, setRecipientType] = useState("all")
  const [result, setResult] = useState<EmailResponse | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserSearch, setShowUserSearch] = useState(false)
  const { toast } = useToast()

  // Use RTK Query for sending emails
  const [sendEmail, { isLoading: isSendingEmail }] = useSendEmailMutation()

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      })
      return
    }

    setResult(null)

    try {
      // Prepare email data based on recipient type
      let emailData: any = {
        subject: subject.trim(),
        message: message.trim(),
        recipientType,
        sendEmail: true,
        sendNotification: true,
      }

      // Add specific fields based on recipient type
      if (recipientType === "specific") {
        // For specific user, we need to get the user's email from selectedUsers
        const selectedUser = users.find(user => selectedUsers.includes(user._id))
        if (selectedUser) {
          emailData.specificUser = selectedUser.email
        }
      } else if (recipientType === "multiple") {
        emailData.selectedUsers = selectedUsers
      } else if (recipientType === "email") {
        // For direct email input, treat as specific user
        emailData.recipientType = "specific"
        emailData.specificUser = emailInput.trim()
      }

      const data = await sendEmail(emailData).unwrap()

      setResult(data)
      toast({
        title: "Success",
        description: `Email sent to ${data.totalRecipients} recipients`,
      })
      
      // Clear form on success
      setSubject("")
      setMessage("")
      setSelectedUsers([])
      setEmailInput("")
    } catch (error: any) {
      console.error("Send email error:", error)
      console.error("Error details:", error?.data)
      toast({
        title: "Error",
        description: error?.data?.message || error?.data?.errors?.[0]?.msg || "Failed to send email",
        variant: "destructive",
      })
    }
  }

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case "all":
        return "All Alumni"
      case "students":
        return "All Students"
      case "specific":
        return "Specific User"
      case "multiple":
        return "Multiple Users"
      case "email":
        return "Email Address"
      default:
        return "All Alumni"
    }
  }

  // Use RTK Query for fetching users
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    page: 1,
    limit: 100, // Get more users for selection
    search: searchQuery || undefined,
  }, {
    skip: !showUserSearch, // Only fetch when dropdown is open
  })

  // Extract users from response
  const users = usersResponse?.data || []

  // Handle user selection
  const handleUserSelect = (userId: string, userEmail: string) => {
    if (recipientType === "specific") {
      setSelectedUsers([userId])
    } else if (recipientType === "multiple") {
      if (!selectedUsers.includes(userId)) {
        setSelectedUsers([...selectedUsers, userId])
      }
    }
    setShowUserSearch(false)
    setSearchQuery("")
  }

  // Handle email input
  const handleEmailInput = (email: string) => {
    setEmailInput(email)
  }

  // Remove selected user
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(id => id !== userId))
  }

  // Get selected user details
  const getSelectedUserDetails = () => {
    return users.filter(user => selectedUsers.includes(user._id))
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Send Email to Alumni
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Send emails to all alumni or specific groups of users
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Activity className="h-3 w-3 mr-1" />
                    Email System Ready
                  </Badge>
                </div>
              </div>
            </div>

            {/* Email Form */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Mail className="h-5 w-5" />
                  Compose Email
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Write your message and choose who to send it to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label htmlFor="recipientType" className="text-slate-700 dark:text-slate-300">Send to:</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger className="border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Choose recipients" />
                    </SelectTrigger>
                    <SelectContent>
                                           <SelectItem value="all">All Alumni</SelectItem>
                     <SelectItem value="students">All Students</SelectItem>
                     <SelectItem value="specific">Specific User</SelectItem>
                     <SelectItem value="multiple">Multiple Users</SelectItem>
                     <SelectItem value="email">Email Address</SelectItem>
                    </SelectContent>
                                     </Select>
                 </div>

                 {/* User Selection for Specific/Multiple Users */}
                 {(recipientType === "specific" || recipientType === "multiple") && (
                   <div className="space-y-3">
                     <Label className="text-slate-700 dark:text-slate-300">
                       {recipientType === "specific" ? "Select User:" : "Select Users:"}
                     </Label>
                     
                     {/* Selected Users Display */}
                     {selectedUsers.length > 0 && (
                       <div className="space-y-2">
                         <Label className="text-sm text-slate-600 dark:text-slate-400">
                           Selected Users ({selectedUsers.length}):
                         </Label>
                                                   <div className="flex flex-wrap gap-2">
                            {getSelectedUserDetails().map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-200 dark:border-blue-800"
                              >
                                <span>{user.firstName} {user.lastName} ({user.email})</span>
                                <button
                                  onClick={() => removeSelectedUser(user._id)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                       </div>
                     )}

                     {/* User Search */}
                     <div className="relative">
                       <div className="flex gap-2">
                                                   <Input
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-slate-200 dark:border-slate-700"
                            onFocus={() => {
                              setShowUserSearch(true)
                            }}
                          />
                         <Button
                           type="button"
                           variant="outline"
                                                       onClick={() => {
                              setShowUserSearch(!showUserSearch)
                            }}
                           className="border-slate-200 dark:border-slate-700"
                         >
                           <Search className="h-4 w-4" />
                         </Button>
                       </div>

                       {/* User Search Results */}
                       {showUserSearch && (
                         <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                           {isLoadingUsers ? (
                             <div className="p-4 text-center text-slate-600 dark:text-slate-400">
                               <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                               Loading users...
                             </div>
                           ) : users.length > 0 ? (
                             <div className="py-2">
                                                               {users.map((user) => (
                                  <button
                                    key={user._id}
                                    onClick={() => handleUserSelect(user._id, user.email)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  >
                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                  </button>
                                ))}
                             </div>
                           ) : (
                             <div className="p-4 text-center text-slate-600 dark:text-slate-400">
                               No users found
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Email Input for Direct Email */}
                 {recipientType === "email" && (
                   <div className="space-y-2">
                     <Label htmlFor="emailInput" className="text-slate-700 dark:text-slate-300">
                       Email Address:
                     </Label>
                     <Input
                       id="emailInput"
                       type="email"
                       placeholder="Enter email address (e.g., user@example.com)"
                       value={emailInput}
                       onChange={(e) => handleEmailInput(e.target.value)}
                       className="border-slate-200 dark:border-slate-700"
                     />
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       You can enter multiple email addresses separated by commas
                     </p>
                   </div>
                 )}

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-700 dark:text-slate-300">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSendingEmail}
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-700 dark:text-slate-300">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    disabled={isSendingEmail}
                    className="resize-none border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Send Button */}
                                                   <Button
                    onClick={handleSendEmail}
                    disabled={
                      isSendingEmail || 
                      !subject.trim() || 
                      !message.trim() ||
                      (recipientType === "specific" && selectedUsers.length === 0) ||
                      (recipientType === "multiple" && selectedUsers.length === 0) ||
                      (recipientType === "email" && !emailInput.trim()) ||
                      (recipientType === "email" && !emailInput.includes("@"))
                    }
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
                    size="lg"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email to {getRecipientTypeLabel(recipientType)}
                      </>
                    )}
                  </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Email Sent Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.totalRecipients}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Total Recipients</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {result.emailResults.sent}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Emails Sent</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {result.notificationResults.sent}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Notifications Sent</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {result.emailResults.failed + result.notificationResults.failed}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Total Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Users className="h-5 w-5" />
                  Tips for Better Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p>• Keep subject lines clear and concise</p>
                  <p>• Use a friendly, professional tone</p>
                  <p>• Include a clear call-to-action when needed</p>
                  <p>• Test with a small group before sending to all alumni</p>
                  <p>• Check your email content for typos before sending</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 