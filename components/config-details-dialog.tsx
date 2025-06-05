"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Globe, Shield, Zap, Clock } from "lucide-react"

interface ConfigDetailsDialogProps {
  config: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigDetailsDialog({ config, open, onOpenChange }: ConfigDetailsDialogProps) {
  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {config.server_name}
          </DialogTitle>
          <DialogDescription>Configuration details and settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Configuration ID</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{config.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Server Name</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{config.server_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Listen Port</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{config.listen_port}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="pt-2">
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SSL Configuration */}
          {(config.ssl_cert || config.server_name.endsWith(".ptsi.co.id")) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSL Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {config.ssl_cert ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Certificate Path</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{config.ssl_cert}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Private Key Path</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{config.ssl_key}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    <strong>Auto SSL:</strong> Using wildcard certificate for *.ptsi.co.id
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Proxy Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Proxy Locations ({config.locations?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.locations?.map((location: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Location {index + 1}</h4>
                    <div className="flex gap-2">
                      {location.websocket && <Badge variant="outline">WebSocket</Badge>}
                      {!location.ssl_verify && <Badge variant="destructive">No SSL Verify</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Path</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{location.path}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Backend</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{location.backend}</p>
                    </div>
                  </div>

                  {location.custom_headers && Object.keys(location.custom_headers).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Custom Headers</label>
                      <div className="mt-2 space-y-1">
                        {Object.entries(location.custom_headers).map(([key, value]: [string, any]) => (
                          <div key={key} className="font-mono text-sm bg-gray-100 p-2 rounded">
                            <span className="font-semibold">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-sm bg-gray-100 p-2 rounded">{new Date(config.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Updated At</label>
                  <p className="text-sm bg-gray-100 p-2 rounded">{new Date(config.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
