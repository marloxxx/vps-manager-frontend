"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  HardDrive, 
  Memory, 
  Network, 
  Server, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { getCurrentMetrics, getMetricsHistory, getAlerts, resolveAlert } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface SystemMetrics {
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  nginx_connections: number
  nginx_requests_per_second: number
}

interface Alert {
  id: string
  rule_id: string
  timestamp: string
  metric: string
  value: number
  threshold: number
  status: string
  message: string
}

interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  operator: string
  duration: number
  enabled: boolean
}

export default function RealTimeMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const token = localStorage.getItem('token')
        const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws/monitoring?token=${token}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          setIsConnected(true)
          console.log('WebSocket connected')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'metrics') {
              setMetrics(data.system)
              setAlerts(data.alerts || [])
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          console.log('WebSocket disconnected')
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }

        wsRef.current = ws
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        
        // Load current metrics
        const metricsData = await getCurrentMetrics()
        setMetrics(metricsData.current)
        setAlerts(metricsData.alerts || [])
        
        // Load metrics history
        const historyData = await getMetricsHistory(parseInt(selectedTimeRange))
        setMetricsHistory(historyData.metrics || [])
        
      } catch (error) {
        console.error('Failed to load initial data:', error)
        toast({
          title: "Error",
          description: "Failed to load monitoring data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [selectedTimeRange, toast])

  // Load metrics history when time range changes
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await getMetricsHistory(parseInt(selectedTimeRange))
        setMetricsHistory(historyData.metrics || [])
      } catch (error) {
        console.error('Failed to load metrics history:', error)
      }
    }

    loadHistory()
  }, [selectedTimeRange])

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      toast({
        title: "Success",
        description: "Alert resolved successfully"
      })
    } catch (error) {
      console.error('Failed to resolve alert:', error)
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      })
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cpu_usage':
        return <Cpu className="h-4 w-4" />
      case 'memory_usage':
        return <Memory className="h-4 w-4" />
      case 'disk_usage':
        return <HardDrive className="h-4 w-4" />
      case 'network_in':
      case 'network_out':
        return <Network className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getMetricColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-red-500'
    if (value >= threshold * 0.8) return 'text-yellow-500'
    return 'text-green-500'
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Real-time Monitoring</h2>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <Progress value={0} className="mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Real-time Monitoring</h2>
          <p className="text-muted-foreground">
            Live system metrics and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Zap className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className={`h-4 w-4 ${getMetricColor(metrics?.cpu_usage || 0)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu_usage?.toFixed(1) || 0}%</div>
            <Progress value={metrics?.cpu_usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {metrics?.timestamp ? formatTimestamp(metrics.timestamp) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className={`h-4 w-4 ${getMetricColor(metrics?.memory_usage || 0)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory_usage?.toFixed(1) || 0}%</div>
            <Progress value={metrics?.memory_usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {metrics?.timestamp ? formatTimestamp(metrics.timestamp) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className={`h-4 w-4 ${getMetricColor(metrics?.disk_usage || 0)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.disk_usage?.toFixed(1) || 0}%</div>
            <Progress value={metrics?.disk_usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {metrics?.timestamp ? formatTimestamp(metrics.timestamp) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nginx Connections</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.nginx_connections || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.nginx_requests_per_second?.toFixed(2) || 0} req/s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>Real-time network usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network In</span>
                <Network className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatBytes((metrics?.network_in || 0) * 1024 * 1024)}
              </div>
              <Progress value={Math.min((metrics?.network_in || 0) / 100, 100)} className="mt-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Out</span>
                <Network className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatBytes((metrics?.network_out || 0) * 1024 * 1024)}
              </div>
              <Progress value={Math.min((metrics?.network_out || 0) / 100, 100)} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{alert.message}</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {alert.metric}: {alert.value} (threshold: {alert.threshold})
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics History */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics History</CardTitle>
          <CardDescription>Historical system performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium">Time Range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="168">7 days</option>
            </select>
          </div>
          
          {metricsHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Trend</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-20 bg-muted rounded flex items-end justify-between p-2">
                    {metricsHistory.slice(-10).map((metric, i) => (
                      <div
                        key={i}
                        className="bg-primary rounded-t"
                        style={{
                          height: `${metric.cpu_usage}%`,
                          width: `${100 / 10}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Trend</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-20 bg-muted rounded flex items-end justify-between p-2">
                    {metricsHistory.slice(-10).map((metric, i) => (
                      <div
                        key={i}
                        className="bg-primary rounded-t"
                        style={{
                          height: `${metric.memory_usage}%`,
                          width: `${100 / 10}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Trend</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-20 bg-muted rounded flex items-end justify-between p-2">
                    {metricsHistory.slice(-10).map((metric, i) => (
                      <div
                        key={i}
                        className="bg-primary rounded-t"
                        style={{
                          height: `${metric.disk_usage}%`,
                          width: `${100 / 10}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Showing last {Math.min(metricsHistory.length, 10)} data points
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No historical data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 