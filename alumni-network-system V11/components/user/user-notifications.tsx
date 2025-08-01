"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from "@/lib/api/notificationsApi"
import type { Notification } from "@/lib/api/notificationsApi"

interface UserNotificationsProps {
  className?: string
}

export function UserNotifications({ className }: UserNotificationsProps) {
  const [showAll, setShowAll] = useState(false)

  // Fetch real notifications data
  const { data: notificationsData, isLoading, error } = useGetNotificationsQuery({
    page: 1,
    limit: 20,
  })

  // Mutations for marking notifications as read
  const [markAsRead] = useMarkNotificationAsReadMutation()
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation()

  const notifications = notificationsData?.notifications || []
  const unreadNotifications = notifications.filter(n => n.status !== "read")
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5)

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "broadcast":
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Broadcast</Badge>
      case "event":
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Event</Badge>
      case "announcement":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Announcement</Badge>
      case "job":
        return <Badge className="bg-green-100 text-green-800 text-xs">Job</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24)
      return `${days}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <X className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600">Failed to load notifications</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground">You'll see important updates here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
                           <div className="flex items-center gap-2">
                   {unreadNotifications.length > 0 && (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleMarkAllAsRead}
                       className="text-xs"
                     >
                       <Check className="h-3 w-3 mr-1" />
                       Mark all read
                     </Button>
                   )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show all
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayNotifications.map((notification) => (
            <div
                             key={notification._id}
                           className={`p-3 rounded-lg border transition-colors ${
               notification.status === "read"
                 ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                 : "border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20"
             }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                                     <div className="flex items-center gap-2">
                     <h4 className={`font-medium text-sm ${
                       notification.status === "read" ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"
                     }`}>
                       {notification.subject}
                     </h4>
                     {getTypeBadge(notification.type)}
                     {notification.status !== "read" && (
                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     )}
                   </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {notification.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDate(notification.createdAt)}</span>
                    {notification.sender && (
                      <span>From: {notification.sender.firstName} {notification.sender.lastName}</span>
                    )}
                  </div>
                </div>
                                 {notification.status !== "read" && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => handleMarkAsRead(notification._id)}
                     className="h-6 w-6 p-0"
                   >
                     <Check className="h-3 w-3" />
                   </Button>
                 )}
              </div>
            </div>
          ))}
        </div>
        
        {notifications.length > 5 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? "Show less" : `Show all ${notifications.length} notifications`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 