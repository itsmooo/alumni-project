"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from "lucide-react"
import React from "react"

interface AnalyticsChartsProps {
  data?: {
    users?: {
      growthData?: Array<{ date: string; count: number }>
      byGraduationYear?: Array<{ year: number; count: number }>
    }
    payments?: {
      monthlyRevenue?: Array<{ month: string; revenue: number; transactions: number }>
    }
    events?: {
      byType?: Record<string, number>
    }
  }
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Provide default values to prevent undefined errors
  const userGrowthData = data?.users?.growthData || []
  const revenueData = data?.payments?.monthlyRevenue || []
  const graduationYearData = data?.users?.byGraduationYear || []
  
  // Convert event types object to array format for pie chart
  const eventTypeData = data?.events?.byType 
    ? Object.entries(data.events.byType).map(([type, count], index) => ({
        name: type,
        value: count,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"][index % 7],
      }))
    : []

  const chartCards = [
    {
      title: "User Growth Trend",
      description: "Alumni registration over time",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-500/10",
      gradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      data: userGrowthData,
      type: "area",
      emptyMessage: "No growth data available"
    },
    {
      title: "Monthly Revenue",
      description: "Revenue and transaction trends",
      icon: BarChart3,
      iconColor: "text-green-600",
      iconBg: "bg-green-500/10",
      gradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      data: revenueData,
      type: "line",
      emptyMessage: "No revenue data available"
    },
    {
      title: "Event Types Distribution",
      description: "Breakdown of event categories",
      icon: PieChartIcon,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-500/10",
      gradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      data: eventTypeData,
      type: "pie",
      emptyMessage: "No event type data available"
    },
    {
      title: "Alumni by Graduation Year",
      description: "Distribution of alumni across graduation years",
      icon: Calendar,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-500/10",
      gradient: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      data: graduationYearData,
      type: "bar",
      emptyMessage: "No graduation year data available"
    }
  ]

  const renderChart = (card: any) => {
    if (card.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <card.icon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium">{card.emptyMessage}</p>
          </div>
        </div>
      )
    }

    switch (card.type) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={card.data}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number) => [value, "New Users"]}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={card.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? formatCurrency(value) : value,
                  name === "revenue" ? "Revenue" : "Transactions",
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="transactions" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Transactions" 
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={card.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {card.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={card.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* User Growth Chart - Full Width */}
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${chartCards[0].iconBg} flex items-center justify-center`}>
                {React.createElement(chartCards[0].icon, { className: `h-5 w-5 ${chartCards[0].iconColor}` })}
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  {chartCards[0].title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {chartCards[0].description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              {userGrowthData.length} Data Points
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart(chartCards[0])}
        </CardContent>
      </Card>

      {/* Other Charts Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {chartCards.slice(1).map((card, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    {React.createElement(card.icon, { className: `h-5 w-5 ${card.iconColor}` })}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {card.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className={`${card.iconBg} ${card.iconColor}`}> 
                  {card.data.length} Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart(card)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
