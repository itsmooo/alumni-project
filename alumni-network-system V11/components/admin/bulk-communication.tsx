"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Send, Users, Mail, MessageSquare, Bell, AlertCircle, CheckCircle, 
  Clock, Calendar as CalendarIcon, FileText, BarChart3, Eye, 
  Settings, Save, Copy, Trash2, Filter, Search, Download,
  Zap, Target, TrendingUp, Activity, Globe, Smartphone, MessageSquare as MessageSquareIcon
} from "lucide-react"
import { useSendBulkNotificationMutation } from "@/lib/api/adminApi"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface NotificationResult {
  id: string
  sent: number
  failed: number
  type: string
  subject: string
  timestamp: string
  recipients: number
  openRate?: number
  clickRate?: number
  status: "sent" | "scheduled" | "draft" | "failed"
}

interface Template {
  id: string
  name: string
  type: "email" | "sms" | "push"
  subject: string
  content: string
  category: string
  lastUsed?: string
}

interface ScheduledMessage {
  id: string
  type: "email" | "sms" | "push"
  subject: string
  message: string
  scheduledFor: Date
  recipients: string[]
  status: "scheduled" | "sent" | "cancelled"
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Welcome New Alumni",
    type: "email",
    subject: "Welcome to the Alumni Network!",
    content: "Dear {firstName},\n\nWelcome to our alumni network! We're excited to have you join our community of graduates.\n\nBest regards,\nAlumni Team",
    category: "Welcome"
  },
  {
    id: "2",
    name: "Event Reminder",
    type: "email",
    subject: "Don't Miss: {eventName} - {eventDate}",
    content: "Hi {firstName},\n\nThis is a friendly reminder about the upcoming event: {eventName}\n\nDate: {eventDate}\nLocation: {eventLocation}\n\nWe look forward to seeing you there!",
    category: "Events"
  },
  {
    id: "3",
    name: "Newsletter Update",
    type: "email",
    subject: "Alumni Newsletter - {month} {year}",
    content: "Dear Alumni,\n\nHere's what's happening in our community this month:\n\n• Recent achievements\n• Upcoming events\n• New job opportunities\n\nStay connected!",
    category: "Newsletter"
  },
  {
    id: "4",
    name: "Job Alert",
    type: "sms",
    subject: "New Job Opportunity",
    content: "New job posted: {jobTitle} at {company}. Check your alumni portal for details!",
    category: "Jobs"
  },
  {
    id: "5",
    name: "Emergency Alert",
    type: "push",
    subject: "Important Notice",
    content: "Important update from the Alumni Office. Please check your email for details.",
    category: "Emergency"
  }
]

