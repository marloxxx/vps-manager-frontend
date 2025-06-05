"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Server, Activity, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UpstreamServer {
  address: string
  weight: number
  status: "up" | "down" | "unknown"
  max_fails: number
  fail_timeout: string
}

interface LoadBalancerPool {
  name: string
  method: "round_robin" | "least_conn" | "ip_hash"
  servers: UpstreamServer[]
  health_check: boolean
  created_at: string
}

export function LoadBalancer() {
  const [pools, setPools] = useState<LoadBalancerPool[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newPool, setNewPool] = useState<Partial<LoadBalancerPool>>({
    name: "",
    method: "round_robin",
    servers: [],
    health_check: true,
  })

  const fetchPools = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockPools: LoadBalancerPool[] = [
        {
          name: "web_backend",
          method: "round_robin",
          health_check: true,
          created_at: new Date().toISOString(),
          servers: [
            {
              address: "192.168.1.10:3000",
              weight: 1,
              status: "up",
              max_fails: 3,
              fail_timeout: "30s",
            },
            {
              address: "192.168.1.11:3000",
              weight: 1,
              status: "up",
              max_fails: 3,
              fail_timeout: "30s",
            },
            {
              address: "192.168.1.12:3000",
              weight: 1,
              status: "down",
              max_fails: 3,
              fail_timeout: "30s",
            },
          ],
        },
        {
          name: "api_backend",
          method: "least_conn",
          health_check: true,
          created_at: new Date().toISOString(),
          servers: [
            {
              address: "192.168.1.20:8080",
              weight: 2,
              status: "up",
              max_fails: 3,
              fail_timeout: "30s",
            },
            {
              address: "192.168.1.21:8080",
              weight: 1,
              status: "up",
              max_fails: 3,
              fail_timeout: "30s",
            },
          ],
        },
      ]
      setPools(mockPools)
    } catch (error) {
      console.error("Failed to fetch load balancer pools:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPools()
  }, [])

  const addServer = () => {
    setNewPool({
      ...newPool,
      servers: [
        ...(newPool.servers || []),
        {
          address: "",
          weight: 1,
          status: "unknown",
          max_fails: 3,
          fail_timeout: "30s",
        },
      ],
    })
  }

  const removeServer = (index: number) => {
    const servers = [...(newPool.servers || [])]
    servers.splice(index, 1)
    setNewPool({ ...newPool, servers })
  }

  const updateServer = (index: number, field: keyof UpstreamServer, value: any) => {
    const servers = [...(newPool.servers || [])]
    servers[index] = { ...servers[index], [field]: value }
    setNewPool({ ...newPool, servers })
  }

  const createPool = async () => {
    try {
      // Validate form
      if (!newPool.name || !newPool.servers || newPool.servers.length === 0) {
        toast({
          title: "Error",
          description: "Please provide a name and at least one server",
          variant: "destructive",
        })
        return
      }

      // Mock API call
      const pool: LoadBalancerPool = {
        ...(newPool as LoadBalancerPool),
        created_at: new Date().toISOString(),
      }

      setPools([...pools, pool])
      setCreateDialogOpen(false)
      setNewPool({
        name: "",
        method: "round_robin",
        servers: [],
        health_check: true,
      })

      toast({
        title: "Success",
        description: "Load balancer pool created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create load balancer pool",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "down":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "up":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Up
          </Badge>
        )
      case "down":
        return <Badge variant="destructive">Down</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getMethodDescription = (method: string) => {
    switch (method) {
      case "round_robin":
        return "Requests are distributed evenly across all servers"
      case "least_conn":
        return "Requests go to the server with the fewest active connections"
      case "ip_hash":
        return "Client IP determines which server receives the request"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Load Balancer</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Load Balancer Pool</DialogTitle>
              <DialogDescription>Set up a new upstream pool for load balancing</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pool-name">Pool Name</Label>
                  <Input
                    id="pool-name"
                    value={newPool.name}
                    onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                    placeholder="web_backend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Load Balancing Method</Label>
                  <Select
                    value={newPool.method}
                    onValueChange={(value: any) => setNewPool({ ...newPool, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="least_conn">Least Connections</SelectItem>
                      <SelectItem value="ip_hash">IP Hash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPool.health_check}
                  onCheckedChange={(checked) => setNewPool({ ...newPool, health_check: checked })}
                />
                <Label>Enable health checks</Label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Backend Servers</Label>
                  <Button type="button" onClick={addServer} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Server
                  </Button>
                </div>

                {newPool.servers?.map((server, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Server {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeServer(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Address (IP:Port)</Label>
                        <Input
                          value={server.address}
                          onChange={(e) => updateServer(index, "address", e.target.value)}
                          placeholder="192.168.1.10:3000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <Input
                          type="number"
                          value={server.weight}
                          onChange={(e) => updateServer(index, "weight", Number.parseInt(e.target.value))}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPool}>Create Pool</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools.reduce((total, pool) => total + pool.servers.length, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Servers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pools.reduce((total, pool) => total + pool.servers.filter((server) => server.status === "up").length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Balancer Pools */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Loading load balancer pools...</div>
        ) : pools.length > 0 ? (
          pools.map((pool, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {pool.name}
                    </CardTitle>
                    <CardDescription>
                      {getMethodDescription(pool.method)} • {pool.servers.length} servers
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{pool.method.replace("_", " ")}</Badge>
                    {pool.health_check && <Badge variant="secondary">Health Check</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pool.servers.map((server, serverIndex) => (
                      <div key={serverIndex} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-sm">{server.address}</div>
                          {getStatusIcon(server.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(server.status)}
                          <div className="text-sm text-gray-600">Weight: {server.weight}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Max fails: {server.max_fails} • Timeout: {server.fail_timeout}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No load balancer pools</h3>
              <p className="text-gray-600 mb-4 text-center">
                Create your first load balancer pool to distribute traffic across multiple servers
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Pool
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
