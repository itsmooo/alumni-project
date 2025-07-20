"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Calendar,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  DollarSign,
  Globe,
  Lock,
  FileText,
  Send,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { EventForm } from "@/components/admin/event-form"
import { RouteGuard } from "@/components/auth/route-guard"
import {
  useGetEventSummaryQuery,
  useGetAdminEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useBulkEventOperationMutation,
} from "@/lib/api/eventsApi"
import type { Event } from "@/types"
import type { CreateEventRequest, UpdateEventRequest } from "@/lib/api/eventsApi"
import { useSearchParams, useRouter } from "next/navigation"

function EventManagementContent() {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Form and dialog state
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>("")
  
  // API queries and mutations
  const {
    data: eventSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetEventSummaryQuery()

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetAdminEventsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  })

  const [createEvent, { isLoading: isCreating, error: createError }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating, error: updateError }] = useUpdateEventMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()
  const [bulkEventOperation, { isLoading: isBulkOperating }] = useBulkEventOperationMutation()

  // Use API data with fallbacks
  const finalEventSummary = eventSummary || {
    totalEvents: 0,
    publishedEvents: 0,
    upcomingEvents: 0,
    eventsThisMonth: 0,
    totalAttendees: 0,
  }
  const finalEvents = eventsResponse?.data || []
  const totalEvents = eventsResponse?.total || 0
  const totalPages = eventsResponse?.totalPages || 0

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("addEvent") === "1") {
      setIsEventFormOpen(true);
      setSelectedEvent(undefined);
    }
  }, [searchParams]);

  // Show error state if both API calls fail
  if (summaryError && eventsError) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load event data. Please check your connection and try again.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    refetchSummary()
                    refetchEvents()
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isSummaryLoading && isEventsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handlers
  const handleCreateEvent = async (eventData: CreateEventRequest) => {
    try {
      await createEvent(eventData).unwrap()
      toast.success("Event created successfully!")
      setIsEventFormOpen(false)
      setSelectedEvent(undefined)
      refetchEvents()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create event")
      throw error
    }
  }

  const handleUpdateEvent = async (eventData: UpdateEventRequest) => {
    if (!selectedEvent) return
    try {
      await updateEvent({ id: selectedEvent._id, data: eventData }).unwrap()
      toast.success("Event updated successfully!")
      setIsEventFormOpen(false)
      setSelectedEvent(undefined)
      refetchEvents()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update event")
      throw error
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return
    try {
      await deleteEvent(eventToDelete._id).unwrap()
      toast.success("Event deleted successfully!")
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
      refetchEvents()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete event")
    }
  }

  const handleBulkAction = async () => {
    if (selectedEvents.length === 0 || !bulkAction) return
    
    try {
      await bulkEventOperation({ 
        action: bulkAction as any, 
        eventIds: selectedEvents 
      }).unwrap()
      
      const actionText = {
        publish: "published",
        draft: "moved to draft",
        cancel: "cancelled",
        complete: "marked as completed",
        delete: "deleted"
      }[bulkAction] || "updated"
      
      toast.success(`${selectedEvents.length} events ${actionText} successfully!`)
      setSelectedEvents([])
      setBulkAction("")
      refetchEvents()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Bulk operation failed")
    }
  }

  const openEditForm = (event: Event) => {
    setSelectedEvent(event)
    setIsEventFormOpen(true)
  }

  const openCreateForm = () => {
    setSelectedEvent(undefined)
    setIsEventFormOpen(true)
  }

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event)
    setIsDeleteDialogOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 hover:bg-green-200"
      case "draft": return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-200"
      case "completed": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "reunion": return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "webinar": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "fundraiser": return "bg-green-100 text-green-800 hover:bg-green-200"
      case "networking": return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "workshop": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "social": return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, eventId])
    } else {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(finalEvents.map(event => event._id))
    } else {
      setSelectedEvents([])
    }
  }

  const handleCloseEventForm = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(undefined);
    const params = new URLSearchParams(window.location.search);
    if (params.has("addEvent")) {
      params.delete("addEvent");
      router.replace(window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
                <p className="text-muted-foreground">
                  Manage alumni events, registrations, and analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={openCreateForm} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Total Events */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-purple-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalEventSummary.totalEvents.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      All time events
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Published */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-green-500 before:to-emerald-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalEventSummary.publishedEvents.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-600">
                      Live events
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Upcoming */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:to-pink-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalEventSummary.upcomingEvents.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-600">
                      Next 30 days
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* This Month */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-orange-500 before:to-red-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <CalendarDays className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalEventSummary.eventsThisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-600">
                      New events
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Total Attendees */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-yellow-400 before:to-orange-500 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                    <Users className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalEventSummary.totalAttendees.toLocaleString()}
                    </div>
                    <p className="text-xs text-orange-600">
                      All registrations
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between rounded-t-2xl px-6 py-4 bg-gradient-to-r from-blue-500/80 to-purple-600/80">
                <CardTitle className="text-lg font-bold text-white tracking-tight">
                  <span className="inline-block border-l-4 border-blue-300 pl-3">Filters & Search</span>
                </CardTitle>
                <Filter className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="reunion">Alumni Reunion</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="fundraiser">Fundraiser</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="social">Social Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Event Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="attendees">Attendees</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events Table */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl mt-6">
              <CardHeader>
                <CardTitle>Events ({totalEvents})</CardTitle>
              </CardHeader>
              <CardContent>
                {isEventsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : finalEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your filters or search terms."
                        : "Get started by creating your first event."}
                    </p>
                    <Button onClick={openCreateForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedEvents.length === finalEvents.length}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Attendees</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {finalEvents.map((event) => (
                            <TableRow key={event._id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedEvents.includes(event._id)}
                                  onCheckedChange={(checked) => 
                                    handleSelectEvent(event._id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    {event.isPublic ? (
                                      <Globe className="h-3 w-3" />
                                    ) : (
                                      <Lock className="h-3 w-3" />
                                    )}
                                    {event.isPublic ? "Public" : "Private"}
                                    {event.capacity && (
                                      <>
                                        <span>•</span>
                                        <span>Capacity: {event.capacity}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getTypeBadgeColor(event.type)}>
                                  {event.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">
                                      {formatDate(event.date.start)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(event.date.start)}
                                    </span>
                                  </div>
                                  {isEventUpcoming(event.date.start) && (
                                    <Badge variant="outline" className="text-xs">
                                      Upcoming
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm capitalize">
                                      {event.location.type}
                                    </span>
                                  </div>
                                  {event.location.city && (
                                    <div className="text-xs text-muted-foreground">
                                      {event.location.city}, {event.location.country}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {event.attendeeCount || 0}
                                  </span>
                                  {event.capacity && (
                                    <span className="text-xs text-muted-foreground">
                                      / {event.capacity}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getStatusBadgeColor(event.status)}>
                                  {event.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => openEditForm(event)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Attendees
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Send className="mr-2 h-4 w-4" />
                                      Send Notification
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openDeleteDialog(event)}
                                      className="text-destructive"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Event
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Show</label>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(parseInt(value))
                          setCurrentPage(1)
                        }}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">per page</span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalEvents)} of {totalEvents} results
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Form Dialog */}
      <EventForm
        event={selectedEvent}
        isOpen={isEventFormOpen}
        onClose={handleCloseEventForm}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        isLoading={selectedEvent ? isUpdating : isCreating}
        error={selectedEvent ? (updateError as any)?.data?.message : (createError as any)?.data?.message}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-0">
          <AlertDialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl">
            <AlertDialogTitle className="text-lg font-bold text-white tracking-tight">Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="px-6 pt-4 pb-2 text-slate-700 dark:text-slate-200">
            This action cannot be undone. This will permanently delete the event
            <strong>"{eventToDelete?.title}"</strong>
            and remove all associated data including attendee registrations.
          </AlertDialogDescription>
          <AlertDialogFooter className="px-6 pb-4">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function EventManagementPage() {
  return (
    <RouteGuard requiredRole="admin">
      <EventManagementContent />
    </RouteGuard>
  )
} 