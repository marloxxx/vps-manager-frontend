"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Globe, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProxyLocation {
  path: string
  backend: string
  websocket: boolean
  ssl_verify: boolean
  custom_headers: Record<string, string>
}

interface CreateConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigCreated: () => void
}

export function CreateConfigDialog({ open, onOpenChange, onConfigCreated }: CreateConfigDialogProps) {
  const [formData, setFormData] = useState({
    id: "",
    server_name: "",
    listen_port: 80,
    ssl_cert: "",
    ssl_key: "",
    is_active: true,
  })

  const [locations, setLocations] = useState<ProxyLocation[]>([
    {
      path: "/",
      backend: "",
      websocket: false,
      ssl_verify: true,
      custom_headers: {},
    },
  ])

  const [loading, setLoading] = useState(false)

  const addLocation = () => {
    setLocations([
      ...locations,
      {
        path: "/",
        backend: "",
        websocket: false,
        ssl_verify: true,
        custom_headers: {},
      },
    ])
  }

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index))
    }
  }

  const updateLocation = (index: number, field: keyof ProxyLocation, value: any) => {
    const updated = [...locations]
    updated[index] = { ...updated[index], [field]: value }
    setLocations(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const config = {
        ...formData,
        locations: locations.filter((loc) => loc.path && loc.backend),
      }

      const response = await fetch("/api/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration created successfully",
        })
        onConfigCreated()
        onOpenChange(false)
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.detail || "Failed to create configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      server_name: "",
      listen_port: 80,
      ssl_cert: "",
      ssl_key: "",
      is_active: true,
    })
    setLocations([
      {
        path: "/",
        backend: "",
        websocket: false,
        ssl_verify: true,
        custom_headers: {},
      },
    ])
  }

  const generateId = () => {
    const id = formData.server_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    setFormData({ ...formData, id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Configuration</DialogTitle>
          <DialogDescription>Set up a new reverse proxy configuration for your domain.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server_name">Server Name (Domain)</Label>
                  <Input
                    id="server_name"
                    value={formData.server_name}
                    onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                    placeholder="example.com"
                    required
                    onBlur={generateId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">Configuration ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="example-com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listen_port">Listen Port</Label>
                  <Input
                    id="listen_port"
                    type="number"
                    value={formData.listen_port}
                    onChange={(e) => setFormData({ ...formData, listen_port: Number.parseInt(e.target.value) })}
                    min="1"
                    max="65535"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Enable immediately</Label>
                </div>
              </div>

              {/* SSL Configuration */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">SSL Configuration (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ssl_cert">SSL Certificate Path</Label>
                    <Input
                      id="ssl_cert"
                      value={formData.ssl_cert}
                      onChange={(e) => setFormData({ ...formData, ssl_cert: e.target.value })}
                      placeholder="/path/to/cert.pem"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssl_key">SSL Private Key Path</Label>
                    <Input
                      id="ssl_key"
                      value={formData.ssl_key}
                      onChange={(e) => setFormData({ ...formData, ssl_key: e.target.value })}
                      placeholder="/path/to/private.key"
                    />
                  </div>
                </div>
                {formData.server_name.endsWith(".ptsi.co.id") && !formData.ssl_cert && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    <strong>Auto SSL:</strong> Wildcard certificate for *.ptsi.co.id will be used automatically.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proxy Locations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Proxy Locations
                </CardTitle>
                <Button type="button" onClick={addLocation} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Location {index + 1}</h4>
                    {locations.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeLocation(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Path</Label>
                      <Input
                        value={location.path}
                        onChange={(e) => updateLocation(index, "path", e.target.value)}
                        placeholder="/"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Backend</Label>
                      <Input
                        value={location.backend}
                        onChange={(e) => updateLocation(index, "backend", e.target.value)}
                        placeholder="127.0.0.1:3000 or https://backend.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={location.websocket}
                        onCheckedChange={(checked) => updateLocation(index, "websocket", checked)}
                      />
                      <Label>WebSocket Support</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={location.ssl_verify}
                        onCheckedChange={(checked) => updateLocation(index, "ssl_verify", checked)}
                      />
                      <Label>SSL Verification</Label>
                    </div>
                  </div>

                  {location.websocket && (
                    <Badge variant="secondary" className="w-fit">
                      WebSocket enabled - HTTP/1.1 will be used
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
