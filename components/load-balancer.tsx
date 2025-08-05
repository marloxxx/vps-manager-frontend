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
import { apiClient } from "@/lib/api"

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
  const [creating, setCreating] = useState(false)
  const [newPool, setNewPool] = useState<Partial<LoadBalancerPool>>({
    name: "",
    method: "round_robin",
    servers: [],
    health_check: true,
  })

  const fetchPools = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getLoadBalancerPools() as { pools: LoadBalancerPool[] }
      setPools(data.pools || [])
    } catch (error) {
      console.error("Failed to fetch load balancer pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch load balancer pools",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPools()
  }, [])

  const addServer = () => {
    const newServer: UpstreamServer = {
      address: "",
      weight: 1,
      status: "unknown",
      max_fails: 3,
      fail_timeout: "30s",
    }
    setNewPool({
      ...newPool,
      servers: [...(newPool.servers || []), newServer],
    })
  }

  const removeServer = (index: number) => {
    const updatedServers = [...(newPool.servers || [])]
    updatedServers.splice(index, 1)
    setNewPool({ ...newPool, servers: updatedServers })
  }

  const updateServer = (index: number, field: keyof UpstreamServer, value: any) => {
    const updatedServers = [...(newPool.servers || [])]
    updatedServers[index] = { ...updatedServers[index], [field]: value }
    setNewPool({ ...newPool, servers: updatedServers })
  }

  const createPool = async () => {
    if (!newPool.name || !newPool.servers || newPool.servers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      await apiClient.createLoadBalancerPool(newPool)
      toast({
        title: "Success",
        description: "Load balancer pool created successfully",
      })
      setCreateDialogOpen(false)
      setNewPool({
        name: "",
        method: "round_robin",
        servers: [],
        health_check: true,
      })
      fetchPools()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create load balancer pool",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "down":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "up":
        return <Badge variant="default">Up</Badge>
      case "down":
        return <Badge variant="destructive">Down</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getMethodDescription = (method: string) => {
    switch (method) {
      case "round_robin":
        return "Distributes requests evenly across servers"
      case "least_conn":
        return "Sends requests to server with fewest active connections"
      case "ip_hash":
        return "Routes requests based on client IP address"
      default:
        return "Unknown method"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Load Balancer</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Pool
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading load balancer pools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Load Balancer</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {/* Load Balancer Pools */}
      <div className="grid gap-6">
        {pools.map((pool, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {pool.name}
                  </CardTitle>
                  <CardDescription>{getMethodDescription(pool.method)}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={pool.health_check ? "default" : "secondary"}>
                    {pool.health_check ? "Health Check Enabled" : "Health Check Disabled"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Method:</span> {pool.method}
                  </div>
                  <div>
                    <span className="font-medium">Servers:</span> {pool.servers.length}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(pool.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Servers</h4>
                  <div className="grid gap-2">
                    {pool.servers.map((server, serverIndex) => (
                      <div
                        key={serverIndex}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(server.status)}
                          <div>
                            <div className="font-medium">{server.address}</div>
                            <div className="text-sm text-gray-500">
                              Weight: {server.weight} | Max Fails: {server.max_fails} | Timeout: {server.fail_timeout}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(server.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {pools.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Load Balancer Pools</h3>
              <p className="text-gray-500 mb-4">
                No load balancer pools found. Create a new pool to get started.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Pool
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Pool Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Load Balancer Pool</DialogTitle>
            <DialogDescription>
              Create a new load balancer pool to distribute traffic across multiple servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pool-name">Pool Name</Label>
              <Input
                id="pool-name"
                value={newPool.name}
                onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                placeholder="web_backend"
              />
            </div>

            <div>
              <Label htmlFor="method">Load Balancing Method</Label>
              <Select
                value={newPool.method}
                onValueChange={(value) => setNewPool({ ...newPool, method: value as any })}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="health-check"
                checked={newPool.health_check}
                onCheckedChange={(checked) => setNewPool({ ...newPool, health_check: checked })}
              />
              <Label htmlFor="health-check">Enable Health Checks</Label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Servers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addServer}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Server
                </Button>
              </div>
              <div className="space-y-2">
                {newPool.servers?.map((server, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Input
                      placeholder="192.168.1.10:3000"
                      value={server.address}
                      onChange={(e) => updateServer(index, "address", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="1"
                      value={server.weight}
                      onChange={(e) => updateServer(index, "weight", parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="3"
                      value={server.max_fails}
                      onChange={(e) => updateServer(index, "max_fails", parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Input
                      placeholder="30s"
                      value={server.fail_timeout}
                      onChange={(e) => updateServer(index, "fail_timeout", e.target.value)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeServer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createPool} disabled={creating}>
              {creating ? "Creating..." : "Create Pool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
