"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { FinancialDashboard } from "@/components/admin/financial-dashboard"

import { useGetDashboardStatsQuery } from "@/lib/api/adminApi"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, BarChart3, DollarSign, MessageSquare, TrendingUp, Activity, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RouteGuard } from "@/components/auth/route-guard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetDashboardStatsQuery({})

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load dashboard data. Please check your backend connection.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 border-red-200 hover:bg-red-100"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-5 w-96" />
              </div>
              
              {/* Stats Cards Skeleton */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Charts Skeleton */}
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-64 w-full" />
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Complete overview and management of your alumni network system
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Activity className="h-3 w-3 mr-1" />
                    System Online
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <DollarSign className="h-4 w-4" />
                  Financial
                </TabsTrigger>
                <TabsTrigger 
                  value="communication" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Communication
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Dashboard Stats */}
                <DashboardStats data={dashboardData} />

                {/* Analytics Charts */}
                <div className="grid gap-8 md:grid-cols-1">
                  <AnalyticsCharts data={dashboardData} />
                </div>
              </TabsContent>

              {/* Financial Overview Tab */}
              <TabsContent value="financial" className="space-y-8">
                <FinancialDashboard data={dashboardData?.payments} />
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-8">
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Email Management
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Use the "Send Email" option in the sidebar to send emails to alumni
                  </p>
                  <Button asChild>
                    <a href="/admin/send-email" className="inline-flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Go to Send Email
                    </a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminDashboardContent />
    </RouteGuard>
  )
}
