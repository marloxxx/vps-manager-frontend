"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Eye, Copy, TestTube } from "lucide-react"
import { EditConfigDialog } from "./edit-config-dialog"
import { ConfigDetailsDialog } from "./config-details-dialog"
import { toast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Config {
  id: string
  server_name: string
  listen_port: number
  locations: Array<{
    path: string
    backend: string
    websocket: boolean
  }>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ConfigListProps {
  configs: Config[]
  onConfigsChange: () => void
  loading: boolean
}

export function ConfigList({ configs, onConfigsChange, loading }: ConfigListProps) {
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [viewingConfig, setViewingConfig] = useState<Config | null>(null)
  const [deletingConfig, setDeletingConfig] = useState<Config | null>(null)

  const handleToggleActive = async (config: Config) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/configs/${config.id}/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Configuration ${config.is_active ? "disabled" : "enabled"} successfully`,
        })
        onConfigsChange()
      } else {
        throw new Error("Failed to toggle configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle configuration status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (config: Config) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/configs/${config.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration deleted successfully",
        })
        onConfigsChange()
      } else {
        throw new Error("Failed to delete configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      })
    }
    setDeletingConfig(null)
  }

  const handleDuplicate = async (config: Config) => {
    try {
      const newConfig = {
        ...config,
        id: `${config.id}_copy_${Date.now()}`,
        server_name: `${config.server_name}_copy`,
        is_active: false,
      }
      delete (newConfig as any).created_at
      delete (newConfig as any).updated_at

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/configs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newConfig),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration duplicated successfully",
        })
        onConfigsChange()
      } else {
        throw new Error("Failed to duplicate configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate configuration",
        variant: "destructive",
      })
    }
  }

  const handleTest = async (config: Config) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/configs/${config.id}/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Test Result",
          description: result.success ? "Configuration test passed" : `Test failed: ${result.error}`,
          variant: result.success ? "default" : "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test configuration",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No configurations found</h3>
            <p className="text-gray-600 mb-4">Create your first reverse proxy configuration to get started.</p>
            <Button>Create Configuration</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <Card key={config.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{config.server_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingConfig(config)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingConfig(config)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(config)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTest(config)}>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Config
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingConfig(config)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription>
                Port {config.listen_port} • {config.locations.length} location{config.locations.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Switch checked={config.is_active} onCheckedChange={() => handleToggleActive(config)} />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Locations:</span>
                  {config.locations.slice(0, 2).map((location, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-mono">{location.path}</div>
                      <div className="text-gray-600 text-xs">→ {location.backend}</div>
                      {location.websocket && (
                        <Badge variant="outline" className="text-xs mt-1">
                          WebSocket
                        </Badge>
                      )}
                    </div>
                  ))}
                  {config.locations.length > 2 && (
                    <div className="text-sm text-gray-500">+{config.locations.length - 2} more locations</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingConfig && (
        <EditConfigDialog
          config={editingConfig}
          open={!!editingConfig}
          onOpenChange={(open) => !open && setEditingConfig(null)}
          onConfigUpdated={onConfigsChange}
        />
      )}

      {viewingConfig && (
        <ConfigDetailsDialog
          config={viewingConfig}
          open={!!viewingConfig}
          onOpenChange={(open) => !open && setViewingConfig(null)}
        />
      )}

      <AlertDialog open={!!deletingConfig} onOpenChange={(open) => !open && setDeletingConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the configuration for "{deletingConfig?.server_name}"? This action cannot
              be undone and will remove the Nginx configuration file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingConfig && handleDelete(deletingConfig)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
