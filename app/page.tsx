"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  Database,
  FileText,
  Activity,
  BarChart3,
  Server,
  Zap,
  Monitor,
  AlertTriangle,
  Network,
  Cpu
} from 'lucide-react'

// Import existing components
import { ConfigList } from '@/components/config-list'
import { CreateConfigDialog } from '@/components/create-config-dialog'
import { EditConfigDialog } from '@/components/edit-config-dialog'
import { SystemStatus } from '@/components/system-status'
import { BackupRestore } from '@/components/backup-restore'
import { SSLManager } from '@/components/ssl-manager'
import { LoadBalancer } from '@/components/load-balancer'
import { ConfigTemplates } from '@/components/config-templates'
import { LogViewer } from '@/components/log-viewer'

// Import new components
import RealTimeMonitoring from '@/components/real-time-monitoring'
import AdvancedLogging from '@/components/advanced-logging'
import ScalabilityMonitoring from '@/components/scalability-monitoring'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('configs')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [configs, setConfigs] = useState([])
  const [systemStats, setSystemStats] = useState(null)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">VPS Manager Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">v2.0.0</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="configs" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Configs
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="logging" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Logging
          </TabsTrigger>
          <TabsTrigger value="scalability" className="flex items-center">
            <Cpu className="mr-2 h-4 w-4" />
            Scalability
          </TabsTrigger>
          <TabsTrigger value="ssl" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            SSL
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="loadbalancer" className="flex items-center">
            <Network className="mr-2 h-4 w-4" />
            Load Balancer
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Server className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Configuration Management */}
        <TabsContent value="configs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Nginx Configurations</h3>
              <p className="text-sm text-muted-foreground">
                Manage your Nginx server configurations
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Create Config
            </Button>
          </div>
          <ConfigList configs={configs} onConfigsChange={() => { }} loading={false} />
        </TabsContent>

        {/* Real-time Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <RealTimeMonitoring />
        </TabsContent>

        {/* Advanced Logging */}
        <TabsContent value="logging" className="space-y-4">
          <AdvancedLogging />
        </TabsContent>

        {/* Scalability Monitoring */}
        <TabsContent value="scalability" className="space-y-4">
          <ScalabilityMonitoring />
        </TabsContent>

        {/* SSL Certificate Management */}
        <TabsContent value="ssl" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">SSL Certificate Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage SSL certificates and Let's Encrypt integration
              </p>
            </div>
          </div>
          <SSLManager />
        </TabsContent>

        {/* Backup & Restore */}
        <TabsContent value="backup" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Backup & Restore</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage system backups
              </p>
            </div>
          </div>
          <BackupRestore />
        </TabsContent>

        {/* Load Balancer */}
        <TabsContent value="loadbalancer" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Load Balancer</h3>
              <p className="text-sm text-muted-foreground">
                Manage load balancer pools and configurations
              </p>
            </div>
          </div>
          <LoadBalancer />
        </TabsContent>

        {/* Configuration Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Configuration Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-defined Nginx configuration templates
              </p>
            </div>
          </div>
          <ConfigTemplates onTemplateSelect={() => { }} />
        </TabsContent>

        {/* Log Viewer */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Log Viewer</h3>
              <p className="text-sm text-muted-foreground">
                View and analyze system logs
              </p>
            </div>
          </div>
          <LogViewer />
        </TabsContent>

        {/* System Status */}
        <TabsContent value="system" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">System Status</h3>
              <p className="text-sm text-muted-foreground">
                Monitor system health and performance
              </p>
            </div>
          </div>
          <SystemStatus systemStats={systemStats} />
        </TabsContent>
      </Tabs>

      {/* Create Configuration Dialog */}
      {showCreateDialog && (
        <CreateConfigDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onConfigCreated={() => { }}
        />
      )}

      {/* Edit Configuration Dialog */}
      {editingConfig && (
        <EditConfigDialog
          config={editingConfig}
          open={!!editingConfig}
          onOpenChange={(open) => !open && setEditingConfig(null)}
          onConfigUpdated={() => { }}
        />
      )}
    </div>
  )
}
