"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Server, HardDrive, Cpu, MemoryStick, Network, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface SystemStatusProps {
  systemStats: any
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
        const data = await apiClient.getNginxLogs()
        setNginxLogs(data.logs || [])
      } catch (error) {
        console.error("Failed to fetch Nginx logs:", error)
      }
    }

    fetchNginxLogs()
  }, [])

  // Rest of the component remains the same...
  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Status</h2>
        <Button onClick={refreshStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
              <Badge variant={systemStats?.nginx_status === "active" ? "default" : "destructive"}>
                {systemStats?.nginx_status || "Unknown"}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" onClick={reloadNginx} variant="outline">
                  Reload
                </Button>
                <Button size="sm" onClick={restartNginx} variant="outline">
                  Restart
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Version: {systemStats?.nginx_version || "Unknown"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPS Manager API</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default">Running</Badge>
            <p className="text-xs text-muted-foreground mt-2">Port: 8000 • PID: {systemStats?.api_pid || "Unknown"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.uptime || "0d 0h"}</div>
            <p className="text-xs text-muted-foreground">Load: {systemStats?.load_average || "0.00"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.cpu_usage || 0}%</div>
            <Progress value={systemStats?.cpu_usage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.memory_usage || 0}%</div>
            <Progress value={systemStats?.memory_usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats?.memory_used || "0"} / {systemStats?.memory_total || "0"} GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.disk_usage || 0}%</div>
            <Progress value={systemStats?.disk_usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats?.disk_used || "0"} / {systemStats?.disk_total || "0"} GB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Nginx Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Nginx Logs
          </CardTitle>
          <CardDescription>Last 10 entries from Nginx error log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {nginxLogs.length > 0 ? (
              nginxLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-400">No recent logs available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Test */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Test</CardTitle>
          <CardDescription>Test Nginx configuration syntax</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              try {
                const result = await apiClient.testNginx()
                toast({
                  title: result.success ? "Configuration Valid" : "Configuration Error",
                  description: result.message,
                  variant: result.success ? "default" : "destructive",
                })
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to test configuration",
                  variant: "destructive",
                })
              }
            }}
          >
            Test Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
