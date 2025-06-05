"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Server, HardDrive, Cpu, MemoryStick, Network } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface SystemStatusProps {
  systemStats: any
}

export function SystemStatus({ systemStats }: SystemStatusProps) {
  const [loading, setLoading] = useState(false)

  const refreshStatus = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/system/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        toast({
          title: "Status Updated",
          description: "System status refreshed successfully",
        })
      }
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
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/system/nginx/restart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Nginx restarted successfully",
        })
      }
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
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/system/nginx/reload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Nginx configuration reloaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reload Nginx configuration",
        variant: "destructive",
      })
    }
  }

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
    </div>
  )
}