export function BulkCommunication() {
  const [activeTab, setActiveTab] = useState("compose")
  const [communicationType, setCommunicationType] = useState<"email" | "sms" | "push">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("09:00")
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
  const [results, setResults] = useState<NotificationResult[]>([])
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [previewMode, setPreviewMode] = useState(false)
  
  // Advanced targeting
  const [targetAudience, setTargetAudience] = useState<{
    all: boolean
    roles: string[]
    graduationYears: number[]
    locations: string[]
    industries: string[]
    specificUsers: string[]
    customFilters: Record<string, any>
  }>({
    all: true,
    roles: [],
    graduationYears: [],
    locations: [],
    industries: [],
    specificUsers: [],
    customFilters: {},
  })

  const [sendBulkNotification, { isLoading }] = useSendBulkNotificationMutation()

  // Load saved drafts and scheduled messages
  useEffect(() => {
    // In a real app, this would load from API
    const savedDrafts = localStorage.getItem("communication-drafts")
    const savedScheduled = localStorage.getItem("scheduled-messages")
    
    if (savedScheduled) {
      setScheduledMessages(JSON.parse(savedScheduled))
    }
  }, [])

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      return
    }

    try {
      const recipientCount = getEstimatedRecipientsCount()
      
      if (isScheduled && scheduledDate) {
        // Schedule the message
        const newScheduled: ScheduledMessage = {
          id: Date.now().toString(),
          type: communicationType,
          subject,
          message,
          scheduledFor: new Date(`${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`),
          recipients: targetAudience.all ? ["all"] : [...targetAudience.roles, ...targetAudience.locations],
          status: "scheduled"
        }
        
        setScheduledMessages(prev => [...prev, newScheduled])
        localStorage.setItem("scheduled-messages", JSON.stringify([...scheduledMessages, newScheduled]))
        
        setResults((prev) => [
          {
            id: Date.now().toString(),
            sent: 0,
            failed: 0,
            type: communicationType,
            subject,
            timestamp: new Date().toISOString(),
            recipients: recipientCount,
            status: "scheduled"
          },
          ...prev.slice(0, 9),
        ])
      } else {
        // Send immediately
        const result = await sendBulkNotification({
          recipients: targetAudience.all ? ["all"] : targetAudience.roles,
          type: communicationType,
          subject,
          message,
        }).unwrap()

        setResults((prev) => [
          {
            id: Date.now().toString(),
            sent: result.sent || recipientCount,
            failed: result.success ? 0 : 1,
            type: communicationType,
            subject,
            timestamp: new Date().toISOString(),
            recipients: recipientCount,
            openRate: Math.random() * 100,
            clickRate: Math.random() * 50,
            status: "sent"
          },
          ...prev.slice(0, 9),
        ])
      }

      // Clear form
      setSubject("")
      setMessage("")
      setIsScheduled(false)
      setScheduledDate(undefined)
    } catch (error) {
      console.error("Failed to send notification:", error)
      setResults((prev) => [
        {
          id: Date.now().toString(),
          sent: 0,
          failed: 1,
          type: communicationType,
          subject,
          timestamp: new Date().toISOString(),
          recipients: getEstimatedRecipientsCount(),
          status: "failed"
        },
        ...prev.slice(0, 9),
      ])
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.content)
      setCommunicationType(template.type)
      setSelectedTemplate(templateId)
    }
  }

  const saveAsTemplate = () => {
    if (!subject.trim() || !message.trim()) return

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: subject,
      type: communicationType,
      subject,
      content: message,
      category: "Custom",
      lastUsed: new Date().toISOString()
    }

    setTemplates(prev => [...prev, newTemplate])
  }

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      lastUsed: new Date().toISOString()
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  const handleRoleToggle = (role: string) => {
    setTargetAudience(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
      all: false
    }))
  }

  const handleLocationToggle = (location: string) => {
    setTargetAudience(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location],
      all: false
    }))
  }

  const handleIndustryToggle = (industry: string) => {
    setTargetAudience(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry],
      all: false
    }))
  }

  const handleGraduationYearToggle = (year: number) => {
    setTargetAudience(prev => ({
      ...prev,
      graduationYears: prev.graduationYears.includes(year)
        ? prev.graduationYears.filter(y => y !== year)
        : [...prev.graduationYears, year],
      all: false
    }))
  }

  const getEstimatedRecipientsCount = () => {
    if (targetAudience.all) return 1250 // Total alumni count
    return targetAudience.roles.length * 200 + targetAudience.locations.length * 150
  }

  const getEstimatedRecipients = () => {
    if (targetAudience.all) return "All Alumni (1,250)"
    const roleCount = targetAudience.roles.length * 200
    const locationCount = targetAudience.locations.length * 150
    return `${roleCount + locationCount} recipients`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "draft": return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400"
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />
      case "sms": return <MessageSquare className="h-4 w-4" />
      case "push": return <Bell className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <MessageSquareIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Bulk Communication
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Send messages to multiple recipients at once
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                <Activity className="h-3 w-3 mr-1" />
                {getEstimatedRecipientsCount()} Recipients
              </Badge>
              <Button variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger 
            value="compose" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Message Composition */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Compose Message
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Create and send your communication
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Communication Type Selection */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button
                      variant={communicationType === "email" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-2",
                        communicationType === "email" 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setCommunicationType("email")}
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-sm font-medium">Email</span>
                    </Button>
                    <Button
                      variant={communicationType === "sms" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-2",
                        communicationType === "sms" 
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg" 
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setCommunicationType("sms")}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-sm font-medium">SMS</span>
                    </Button>
                    <Button
                      variant={communicationType === "push" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-2",
                        communicationType === "push" 
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg" 
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setCommunicationType("push")}
                    >
                      <Bell className="h-5 w-5" />
                      <span className="text-sm font-medium">Push</span>
                    </Button>
                  </div>

                  {/* Message Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject Line
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter your subject line..."
                        className="mt-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message Content
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows={8}
                        className="mt-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Scheduling Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isScheduled}
                          onCheckedChange={setIsScheduled}
                        />
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Schedule for later
                        </Label>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {getEstimatedRecipients()}
                      </Badge>
                    </div>

                    {isScheduled && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full mt-2 justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Time
                          </Label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="mt-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendNotification}
                    disabled={isLoading || !subject.trim() || !message.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {isScheduled ? "Schedule Message" : "Send Message"}
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Audience Targeting */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Target Audience
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Select your recipients
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-users"
                        checked={targetAudience.all}
                        onCheckedChange={(checked) => 
                          setTargetAudience(prev => ({ ...prev, all: checked as boolean }))
                        }
                      />
                      <Label htmlFor="all-users" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        All Alumni (1,250)
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      By Role
                    </Label>
                    {["Alumni", "Moderator", "Admin"].map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={role}
                          checked={targetAudience.roles.includes(role)}
                          onCheckedChange={() => handleRoleToggle(role)}
                        />
                        <Label htmlFor={role} className="text-sm text-slate-600 dark:text-slate-400">
                          {role}s
                        </Label>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      By Location
                    </Label>
                    {["New York", "Los Angeles", "Chicago", "Houston"].map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={location}
                          checked={targetAudience.locations.includes(location)}
                          onCheckedChange={() => handleLocationToggle(location)}
                        />
                        <Label htmlFor={location} className="text-sm text-slate-600 dark:text-slate-400">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      Message Templates
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Pre-built templates for common communications
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTemplateSelect(template.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateTemplate(template)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {template.subject}
                      </p>
                      {template.lastUsed && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          Last used: {format(new Date(template.lastUsed), "MMM d, yyyy")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      Communication History
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Track your sent messages and their performance
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 border-slate-200 dark:border-slate-700"
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getTypeIcon(result.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {result.subject}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(result.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {result.sent} sent
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {result.recipients} recipients
                        </p>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                      No Communication History
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Your sent messages will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
