"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Server, Wifi, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useGetSystemLogsQuery } from "@/lib/api/adminApi"
import { format } from "date-fns"

interface SystemHealth {
  uptime?: number
  responseTime?: number
  errorRate?: number
  activeConnections?: number
  memoryUsage?: number
  cpuUsage?: number
  diskUsage?: number
  databaseConnections?: number
}

interface SystemMonitoringProps {
  data?: SystemHealth
}

export function SystemMonitoring({ data }: SystemMonitoringProps) {
  const [logLevel, setLogLevel] = useState("all")
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    uptime: data?.uptime || 99.9,
    responseTime: data?.responseTime || 145,
    errorRate: data?.errorRate || 0.2,
    activeConnections: data?.activeConnections || 1247,
    memoryUsage: data?.memoryUsage || 68,
    cpuUsage: data?.cpuUsage || 23,
    diskUsage: data?.diskUsage || 45,
    databaseConnections: data?.databaseConnections || 12,
  })

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useGetSystemLogsQuery({
    page: 1,
    limit: 50,
    level: logLevel === "all" ? undefined : logLevel,
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth((prev) => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 50) + 120,
        activeConnections: Math.floor(Math.random() * 200) + 1200,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        cpuUsage: Math.floor(Math.random() * 30) + 15,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const logs = logsData?.data || []

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: "good", color: "text-green-600" }
    if (value <= thresholds.warning) return { status: "warning", color: "text-yellow-600" }
    return { status: "critical", color: "text-red-600" }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800"
      case "warn":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warn":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.uptime || 0}%</div>
            <Progress value={systemHealth.uptime || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthStatus(systemHealth.responseTime || 0, { good: 200, warning: 500 }).color}`}
            >
              {systemHealth.responseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthStatus(systemHealth.errorRate || 0, { good: 1, warning: 5 }).color}`}
            >
              {systemHealth.errorRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(systemHealth.activeConnections || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current active users</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
          <CardDescription>Real-time system resource monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{systemHealth.memoryUsage || 0}%</span>
              </div>
              <Progress value={systemHealth.memoryUsage || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{systemHealth.cpuUsage || 0}%</span>
              </div>
              <Progress value={systemHealth.cpuUsage || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-muted-foreground">{systemHealth.diskUsage || 0}%</span>
              </div>
              <Progress value={systemHealth.diskUsage || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DB Connections</span>
                <span className="text-sm text-muted-foreground">{systemHealth.databaseConnections || 0}/20</span>
              </div>
              <Progress value={((systemHealth.databaseConnections || 0) / 20) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and errors</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                  <SelectItem value="warn">Warnings</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <Badge className={getLogLevelColor(log.level)}>
                        {getLogLevelIcon(log.level)}
                        <span className="ml-1">{log.level}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{log.message}</div>
                      {log.details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}</TableCell>
                    <TableCell>
                      {log.userId ? (
                        <span className="text-sm">{log.userId}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">System</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs found for the selected criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
