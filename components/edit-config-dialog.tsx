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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, Globe, Zap, ArrowRight, Upload, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface EditConfigDialogProps {
  config: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigUpdated: () => void
}

export function EditConfigDialog({ config, open, onOpenChange, onConfigUpdated }: EditConfigDialogProps) {
  const [formData, setFormData] = useState(config)
  const [loading, setLoading] = useState(false)
  const [isPortForwarding, setIsPortForwarding] = useState(false)
  const [sslCertContent, setSslCertContent] = useState("")
  const [sslKeyContent, setSslKeyContent] = useState("")
  const [sslCertFile, setSslCertFile] = useState<File | null>(null)
  const [sslKeyFile, setSslKeyFile] = useState<File | null>(null)

  useEffect(() => {
    if (config) {
      setFormData({ ...config })
      // Determine if this is a port forwarding config based on server_name or id
      const isPortForward = config.id?.startsWith('port-forward-') ||
        config.server_name === '' ||
        config.server_name === null
      setIsPortForwarding(isPortForward)
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare form data for backend
      const configData = {
        ...formData,
        ssl_cert_content: sslCertContent || undefined,
        ssl_key_content: sslKeyContent || undefined,
        // Remove file paths if we have content
        ssl_cert: sslCertContent ? undefined : formData.ssl_cert,
        ssl_key: sslKeyContent ? undefined : formData.ssl_key,
      }

      await apiClient.updateConfig(config.id, configData)
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      })
      onConfigUpdated()
      onOpenChange(false)
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

  const handleSslCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSslCertFile(file)
      setSslCertContent("")
      setFormData({ ...formData, ssl_cert: file.name })
    }
  }

  const handleSslKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSslKeyFile(file)
      setSslKeyContent("")
      setFormData({ ...formData, ssl_key: file.name })
    }
  }

  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Configuration: {config.server_name || `Port Forward ${config.listen_port}`}</DialogTitle>
          <DialogDescription>Modify the reverse proxy configuration settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuration Type Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuration Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!isPortForwarding}
                    onCheckedChange={(checked) => setIsPortForwarding(!checked)}
                  />
                  <Label>Domain/Server Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isPortForwarding}
                    onCheckedChange={(checked) => setIsPortForwarding(checked)}
                  />
                  <Label>Port Forwarding</Label>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {isPortForwarding
                  ? "Simple port forwarding without domain name"
                  : "Reverse proxy with domain name configuration"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server_name">
                    {isPortForwarding ? "Port Forwarding Name" : "Server Name"}
                  </Label>
                  <Input
                    id="server_name"
                    value={formData.server_name}
                    onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                    placeholder={isPortForwarding ? "my-app or leave empty" : "example.com"}
                    required={!isPortForwarding}
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

          {/* SSL Configuration - Only show for domain mode */}
          {!isPortForwarding && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SSL Configuration (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                    <TabsTrigger value="text">Certificate Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssl_cert_file">SSL Certificate File</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="ssl_cert_file"
                            type="file"
                            accept=".pem,.crt,.cert"
                            onChange={handleSslCertFileChange}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {sslCertFile && (
                          <p className="text-sm text-green-600">✓ {sslCertFile.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ssl_key_file">SSL Private Key File</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="ssl_key_file"
                            type="file"
                            accept=".key,.pem"
                            onChange={handleSslKeyFileChange}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {sslKeyFile && (
                          <p className="text-sm text-green-600">✓ {sslKeyFile.name}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssl_cert_content">SSL Certificate Content</Label>
                        <Textarea
                          id="ssl_cert_content"
                          value={sslCertContent}
                          onChange={(e) => setSslCertContent(e.target.value)}
                          placeholder="-----BEGIN CERTIFICATE-----&#10;Your certificate content here...&#10;-----END CERTIFICATE-----"
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Paste your certificate content here</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ssl_key_content">SSL Private Key Content</Label>
                        <Textarea
                          id="ssl_key_content"
                          value={sslKeyContent}
                          onChange={(e) => setSslKeyContent(e.target.value)}
                          placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key content here...&#10;-----END PRIVATE KEY-----"
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Paste your private key content here</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {formData.server_name?.endsWith(".ptsi.co.id") && !formData.ssl_cert && !sslCertContent && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    <strong>Auto SSL:</strong> Wildcard certificate for *.ptsi.co.id will be used automatically.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {isPortForwarding ? "Forward Rules" : "Proxy Locations"}
                </CardTitle>
                <Button type="button" onClick={addLocation} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add {isPortForwarding ? "Rule" : "Location"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.locations?.map((location: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {isPortForwarding ? `Forward Rule ${index + 1}` : `Location ${index + 1}`}
                    </h4>
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
                        placeholder={isPortForwarding ? "127.0.0.1:3000" : "127.0.0.1:3000 or https://backend.com"}
                        required
                      />
                    </div>
                  </div>

                  {!isPortForwarding && (
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
                  )}

                  {isPortForwarding && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span>Port {formData.listen_port} → {location.backend}</span>
                    </div>
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
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
