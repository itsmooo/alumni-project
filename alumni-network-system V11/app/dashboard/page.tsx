"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Briefcase, MessageSquare, Settings, Bell } from "lucide-react"
import { RouteGuard } from "@/components/auth/route-guard"
import { UserSidebar } from "@/components/user/user-sidebar"
import { UserNotifications } from "@/components/user/user-notifications"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store"

function DashboardContent() {
  const { user } = useSelector((state: RootState) => state.auth)

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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Welcome back, {user?.firstName}!
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Here's what's happening in your alumni network
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">My Connections</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">+12 this month</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">2 upcoming</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">1 pending review</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">5 unread</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="connections" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  Connections
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  Job Board
                </TabsTrigger>
              </TabsList>

                             <TabsContent value="overview" className="space-y-8">
                 <div className="grid gap-8 md:grid-cols-2">
                   <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                     <CardHeader>
                       <CardTitle>Recent Activity</CardTitle>
                       <CardDescription>Your latest interactions</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       <div className="flex items-center space-x-4">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>JD</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                           <p className="text-sm font-medium">John Doe connected with you</p>
                           <p className="text-xs text-muted-foreground">2 hours ago</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-4">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>SM</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                           <p className="text-sm font-medium">Sarah Miller liked your post</p>
                           <p className="text-xs text-muted-foreground">4 hours ago</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-4">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>MB</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                           <p className="text-sm font-medium">Mike Brown registered for Tech Meetup</p>
                           <p className="text-xs text-muted-foreground">1 day ago</p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                                       <UserNotifications />
                 </div>
                 
                 <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                   <CardHeader>
                     <CardTitle>Upcoming Events</CardTitle>
                     <CardDescription>Events you might be interested in</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium">Alumni Tech Meetup</p>
                           <p className="text-xs text-muted-foreground">Dec 25, 2024 • 6:00 PM</p>
                         </div>
                         <Badge>Attending</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium">Career Fair 2025</p>
                           <p className="text-xs text-muted-foreground">Jan 15, 2025 • 10:00 AM</p>
                         </div>
                         <Button variant="outline" size="sm">Register</Button>
                       </div>
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium">Annual Gala</p>
                           <p className="text-xs text-muted-foreground">Feb 14, 2025 • 7:00 PM</p>
                         </div>
                         <Button variant="outline" size="sm">Register</Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </TabsContent>

              <TabsContent value="events">
                <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>Browse and register for alumni events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Events content coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Your Network</CardTitle>
                    <CardDescription>Connect with fellow alumni</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Connections content coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Job Opportunities</CardTitle>
                    <CardDescription>Find your next career opportunity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Job board content coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  )
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  )
}
