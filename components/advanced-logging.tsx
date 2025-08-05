"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  Shield, 
  Activity, 
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  getStructuredLogs, 
  getAuditLogs, 
  getPerformanceLogs, 
  getSecurityLogs,
  getLogRetentionPolicy,
  updateLogRetentionPolicy,
  cleanupOldLogs
} from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  source: string
  user_id?: string
  action?: string
  resource?: string
  ip_address?: string
  user_agent?: string
  duration_ms?: number
  status_code?: number
  request_id?: string
}

interface LogFilter {
  level?: string
  source?: string
  start_time?: string
  end_time?: string
  user_id?: string
  action?: string
  limit: number
}

interface LogRetentionPolicy {
  nginx_logs_days: number
  api_logs_days: number
  system_logs_days: number
  audit_logs_days: number
  enabled: boolean
}

export default function AdvancedLogging() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<LogFilter>({
    limit: 1000
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLogType, setSelectedLogType] = useState('structured')
  const [retentionPolicy, setRetentionPolicy] = useState<LogRetentionPolicy | null>(null)
  const [showRetentionDialog, setShowRetentionDialog] = useState(false)
  
  const { toast } = useToast()

  // Load logs based on type and filter
  const loadLogs = async () => {
    try {
      setLoading(true)
      let response

      switch (selectedLogType) {
        case 'structured':
          response = await getStructuredLogs(filter)
          break
        case 'audit':
          response = await getAuditLogs(filter)
          break
        case 'performance':
          response = await getPerformanceLogs(filter)
          break
        case 'security':
          response = await getSecurityLogs(filter)
          break
        default:
          response = await getStructuredLogs(filter)
      }

      setLogs(response.logs || [])
    } catch (error) {
      console.error('Failed to load logs:', error)
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load retention policy
  const loadRetentionPolicy = async () => {
    try {
      const policy = await getLogRetentionPolicy()
      setRetentionPolicy(policy)
    } catch (error) {
      console.error('Failed to load retention policy:', error)
    }
  }

  // Load initial data
  useEffect(() => {
    loadLogs()
    loadRetentionPolicy()
  }, [selectedLogType, filter])

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCleanup = async () => {
    try {
      await cleanupOldLogs()
      toast({
        title: "Success",
        description: "Log cleanup completed successfully"
      })
      loadLogs() // Reload logs after cleanup
    } catch (error) {
      console.error('Failed to cleanup logs:', error)
      toast({
        title: "Error",
        description: "Failed to cleanup logs",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRetentionPolicy = async (policy: LogRetentionPolicy) => {
    try {
      await updateLogRetentionPolicy(policy)
      setRetentionPolicy(policy)
      toast({
        title: "Success",
        description: "Retention policy updated successfully"
      })
      setShowRetentionDialog(false)
    } catch (error) {
      console.error('Failed to update retention policy:', error)
      toast({
        title: "Error",
        description: "Failed to update retention policy",
        variant: "destructive"
      })
    }
  }

  const getLogLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getLogLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Badge variant="destructive">{level}</Badge>
      case 'warning':
        return <Badge variant="secondary">{level}</Badge>
      case 'info':
        return <Badge variant="default">{level}</Badge>
      case 'success':
        return <Badge variant="outline">{level}</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Logging</h2>
          <p className="text-muted-foreground">
            Comprehensive log management and analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowRetentionDialog(true)}
          >
            <Clock className="mr-2 h-4 w-4" />
            Retention Policy
          </Button>
          <Button
            variant="outline"
            onClick={handleCleanup}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Log Type Selection */}
      <Tabs value={selectedLogType} onValueChange={setSelectedLogType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structured" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Structured
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Structured Logs</CardTitle>
              <CardDescription>
                Application logs with structured data and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer 
                logs={filteredLogs}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                getLogLevelIcon={getLogLevelIcon}
                getLogLevelBadge={getLogLevelBadge}
                formatTimestamp={formatTimestamp}
                formatDuration={formatDuration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                User actions and compliance tracking logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer 
                logs={filteredLogs}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                getLogLevelIcon={getLogLevelIcon}
                getLogLevelBadge={getLogLevelBadge}
                formatTimestamp={formatTimestamp}
                formatDuration={formatDuration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Logs</CardTitle>
              <CardDescription>
                Request timing and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer 
                logs={filteredLogs}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                getLogLevelIcon={getLogLevelIcon}
                getLogLevelBadge={getLogLevelBadge}
                formatTimestamp={formatTimestamp}
                formatDuration={formatDuration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>
                Security events and threat detection logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer 
                logs={filteredLogs}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                getLogLevelIcon={getLogLevelIcon}
                getLogLevelBadge={getLogLevelBadge}
                formatTimestamp={formatTimestamp}
                formatDuration={formatDuration}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Retention Policy Dialog */}
      {showRetentionDialog && retentionPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Log Retention Policy</CardTitle>
              <CardDescription>
                Configure how long to keep different types of logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nginx Logs (days)</label>
                <Input
                  type="number"
                  value={retentionPolicy.nginx_logs_days}
                  onChange={(e) => setRetentionPolicy({
                    ...retentionPolicy,
                    nginx_logs_days: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Logs (days)</label>
                <Input
                  type="number"
                  value={retentionPolicy.api_logs_days}
                  onChange={(e) => setRetentionPolicy({
                    ...retentionPolicy,
                    api_logs_days: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">System Logs (days)</label>
                <Input
                  type="number"
                  value={retentionPolicy.system_logs_days}
                  onChange={(e) => setRetentionPolicy({
                    ...retentionPolicy,
                    system_logs_days: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Logs (days)</label>
                <Input
                  type="number"
                  value={retentionPolicy.audit_logs_days}
                  onChange={(e) => setRetentionPolicy({
                    ...retentionPolicy,
                    audit_logs_days: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={retentionPolicy.enabled}
                  onChange={(e) => setRetentionPolicy({
                    ...retentionPolicy,
                    enabled: e.target.checked
                  })}
                />
                <label htmlFor="enabled" className="text-sm">Enable automatic cleanup</label>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleUpdateRetentionPolicy(retentionPolicy)}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRetentionDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

interface LogViewerProps {
  logs: LogEntry[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  filter: LogFilter
  setFilter: (filter: LogFilter) => void
  getLogLevelIcon: (level: string) => React.ReactNode
  getLogLevelBadge: (level: string) => React.ReactNode
  formatTimestamp: (timestamp: string) => string
  formatDuration: (duration: number) => string
}

function LogViewer({
  logs,
  loading,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  getLogLevelIcon,
  getLogLevelBadge,
  formatTimestamp,
  formatDuration
}: LogViewerProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filter.level || ''}
          onValueChange={(value) => setFilter({ ...filter, level: value || undefined })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.source || ''}
          onValueChange={(value) => setFilter({ ...filter, source: value || undefined })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sources</SelectItem>
            <SelectItem value="nginx">Nginx</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Limit"
          value={filter.limit}
          onChange={(e) => setFilter({ ...filter, limit: parseInt(e.target.value) })}
          className="w-24"
        />
      </div>

      {/* Logs */}
      <div className="border rounded-lg">
        <div className="p-4 bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {loading ? 'Loading...' : `${logs.length} logs`}
            </span>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No logs found
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log, index) => (
                <div key={index} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getLogLevelIcon(log.level)}
                      {getLogLevelBadge(log.level)}
                      <Badge variant="outline">{log.source}</Badge>
                      {log.duration_ms && (
                        <Badge variant="secondary">
                          {formatDuration(log.duration_ms)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{log.message}</p>
                    <div className="mt-1 text-xs text-muted-foreground space-x-4">
                      {log.user_id && (
                        <span>User: {log.user_id}</span>
                      )}
                      {log.action && (
                        <span>Action: {log.action}</span>
                      )}
                      {log.resource && (
                        <span>Resource: {log.resource}</span>
                      )}
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
                      )}
                      {log.status_code && (
                        <span>Status: {log.status_code}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 