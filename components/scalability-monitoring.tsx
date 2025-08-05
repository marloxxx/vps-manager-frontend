"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Network, 
  Server, 
  Activity, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
  BarChart3,
  Cpu,
  Memory,
  HardDrive
} from 'lucide-react'
import { 
  getCacheStats,
  clearCache,
  getConnectionPoolStats,
  getClusterNodes,
  getClusterLoad,
  getBackendHealthStatus,
  getTaskQueueStatus
} from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface CacheStats {
  redis: {
    connected: boolean
    memory_usage?: any
    keys?: number
  }
  memory_cache: {
    config_cache_size: number
    metrics_cache_size: number
  }
}

interface ConnectionPoolStats {
  available_connections: number
  in_use_connections: number
  max_connections: number
}

interface ClusterNode {
  id: string
  url: string
  capacity: number
  registered_at: string
  status: string
}

interface ClusterLoad {
  load_distribution: {
    [key: string]: {
      load: number
      capacity: number
      status: string
    }
  }
}

interface BackendHealth {
  backends: {
    [key: string]: {
      healthy: boolean
      last_check: string
    }
  }
  total_backends: number
  healthy_backends: number
}

interface TaskQueueStatus {
  pending_tasks: number
  thread_pool_size: number
  active_threads: number
}

export default function ScalabilityMonitoring() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [connectionStats, setConnectionStats] = useState<ConnectionPoolStats | null>(null)
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>([])
  const [clusterLoad, setClusterLoad] = useState<ClusterLoad | null>(null)
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null)
  const [taskQueueStatus, setTaskQueueStatus] = useState<TaskQueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setRefreshing(true)
      
      // Load all scalability data
      const [
        cacheData,
        connectionData,
        clusterNodesData,
        clusterLoadData,
        backendHealthData,
        taskQueueData
      ] = await Promise.all([
        getCacheStats(),
        getConnectionPoolStats(),
        getClusterNodes(),
        getClusterLoad(),
        getBackendHealthStatus(),
        getTaskQueueStatus()
      ])

      setCacheStats(cacheData)
      setConnectionStats(connectionData)
      setClusterNodes(clusterNodesData.nodes || [])
      setClusterLoad(clusterLoadData)
      setBackendHealth(backendHealthData)
      setTaskQueueStatus(taskQueueData)
      
    } catch (error) {
      console.error('Failed to load scalability data:', error)
      toast({
        title: "Error",
        description: "Failed to load scalability monitoring data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleClearCache = async () => {
    try {
      await clearCache()
      toast({
        title: "Success",
        description: "Cache cleared successfully"
      })
      loadData() // Reload data after clearing cache
    } catch (error) {
      console.error('Failed to clear cache:', error)
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      })
    }
  }

  const getConnectionUtilization = () => {
    if (!connectionStats) return 0
    return (connectionStats.in_use_connections / connectionStats.max_connections) * 100
  }

  const getConnectionStatus = () => {
    const utilization = getConnectionUtilization()
    if (utilization >= 90) return 'critical'
    if (utilization >= 70) return 'warning'
    return 'healthy'
  }

  const getCacheHitRate = () => {
    if (!cacheStats) return 0
    // Mock calculation - in real implementation this would come from metrics
    return Math.random() * 100
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Scalability Monitoring</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
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
          <h2 className="text-3xl font-bold tracking-tight">Scalability Monitoring</h2>
          <p className="text-muted-foreground">
            Performance and resource utilization monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
          >
            <Zap className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Cache Performance
          </CardTitle>
          <CardDescription>
            Redis and in-memory cache statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Redis Status</span>
                <Badge variant={cacheStats?.redis?.connected ? "default" : "destructive"}>
                  {cacheStats?.redis?.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {cacheStats?.redis?.keys || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total Keys</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Config Cache</span>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {cacheStats?.memory_cache?.config_cache_size || 0}
              </div>
              <p className="text-xs text-muted-foreground">Cached Items</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Metrics Cache</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {cacheStats?.memory_cache?.metrics_cache_size || 0}
              </div>
              <p className="text-xs text-muted-foreground">Cached Items</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hit Rate</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {getCacheHitRate().toFixed(1)}%
              </div>
              <Progress value={getCacheHitRate()} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Connection Pool
          </CardTitle>
          <CardDescription>
            Database connection pool utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {connectionStats?.available_connections || 0}
              </div>
              <p className="text-xs text-muted-foreground">Free connections</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Use</span>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {connectionStats?.in_use_connections || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active connections</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilization</span>
                <Badge variant={getConnectionStatus() === 'critical' ? 'destructive' : 
                               getConnectionStatus() === 'warning' ? 'secondary' : 'default'}>
                  {getConnectionStatus()}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {getConnectionUtilization().toFixed(1)}%
              </div>
              <Progress value={getConnectionUtilization()} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cluster Management */}
      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes">Cluster Nodes</TabsTrigger>
          <TabsTrigger value="load">Load Distribution</TabsTrigger>
          <TabsTrigger value="health">Backend Health</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Nodes</CardTitle>
              <CardDescription>
                Registered nodes in the cluster
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clusterNodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-8 w-8 mx-auto mb-2" />
                  <p>No cluster nodes registered</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clusterNodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{node.id}</p>
                          <p className="text-sm text-muted-foreground">{node.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                          {node.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Capacity: {node.capacity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Load Distribution</CardTitle>
              <CardDescription>
                Current load across cluster nodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clusterLoad && Object.keys(clusterLoad.load_distribution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(clusterLoad.load_distribution).map(([nodeId, stats]) => (
                    <div key={nodeId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{nodeId}</span>
                        <Badge variant={stats.status === 'active' ? 'default' : 'secondary'}>
                          {stats.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Load</p>
                          <p className="text-lg font-semibold">{stats.load.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className="text-lg font-semibold">{stats.capacity}</p>
                        </div>
                      </div>
                      <Progress value={stats.load} className="mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No load distribution data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backend Health</CardTitle>
              <CardDescription>
                Health status of all backend services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backendHealth && Object.keys(backendHealth.backends).length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Overall Status</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {backendHealth.healthy_backends}/{backendHealth.total_backends} healthy
                      </span>
                      <Badge variant={backendHealth.healthy_backends === backendHealth.total_backends ? 'default' : 'destructive'}>
                        {backendHealth.healthy_backends === backendHealth.total_backends ? 'All Healthy' : 'Issues Detected'}
                      </Badge>
                    </div>
                  </div>
                  
                  {Object.entries(backendHealth.backends).map(([backend, health]) => (
                    <div key={backend} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {health.healthy ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{backend}</p>
                          <p className="text-sm text-muted-foreground">
                            Last check: {new Date(health.last_check).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={health.healthy ? 'default' : 'destructive'}>
                        {health.healthy ? 'Healthy' : 'Unhealthy'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No backend health data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
              <CardDescription>
                Background task processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taskQueueStatus ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Tasks</span>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {taskQueueStatus.pending_tasks}
                    </div>
                    <p className="text-xs text-muted-foreground">In queue</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Thread Pool</span>
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {taskQueueStatus.thread_pool_size}
                    </div>
                    <p className="text-xs text-muted-foreground">Max workers</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Threads</span>
                      <Memory className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {taskQueueStatus.active_threads}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently working</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <p>No task queue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 