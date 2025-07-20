"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Megaphone, 
  FileText, 
  Settings, 
  Users, 
  Star,
  X, 
  Plus,
  Calendar,
  AlertTriangle,
  Target
} from "lucide-react"
import { toast } from "sonner"
import type { Announcement } from "@/lib/api/announcementsApi"
import type { CreateAnnouncementRequest, UpdateAnnouncementRequest } from "@/lib/api/announcementsApi"

const announcementFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  category: z.enum(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isPinned: z.boolean().optional(),
  targetAudience: z.object({
    graduationYears: z.array(z.number()).optional(),
    locations: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
    isPublic: z.boolean(),
  }).optional(),
}).refine(
  (data) => {
    // Validate that expiry date is after publish date
    if (data.publishDate && data.expiryDate) {
      const publishDate = new Date(data.publishDate)
      const expiryDate = new Date(data.expiryDate)
      return expiryDate > publishDate
    }
    return true
  },
  {
    message: "Expiry date must be after publish date",
    path: ["expiryDate"],
  }
)

type AnnouncementFormData = z.infer<typeof announcementFormSchema>

interface AnnouncementFormProps {
  announcement?: Announcement
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAnnouncementRequest | UpdateAnnouncementRequest) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function AnnouncementForm({ announcement, isOpen, onClose, onSubmit, isLoading, error }: AnnouncementFormProps) {
  const [currentGraduationYear, setCurrentGraduationYear] = useState("")
  const [graduationYears, setGraduationYears] = useState<number[]>([])
  const [currentLocation, setCurrentLocation] = useState("")
  const [locations, setLocations] = useState<string[]>([])
  const [currentRole, setCurrentRole] = useState("")
  const [roles, setRoles] = useState<string[]>([])

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      priority: "medium",
      status: "draft",
      publishDate: "",
      expiryDate: "",
      isPinned: false,
      targetAudience: {
        graduationYears: [],
        locations: [],
        roles: [],
        isPublic: true,
      },
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        status: announcement.status,
        publishDate: announcement.publishDate ? new Date(announcement.publishDate).toISOString().slice(0, 16) : "",
        expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().slice(0, 16) : "",
        isPinned: announcement.isPinned,
        targetAudience: announcement.targetAudience || {
          graduationYears: [],
          locations: [],
          roles: [],
          isPublic: true,
        },
      })
      setGraduationYears(announcement.targetAudience?.graduationYears || [])
      setLocations(announcement.targetAudience?.locations || [])
      setRoles(announcement.targetAudience?.roles || [])
    } else {
      // Reset for new announcement
      form.reset({
        title: "",
        content: "",
        category: "general",
        priority: "medium",
        status: "draft",
        publishDate: "",
        expiryDate: "",
        isPinned: false,
        targetAudience: {
          graduationYears: [],
          locations: [],
          roles: [],
          isPublic: true,
        },
      })
      setGraduationYears([])
      setLocations([])
      setRoles([])
    }
  }, [announcement, form])

  const handleSubmit = async (data: AnnouncementFormData) => {
    try {
      console.log("Form data received:", data)
      console.log("Graduation years:", graduationYears)
      console.log("Locations:", locations)
      console.log("Roles:", roles)

      const submitData = {
        ...data,
        // Format dates properly
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
        // Handle target audience
        targetAudience: data.targetAudience?.isPublic === false ? {
          graduationYears: graduationYears.length > 0 ? graduationYears : undefined,
          locations: locations.length > 0 ? locations : undefined,
          roles: roles.length > 0 ? roles : undefined,
          isPublic: false,
        } : {
          isPublic: true,
        },
      }

      console.log("Final submit data:", submitData)
      
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Form submission error:", error)
      // Error handling is done in the parent component
    }
  }

  const addGraduationYear = () => {
    const year = parseInt(currentGraduationYear)
    if (year && year >= 1900 && year <= new Date().getFullYear() + 10 && !graduationYears.includes(year)) {
      setGraduationYears([...graduationYears, year].sort((a, b) => b - a))
      setCurrentGraduationYear("")
    }
  }

  const removeGraduationYear = (yearToRemove: number) => {
    setGraduationYears(graduationYears.filter(year => year !== yearToRemove))
  }

  const addLocation = () => {
    if (currentLocation.trim() && !locations.includes(currentLocation.trim())) {
      setLocations([...locations, currentLocation.trim()])
      setCurrentLocation("")
    }
  }

  const removeLocation = (locationToRemove: string) => {
    setLocations(locations.filter(location => location !== locationToRemove))
  }

  const addRole = () => {
    if (currentRole.trim() && !roles.includes(currentRole.trim())) {
      setRoles([...roles, currentRole.trim()])
      setCurrentRole("")
    }
  }

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter(role => role !== roleToRemove))
  }

  const categoryOptions = [
    { value: "general", label: "General", icon: "📢" },
    { value: "jobs", label: "Jobs", icon: "💼" },
    { value: "news", label: "News", icon: "📰" },
    { value: "scholarships", label: "Scholarships", icon: "🎓" },
    { value: "events", label: "Events", icon: "📅" },
    { value: "achievements", label: "Achievements", icon: "🏆" },
    { value: "obituary", label: "Obituary", icon: "🕊️" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]

  const isPublic = form.watch("targetAudience.isPublic")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-glass dark:bg-glass-dark backdrop-blur-md border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-blue-purple">
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {announcement ? "Update the announcement details below." : "Fill in the announcement information to create a new post."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-glass dark:bg-glass-dark rounded-lg p-1 mb-2">
                <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-md transition-all">Basic Info</TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-md transition-all">Content</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-md transition-all">Settings</TabsTrigger>
                <TabsTrigger value="targeting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-md transition-all">Targeting</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-glass dark:bg-glass-dark border-none shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4">
                    <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                      <Megaphone className="h-5 w-5 text-white/90" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter announcement title..." {...field} className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-glass dark:bg-glass-dark">
                              {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="hover:bg-blue-100/30 dark:hover:bg-blue-900/30">
                                  <div className="flex items-center gap-2">
                                    <span>{option.icon}</span>
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-glass dark:bg-glass-dark">
                              {priorityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="hover:bg-blue-100/30 dark:hover:bg-blue-900/30">
                                  <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200 font-semibold px-2 py-1 rounded-md" variant="secondary">
                                    {option.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <Card className="bg-glass dark:bg-glass-dark border-none shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4">
                    <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                      <FileText className="h-5 w-5 text-white/90" />
                      Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your announcement content here..."
                              className="min-h-[200px] bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use markdown formatting for rich text.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-glass dark:bg-glass-dark border-none shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4">
                    <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                      <Settings className="h-5 w-5 text-white/90" />
                      Publication Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-glass dark:bg-glass-dark">
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="hover:bg-blue-100/30 dark:hover:bg-blue-900/30">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="publishDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Publish Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base" />
                          </FormControl>
                          <FormDescription>
                            Leave empty to publish immediately
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base" />
                          </FormControl>
                          <FormDescription>
                            Optional: Set when this announcement should expire
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPinned"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="accent-blue-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 font-semibold">
                              <Star className="h-4 w-4 text-blue-400" />
                              Pin Announcement
                            </FormLabel>
                            <FormDescription>
                              Pinned announcements appear at the top
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Targeting Tab */}
              <TabsContent value="targeting" className="space-y-4">
                <Card className="bg-glass dark:bg-glass-dark border-none shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4">
                    <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                      <Target className="h-5 w-5 text-white/90" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <FormField
                      control={form.control}
                      name="targetAudience.isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="accent-blue-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-semibold">Public Announcement</FormLabel>
                            <FormDescription>
                              Make this announcement visible to everyone
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {!isPublic && (
                      <>
                        <Separator />
                        {/* Graduation Years */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Target Graduation Years</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., 2020"
                              value={currentGraduationYear}
                              onChange={(e) => setCurrentGraduationYear(e.target.value)}
                              type="number"
                              min="1900"
                              max={new Date().getFullYear() + 10}
                              className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base"
                            />
                            <Button type="button" onClick={addGraduationYear} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {graduationYears.map((year) => (
                              <Badge key={year} variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200 px-2 py-1 rounded-md">
                                {year}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeGraduationYear(year)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* Locations */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Target Locations</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., New York"
                              value={currentLocation}
                              onChange={(e) => setCurrentLocation(e.target.value)}
                              className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base"
                            />
                            <Button type="button" onClick={addLocation} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {locations.map((location) => (
                              <Badge key={location} variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200 px-2 py-1 rounded-md">
                                {location}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeLocation(location)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* Roles */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Target Roles</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., alumni"
                              value={currentRole}
                              onChange={(e) => setCurrentRole(e.target.value)}
                              className="bg-glass dark:bg-glass-dark border border-blue-400/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/60 rounded-lg text-base"
                            />
                            <Button type="button" onClick={addRole} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                              <Badge key={role} variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:bg-blue-700/20 dark:text-blue-200 px-2 py-1 rounded-md">
                                {role}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeRole(role)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            {/* Debug form errors */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Form Validation Errors:</p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-200 space-y-1">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {error?.message || 'Invalid value'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg border-blue-400/30 text-blue-700 dark:text-blue-200 bg-glass dark:bg-glass-dark hover:bg-blue-100/30 dark:hover:bg-blue-900/30">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform px-6"
                onClick={(e) => {
                  console.log("Submit button clicked")
                  console.log("Form is valid:", form.formState.isValid)
                  console.log("Form errors:", form.formState.errors)
                }}
              >
                {isLoading ? "Saving..." : announcement ? "Update Announcement" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 