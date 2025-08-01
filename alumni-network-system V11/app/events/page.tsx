"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Calendar, Plus } from "lucide-react"
import { useGetEventsQuery } from "@/lib/api/eventsApi"
import { EventCard } from "@/components/events/event-card"
import { UserSidebar } from "@/components/user/user-sidebar"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import Link from "next/link"

export default function EventsPage() {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all") // Updated default value to 'all'
  const [status, setStatus] = useState("all") // Updated default value to 'all'
  const [page, setPage] = useState(1)

  const { user } = useSelector((state: RootState) => state.auth)
  const canCreateEvents = user?.role === "admin" || user?.role === "moderator"

  const {
    data: eventsData,
    isLoading,
    error,
  } = useGetEventsQuery({
    page,
    limit: 12,
    search: search || undefined,
    type: type === "all" ? undefined : type, // Adjusted condition to handle 'all' value
    status: status === "all" ? undefined : status, // Adjusted condition to handle 'all' value
    upcoming: true,
  })

  const events = eventsData?.data || []
  const pagination = eventsData?.pagination

  const eventTypes = [
    { value: "all", label: "All Types" }, // Updated value to 'all'
    { value: "reunion", label: "Reunion" },
    { value: "webinar", label: "Webinar" },
    { value: "fundraiser", label: "Fundraiser" },
    { value: "networking", label: "Networking" },
    { value: "workshop", label: "Workshop" },
    { value: "social", label: "Social" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <UserSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Alumni Events
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Discover and join exciting alumni events and activities
                      </p>
                    </div>
                  </div>
                </div>
                {canCreateEvents && (
                  <Button asChild>
                    <Link href="/events/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filter Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((eventType) => (
                        <SelectItem key={eventType.value} value={eventType.value}>
                          {eventType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem> {/* Updated value to 'all' */}
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Failed to load events. Please try again later.</p>
                </CardContent>
              </Card>
            ) : events.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {pagination.pages}
                    </span>
                    <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No events found</h3>
                  <p className="text-muted-foreground">
                    {search || type !== "all" || status !== "all"
                      ? "Try adjusting your search criteria"
                      : "No events are currently available"}
                  </p>
                  {canCreateEvents && (
                    <Button asChild className="mt-4">
                      <Link href="/events/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Event
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
