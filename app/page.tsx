"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Server, Activity, Shield, Settings } from "lucide-react"
import { ConfigList } from "@/components/config-list"
import { CreateConfigDialog } from "@/components/create-config-dialog"
import { SystemStatus } from "@/components/system-status"
import { LogViewer } from "@/components/log-viewer"
import { SSLManager } from "@/components/ssl-manager"
import { BackupRestore } from "@/components/backup-restore"
import { ConfigTemplates } from "@/components/config-templates"
import { LoadBalancer } from "@/components/load-balancer"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api"

export default function Dashboard() {
  const [configs, setConfigs] = useState([])
  const [systemStats, setSystemStats] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      fetchConfigs()
      fetchSystemStats()
      const interval = setInterval(fetchSystemStats, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [authLoading, user])

  const fetchConfigs = async () => {
    try {
      const data = await apiClient.getConfigs()
      setConfigs(data)
    } catch (error) {
      console.error("Failed to fetch configs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const data = await apiClient.getSystemStatus()
      setSystemStats(data)
    } catch (error) {
      console.error("Failed to fetch system stats:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const activeConfigs = configs.filter((config) => config.is_active).length
  const totalConfigs = configs.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VPS Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.username}!</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Configuration
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configs</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConfigs}</div>
              <p className="text-xs text-muted-foreground">{activeConfigs} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={systemStats?.nginx_status === "active" ? "default" : "destructive"}>
                  {systemStats?.nginx_status || "Unknown"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Nginx service</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Certificates</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.ssl_certs || 0}</div>
              <p className="text-xs text-muted-foreground">{systemStats?.ssl_expiring || 0} expiring soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.uptime || "0d"}</div>
              <p className="text-xs text-muted-foreground">System uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="configurations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="load-balancer">Load Balancer</TabsTrigger>
            <TabsTrigger value="ssl">SSL Manager</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="configurations">
            <ConfigList configs={configs} onConfigsChange={fetchConfigs} loading={loading} />
          </TabsContent>

          <TabsContent value="templates">
            <ConfigTemplates
              onTemplateSelect={(template) => {
                setIsCreateDialogOpen(true)
                // Pass template data to dialog
              }}
            />
          </TabsContent>

          <TabsContent value="load-balancer">
            <LoadBalancer />
          </TabsContent>

          <TabsContent value="ssl">
            <SSLManager />
          </TabsContent>

          <TabsContent value="logs">
            <LogViewer />
          </TabsContent>

          <TabsContent value="system">
            <SystemStatus systemStats={systemStats} />
          </TabsContent>

          <TabsContent value="backup">
            <BackupRestore />
          </TabsContent>
        </Tabs>

        <CreateConfigDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onConfigCreated={fetchConfigs}
        />
      </div>
    </div>
  )
}
