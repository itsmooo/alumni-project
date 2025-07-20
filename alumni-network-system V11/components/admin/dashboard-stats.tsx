"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, Briefcase, UserCheck, TrendingUp, Activity, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardStatsProps {
  data?: {
    users?: {
      total?: number
      new?: number
      byRole?: {
        alumni?: number
        moderator?: number
        admin?: number
      }
    }
    events?: {
      total?: number
      upcoming?: number
    }
    payments?: {
      totalRevenue?: number
      recentRevenue?: number
    }
    jobs?: {
      total?: number
    }
  }
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Provide default values to prevent undefined errors
  const stats = {
    users: {
      total: data?.users?.total || 0,
      new: data?.users?.new || 0,
      byRole: {
        alumni: data?.users?.byRole?.alumni || 0,
        moderator: data?.users?.byRole?.moderator || 0,
        admin: data?.users?.byRole?.admin || 0,
      }
    },
    events: {
      total: data?.events?.total || 0,
      upcoming: data?.events?.upcoming || 0,
    },
    payments: {
      totalRevenue: data?.payments?.totalRevenue || 0,
      recentRevenue: data?.payments?.recentRevenue || 0,
    },
    jobs: {
      total: data?.jobs?.total || 0,
    }
  }

  const statCards = [
    {
      title: "Total Alumni",
      value: stats.users.total.toLocaleString(),
      change: `+${stats.users.new}`,
      changeLabel: "new this month",
      icon: Users,
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-50 to-purple-50",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      changeColor: "text-green-600",
      description: "Registered alumni members"
    },
    {
      title: "Active Events",
      value: stats.events.upcoming.toString(),
      change: stats.events.total.toString(),
      changeLabel: "total events",
      icon: Calendar,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
      changeColor: "text-slate-600",
      description: "Upcoming and ongoing events"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.payments.totalRevenue),
      change: formatCurrency(stats.payments.recentRevenue),
      changeLabel: "this month",
      icon: DollarSign,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
      changeColor: "text-green-600",
      description: "Total revenue generated"
    },
    {
      title: "Job Postings",
      value: stats.jobs.total.toString(),
      change: "Active",
      changeLabel: "opportunities",
      icon: Briefcase,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      changeColor: "text-slate-600",
      description: "Available job opportunities"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={
              `group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
              transition-all duration-300
              hover:scale-[1.03] hover:shadow-2xl hover:z-10
              before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:${card.gradient} before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`
            }
            style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
          >
            <div className="relative z-10">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {card.value}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span className={card.changeColor}>+{card.change}</span> {card.changeLabel}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {card.description}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* User Distribution Card */}
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                User Distribution
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Breakdown of users by role
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Target className="h-3 w-3 mr-1" />
              {stats.users.total} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Alumni</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Graduates</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.users.byRole.alumni.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {((stats.users.byRole.alumni / stats.users.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Moderators</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Content managers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.users.byRole.moderator.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {((stats.users.byRole.moderator / stats.users.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Administrators</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">System admins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.users.byRole.admin.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {((stats.users.byRole.admin / stats.users.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
