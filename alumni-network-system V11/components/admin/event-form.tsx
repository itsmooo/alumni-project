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
import { CalendarDays, MapPin, Users, DollarSign, Tag, X, Plus } from "lucide-react"
import type { Event } from "@/types"
import type { CreateEventRequest, UpdateEventRequest } from "@/lib/api/eventsApi"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  type: z.enum(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
  date: z.object({
    start: z.string().min(1, "Start date is required"),
    end: z.string().min(1, "End date is required"),
  }).refine(data => new Date(data.end) > new Date(data.start), {
    message: "End date must be after start date",
    path: ["end"],
  }),
  location: z.object({
    type: z.enum(["physical", "virtual", "hybrid"]),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    virtualLink: z.string().optional(),
  }).refine(
    (data) => {
      // If location type is virtual or hybrid, virtual link is required and must be a valid URL
      if (data.type === "virtual" || data.type === "hybrid") {
        if (!data.virtualLink || data.virtualLink.trim() === "") {
          return false;
        }
        try {
          new URL(data.virtualLink);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Virtual link is required and must be a valid URL for virtual/hybrid events",
      path: ["virtualLink"],
    }
  ),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  registration: z.object({
    required: z.boolean(),
    deadline: z.string().optional(),
    fee: z.object({
      amount: z.number().min(0, "Fee amount must be positive").optional(),
      currency: z.string().optional(),
    }).optional(),
  }).optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

type EventFormData = z.infer<typeof eventFormSchema>

interface EventFormProps {
  event?: Event
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function EventForm({ event, isOpen, onClose, onSubmit, isLoading, error }: EventFormProps) {
  const [currentTag, setCurrentTag] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "networking",
      date: {
        start: "",
        end: "",
      },
      location: {
        type: "physical",
        address: "",
        city: "",
        country: "",
        virtualLink: "",
      },
      capacity: 50,
      registration: {
        required: true,
        deadline: "",
        fee: {
          amount: 0,
          currency: "USD",
        },
      },
      status: "draft",
      isPublic: true,
      tags: [],
    },
  })

  const locationType = form.watch("location.type")
  const registrationRequired = form.watch("registration.required")

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || "",
        description: event.description || "",
        type: event.type || "networking",
        date: {
          start: event.date?.start ? new Date(event.date.start).toISOString().slice(0, 16) : "",
          end: event.date?.end ? new Date(event.date.end).toISOString().slice(0, 16) : "",
        },
        location: {
          type: event.location?.type || "physical",
          address: event.location?.address || "",
          city: event.location?.city || "",
          country: event.location?.country || "",
          virtualLink: event.location?.virtualLink || "",
        },
        capacity: event.capacity || 50,
        registration: {
          required: event.registration?.required ?? true,
          deadline: event.registration?.deadline ? new Date(event.registration.deadline).toISOString().slice(0, 16) : "",
          fee: {
            amount: event.registration?.fee?.amount || 0,
            currency: event.registration?.fee?.currency || "USD",
          },
        },
        status: event.status || "draft",
        isPublic: event.isPublic ?? true,
        tags: event.tags || [],
      })
      setTags(event.tags || [])
    } else {
      form.reset()
      setTags([])
    }
  }, [event, form])

  const handleSubmit = async (data: EventFormData) => {
    try {
      // Clean up the location data
      const locationData = { ...data.location }
      
      // For virtual/hybrid events, ensure virtual link is present and valid
      if ((locationData.type === "virtual" || locationData.type === "hybrid")) {
        if (!locationData.virtualLink || locationData.virtualLink.trim() === "") {
          form.setError("location.virtualLink", {
            type: "manual",
            message: "Virtual link is required for virtual/hybrid events"
          })
          return
        }
        
        // Validate URL format
        try {
          new URL(locationData.virtualLink)
        } catch {
          form.setError("location.virtualLink", {
            type: "manual",
            message: "Please enter a valid URL"
          })
          return
        }
      }
      
      // Remove empty virtual link for physical events
      if (locationData.type === "physical") {
        locationData.virtualLink = undefined
      }
      
      const eventData = {
        ...data,
        location: locationData,
        tags: tags,
        date: {
          start: new Date(data.date.start).toISOString(),
          end: new Date(data.date.end).toISOString(),
        },
        registration: data.registration?.required ? {
          ...data.registration,
          deadline: data.registration.deadline ? new Date(data.registration.deadline).toISOString() : undefined,
        } : undefined,
      }
      
      await onSubmit(eventData)
      onClose()
    } catch (error) {
      // Error is handled by the parent component
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const eventTypeOptions = [
    { value: "reunion", label: "Alumni Reunion" },
    { value: "webinar", label: "Webinar" },
    { value: "fundraiser", label: "Fundraiser" },
    { value: "networking", label: "Networking Event" },
    { value: "workshop", label: "Workshop" },
    { value: "social", label: "Social Event" },
    { value: "other", label: "Other" },
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-0">
        <DialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {event ? "Update the event details below." : "Fill in the event information to create a new event."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-6 pb-6 pt-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="datetime">Date & Location</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <CalendarDays className="h-5 w-5" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your event..."
                              className="min-h-[100px] bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eventTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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

              {/* Date & Location Tab */}
              <TabsContent value="datetime" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <CalendarDays className="h-5 w-5" />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date & Time *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date & Time *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <MapPin className="h-5 w-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="location.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="physical">Physical Location</SelectItem>
                              <SelectItem value="virtual">Virtual Event</SelectItem>
                              <SelectItem value="hybrid">Hybrid (Physical + Virtual)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(locationType === "physical" || locationType === "hybrid") && (
                      <>
                        <FormField
                          control={form.control}
                          name="location.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter venue address" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="location.country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {(locationType === "virtual" || locationType === "hybrid") && (
                      <FormField
                        control={form.control}
                        name="location.virtualLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Virtual Meeting Link
                              {(locationType === "virtual" || locationType === "hybrid") && (
                                <span className="text-red-500"> *</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://zoom.us/j/123456789"
                                {...field}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormDescription>
                              {locationType === "virtual" 
                                ? "Required: Provide the link for virtual attendees"
                                : "Provide the link for virtual attendees (required for hybrid events)"
                              }
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="registration" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Users className="h-5 w-5" />
                      Registration Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Maximum number of attendees"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for unlimited capacity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registration.required"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Registration Required</FormLabel>
                            <FormDescription>
                              Require attendees to register before attending
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {registrationRequired && (
                      <>
                        <FormField
                          control={form.control}
                          name="registration.deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Deadline</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                              </FormControl>
                              <FormDescription>
                                Last date and time for registration
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <div className="space-y-4">
                          <Label className="text-base font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Registration Fee
                          </Label>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="registration.fee.amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Set to 0 for free events
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="registration.fee.currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="USD">USD ($)</SelectItem>
                                      <SelectItem value="EUR">EUR (€)</SelectItem>
                                      <SelectItem value="GBP">GBP (£)</SelectItem>
                                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      Event Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Public Event</FormLabel>
                            <FormDescription>
                              Make this event visible to all alumni
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Event Tags
                      </Label>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addTag()
                            }
                          }}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" variant="outline" onClick={addTag} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700">
                {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 