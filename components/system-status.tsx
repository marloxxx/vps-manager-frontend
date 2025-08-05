"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Server, HardDrive, Cpu, MemoryStick, Network, AlertTriangle, Activity, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface SystemStats {
  nginx_status: string
  nginx_version: string
  api_pid: number
  uptime: string
  load_average: number
  cpu_usage: number
  memory_usage: number
  memory_used: number
  memory_total: number
  disk_usage: number
  disk_used: number
  disk_total: number
  ssl_certs: number
  ssl_expiring: number
}

interface SystemStatusProps {
  systemStats: SystemStats | null
}

export function SystemStatus({ systemStats }: SystemStatusProps) {
  const [loading, setLoading] = useState(false)
  const [nginxLogs, setNginxLogs] = useState<string[]>([])

  const refreshStatus = async () => {
    setLoading(true)
    try {
      await apiClient.getSystemStatus()
      toast({
        title: "Status Updated",
        description: "System status refreshed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh system status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const restartNginx = async () => {
    try {
      await apiClient.restartNginx()
      toast({
        title: "Success",
        description: "Nginx restarted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restart Nginx",
        variant: "destructive",
      })
    }
  }

  const reloadNginx = async () => {
    try {
      await apiClient.reloadNginx()
      toast({
        title: "Success",
        description: "Nginx configuration reloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reload Nginx configuration",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchNginxLogs = async () => {
      try {
        const data = await apiClient.getNginxLogs("error", 10) as { logs: string[] }
        setNginxLogs(data.logs || [])
      } catch (error) {
        console.error("Failed to fetch Nginx logs:", error)
      }
    }

    fetchNginxLogs()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600"
      case "inactive":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (!systemStats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Status</h2>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Status</h2>
        <div className="flex items-center gap-2">
          <Button onClick={refreshStatus} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nginx Service</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{getStatusBadge(systemStats.nginx_status)}</div>
                <p className="text-xs text-muted-foreground">Version {systemStats.nginx_version}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={reloadNginx}>
                  Reload
                </Button>
                <Button size="sm" variant="outline" onClick={restartNginx}>
                  Restart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Service</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">PID: {systemStats.api_pid}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Certificates</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.ssl_certs}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.ssl_expiring} expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cpu_usage.toFixed(1)}%</div>
            <Progress value={systemStats.cpu_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Load: {systemStats.load_average.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.memory_usage.toFixed(1)}%</div>
            <Progress value={systemStats.memory_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {systemStats.memory_used}GB / {systemStats.memory_total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.disk_usage.toFixed(1)}%</div>
            <Progress value={systemStats.disk_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {systemStats.disk_used}GB / {systemStats.disk_total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}</div>
            <p className="text-xs text-muted-foreground">System running time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Nginx Errors */}
      {nginxLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recent Nginx Errors
            </CardTitle>
            <CardDescription>Latest error logs from Nginx</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nginxLogs.slice(0, 5).map((log, index) => (
                <div key={index} className="p-2 bg-red-50 rounded text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nginx Status</span>
              <div className={`flex items-center gap-2 ${getStatusColor(systemStats.nginx_status)}`}>
                <div className={`w-2 h-2 rounded-full ${systemStats.nginx_status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                {systemStats.nginx_status}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU Health</span>
              <div className={`flex items-center gap-2 ${systemStats.cpu_usage > 80 ? "text-red-600" :
                  systemStats.cpu_usage > 60 ? "text-yellow-600" : "text-green-600"
                }`}>
                <div className={`w-2 h-2 rounded-full ${systemStats.cpu_usage > 80 ? "bg-red-500" :
                    systemStats.cpu_usage > 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}></div>
                {systemStats.cpu_usage.toFixed(1)}%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Health</span>
              <div className={`flex items-center gap-2 ${systemStats.memory_usage > 80 ? "text-red-600" :
                  systemStats.memory_usage > 60 ? "text-yellow-600" : "text-green-600"
                }`}>
                <div className={`w-2 h-2 rounded-full ${systemStats.memory_usage > 80 ? "bg-red-500" :
                    systemStats.memory_usage > 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}></div>
                {systemStats.memory_usage.toFixed(1)}%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Disk Health</span>
              <div className={`flex items-center gap-2 ${systemStats.disk_usage > 80 ? "text-red-600" :
                  systemStats.disk_usage > 60 ? "text-yellow-600" : "text-green-600"
                }`}>
                <div className={`w-2 h-2 rounded-full ${systemStats.disk_usage > 80 ? "bg-red-500" :
                    systemStats.disk_usage > 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}></div>
                {systemStats.disk_usage.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common system management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={reloadNginx} className="w-full justify-start" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Nginx Configuration
            </Button>
            <Button onClick={restartNginx} className="w-full justify-start" variant="outline">
              <Server className="h-4 w-4 mr-2" />
              Restart Nginx Service
            </Button>
            <Button onClick={refreshStatus} className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Refresh System Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
