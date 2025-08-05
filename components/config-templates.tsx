"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Zap, Shield, Database, Code, Smartphone, Server } from "lucide-react"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface ConfigTemplate {
  name: string
  description: string
  category: string
  config: any
}

interface ConfigTemplatesProps {
  onTemplateSelect: (template: any) => void
}

export function ConfigTemplates({ onTemplateSelect }: ConfigTemplatesProps) {
  const [templates, setTemplates] = useState<ConfigTemplate[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getConfigTemplates() as { templates: ConfigTemplate[] }
      setTemplates(data.templates || [])
    } catch (error) {
      console.error("Failed to fetch config templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch config templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "web":
        return <Globe className="h-5 w-5" />
      case "api":
        return <Code className="h-5 w-5" />
      case "websocket":
        return <Zap className="h-5 w-5" />
      case "load-balancer":
        return <Server className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "web":
        return "bg-blue-100 text-blue-800"
      case "api":
        return "bg-green-100 text-green-800"
      case "websocket":
        return "bg-purple-100 text-purple-800"
      case "load-balancer":
        return "bg-orange-100 text-orange-800"
      case "database":
        return "bg-red-100 text-red-800"
      case "mobile":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "web":
        return "Web Application"
      case "api":
        return "API Gateway"
      case "websocket":
        return "WebSocket"
      case "load-balancer":
        return "Load Balancer"
      case "database":
        return "Database"
      case "mobile":
        return "Mobile App"
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  const handleTemplateSelect = (template: ConfigTemplate) => {
    onTemplateSelect(template)
    toast({
      title: "Template Selected",
      description: `${template.name} template has been selected`,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Configuration Templates</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuration Templates</h2>
          <p className="text-gray-600 mt-1">
            Choose from pre-configured templates to quickly set up your reverse proxy
          </p>
        </div>
      </div>

      {/* Template Categories */}
      <div className="grid gap-6">
        {templates.map((template, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTemplateSelect(template)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getCategoryIcon(template.category)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(template.category)}>
                    {getCategoryName(template.category)}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Port:</span> {template.config.listen_port || 80}
                  </div>
                  <div>
                    <span className="font-medium">Locations:</span> {template.config.locations?.length || 0}
                  </div>
                  {template.config.upstream && (
                    <div>
                      <span className="font-medium">Upstream:</span> {template.config.upstream.name}
                    </div>
                  )}
                  {template.config.rate_limit_global && (
                    <div>
                      <span className="font-medium">Rate Limit:</span> {template.config.rate_limit_global}
                    </div>
                  )}
                </div>

                {template.config.locations && template.config.locations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Locations:</h4>
                    <div className="space-y-1">
                      {template.config.locations.map((location: any, locIndex: number) => (
                        <div key={locIndex} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">{location.path}</span> → {location.backend}
                          {location.websocket && <Badge variant="outline" className="ml-2">WebSocket</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
              <p className="text-gray-500">
                No configuration templates are currently available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(new Set(templates.map(t => t.category))).map((category) => {
          const categoryTemplates = templates.filter(t => t.category === category)
          return (
            <Card key={category} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-2">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-medium">{getCategoryName(category)}</h3>
                <p className="text-sm text-gray-500">{categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
