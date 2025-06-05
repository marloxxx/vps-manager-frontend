"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface EditConfigDialogProps {
  config: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigUpdated: () => void
}

export function EditConfigDialog({ config, open, onOpenChange, onConfigUpdated }: EditConfigDialogProps) {
  const [formData, setFormData] = useState(config)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({ ...config })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/configs/${config.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration updated successfully",
        })
        onConfigUpdated()
        onOpenChange(false)
      } else {
        const error = await response.json()
        throw new Error(error.detail || "Failed to update configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        {
          path: "/",
          backend: "",
          websocket: false,
          ssl_verify: true,
          custom_headers: {},
        },
      ],
    })
  }

  const removeLocation = (index: number) => {
    if (formData.locations.length > 1) {
      const newLocations = formData.locations.filter((_: any, i: number) => i !== index)
      setFormData({ ...formData, locations: newLocations })
    }
  }

  const updateLocation = (index: number, field: string, value: any) => {
    const newLocations = [...formData.locations]
    newLocations[index] = { ...newLocations[index], [field]: value }
    setFormData({ ...formData, locations: newLocations })
  }

  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Configuration: {config.server_name}</DialogTitle>
          <DialogDescription>Modify the reverse proxy configuration settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server_name">Server Name</Label>
                  <Input
                    id="server_name"
                    value={formData.server_name}
                    onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                    required
                  />
                </div>
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Proxy Locations</CardTitle>
                <Button type="button" onClick={addLocation} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.locations?.map((location: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Location {index + 1}</h4>
                    {formData.locations.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeLocation(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Backend</Label>
                      <Input
                        value={location.backend}
                        onChange={(e) => updateLocation(index, "backend", e.target.value)}
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
                      <Label>WebSocket</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={location.ssl_verify}
                        onCheckedChange={(checked) => updateLocation(index, "ssl_verify", checked)}
                      />
                      <Label>SSL Verify</Label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
