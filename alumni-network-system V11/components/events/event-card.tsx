"use client"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Clock, DollarSign, Loader2, Tag } from "lucide-react"
import { format } from "date-fns"
import type { Event } from "@/types"
import type { RootState } from "@/lib/store"
import { useRegisterForEventMutation, useCancelEventRegistrationMutation } from "@/lib/api/eventsApi"
import { optimisticRegister, rollbackRegister } from "@/lib/slices/eventsSlice"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] = useCancelEventRegistrationMutation()

  const isRegistered = event.attendees.some((attendee) => attendee.user === user?._id)
  const canRegister = event.registration.isRequired && event.capacity && event.attendeeCount < event.capacity
  const registrationDeadlinePassed = event.registration.deadline && new Date(event.registration.deadline) < new Date()

  const handleRegister = async () => {
    if (!user) return

    // Optimistic update
    dispatch(optimisticRegister({ eventId: event._id, userId: user._id }))

    try {
      await registerForEvent(event._id).unwrap()
    } catch (error) {
      // Rollback optimistic update on error
      dispatch(rollbackRegister({ eventId: event._id, userId: user._id }))
    }
  }

  const handleCancel = async () => {
    if (!user) return

    try {
      await cancelRegistration(event._id).unwrap()
    } catch (error) {
      console.error("Failed to cancel registration:", error)
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      reunion: "bg-blue-100 text-blue-800",
      webinar: "bg-green-100 text-green-800",
      fundraiser: "bg-purple-100 text-purple-800",
      networking: "bg-orange-100 text-orange-800",
      workshop: "bg-indigo-100 text-indigo-800",
      social: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">{event.description}</CardDescription>
          </div>
          <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {format(new Date(event.date.start), "PPP")} at {format(new Date(event.date.start), "p")}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              Duration:{" "}
              {Math.round(
                (new Date(event.date.end).getTime() - new Date(event.date.start).getTime()) / (1000 * 60 * 60),
              )}{" "}
              hours
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>
              {event.location.type === "virtual"
                ? "Virtual Event"
                : event.location.type === "hybrid"
                  ? "Hybrid Event"
                  : `${event.location.venue}, ${event.location.city}`}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>
              {event.attendeeCount} attendees
              {event.capacity && ` / ${event.capacity} capacity`}
            </span>
          </div>

          {event.registration.fee && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>
                {event.registration.fee.currency} {event.registration.fee.amount}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer.profile?.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {event.organizer.firstName[0]}
                {event.organizer.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Organized by {event.organizer.firstName} {event.organizer.lastName}
            </span>
          </div>

          {/* Event Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="mr-2 h-4 w-4" />
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          {user && event.registration.isRequired && (
            <div className="space-y-2">
              {isRegistered ? (
                <Button variant="outline" className="w-full" onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Registration"
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isRegistering || !canRegister || registrationDeadlinePassed}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : registrationDeadlinePassed ? (
                    "Registration Closed"
                  ) : !canRegister ? (
                    "Event Full"
                  ) : (
                    "Register Now"
                  )}
                </Button>
              )}

              {event.registration.deadline && !registrationDeadlinePassed && (
                <p className="text-xs text-muted-foreground text-center">
                  Registration closes on {format(new Date(event.registration.deadline), "PPP")}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
