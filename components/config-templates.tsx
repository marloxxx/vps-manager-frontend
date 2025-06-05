"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Zap, Shield, Database, Code, Smartphone, Server } from "lucide-react"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

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
      // Mock templates for now
      const mockTemplates: ConfigTemplate[] = [
        {
          name: "Basic Web App",
          description: "Simple reverse proxy for web applications with basic security headers",
          category: "web",
          config: {
            listen_port: 80,
            security_headers: true,
            gzip_enabled: true,
            locations: [
              {
                path: "/",
                backend: "127.0.0.1:3000",
                websocket: false,
                ssl_verify: true,
              },
            ],
          },
        },
        {
          name: "API Gateway",
          description: "API gateway with rate limiting and CORS support",
          category: "api",
          config: {
            listen_port: 80,
            rate_limit_global: "100r/m",
            security_headers: true,
            locations: [
              {
                path: "/api/",
                backend: "127.0.0.1:8080",
                rate_limit: "10r/s",
                custom_headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                },
              },
            ],
          },
        },
        {
          name: "WebSocket Application",
          description: "WebSocket application with upgrade support and connection handling",
          category: "websocket",
          config: {
            listen_port: 80,
            locations: [
              {
                path: "/",
                backend: "127.0.0.1:3000",
                websocket: true,
                proxy_http_version: "1.1",
              },
            ],
          },
        },
        {
          name: "Load Balanced App",
          description: "Load balanced application with multiple backend servers",
          category: "load-balancer",
          config: {
            listen_port: 80,
            upstream: {
              name: "app_backend",
              method: "round_robin",
              health_check: true,
              servers: ["127.0.0.1:3000", "127.0.0.1:3001", "127.0.0.1:3002"],
            },
            locations: [
              {
                path: "/",
                backend: "app_backend",
              },
            ],
          },
        },
        {
          name: "Static Site with CDN",
          description: "Static site hosting with CDN-like caching and compression",
          category: "static",
          config: {
            listen_port: 80,
            gzip_enabled: true,
            security_headers: true,
            locations: [
              {
                path: "/",
                backend: "127.0.0.1:8080",
                custom_headers: {
                  "Cache-Control": "public, max-age=31536000",
                },
              },
            ],
          },
        },
        {
          name: "Microservices Gateway",
          description: "Gateway for microservices with path-based routing",
          category: "microservices",
          config: {
            listen_port: 80,
            rate_limit_global: "200r/m",
            locations: [
              {
                path: "/auth/",
                backend: "127.0.0.1:3001",
              },
              {
                path: "/users/",
                backend: "127.0.0.1:3002",
              },
              {
                path: "/orders/",
                backend: "127.0.0.1:3003",
              },
              {
                path: "/",
                backend: "127.0.0.1:3000",
              },
            ],
          },
        },
      ]
      setTemplates(mockTemplates)
    } catch (error) {
      console.error("Failed to fetch templates:", error)
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
        return <Zap className="h-5 w-5" />
      case "websocket":
        return <Server className="h-5 w-5" />
      case "load-balancer":
        return <Shield className="h-5 w-5" />
      case "static":
        return <Globe className="h-5 w-5" />
      case "microservices":
        return <Server className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const getCategoryColorOld = (category: string) => {
    switch (category) {
      case "web":
        return "bg-blue-100 text-blue-800"
      case "api":
        return "bg-green-100 text-green-800"
      case "websocket":
        return "bg-purple-100 text-purple-800"
      case "load-balancer":
        return "bg-orange-100 text-orange-800"
      case "static":
        return "bg-gray-100 text-gray-800"
      case "microservices":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const templates2 = [
    {
      id: "web-app",
      name: "Web Application",
      description: "Standard web application with static files and API proxy",
      icon: Globe,
      category: "Web",
      config: {
        listen_port: 80,
        locations: [
          { path: "/", backend: "127.0.0.1:3000", websocket: false },
          { path: "/api", backend: "127.0.0.1:8080", websocket: false },
        ],
      },
    },
    {
      id: "spa",
      name: "Single Page Application",
      description: "React/Vue/Angular SPA with API backend",
      icon: Code,
      category: "Web",
      config: {
        listen_port: 80,
        locations: [
          { path: "/", backend: "127.0.0.1:3000", websocket: false },
          { path: "/api", backend: "127.0.0.1:8080", websocket: false },
        ],
      },
    },
    {
      id: "websocket",
      name: "WebSocket Application",
      description: "Real-time application with WebSocket support",
      icon: Zap,
      category: "Real-time",
      config: {
        listen_port: 80,
        locations: [
          { path: "/", backend: "127.0.0.1:3000", websocket: false },
          { path: "/ws", backend: "127.0.0.1:3001", websocket: true },
        ],
      },
    },
    {
      id: "api-gateway",
      name: "API Gateway",
      description: "Microservices API gateway with multiple backends",
      icon: Database,
      category: "API",
      config: {
        listen_port: 80,
        locations: [
          { path: "/auth", backend: "127.0.0.1:8001", websocket: false },
          { path: "/users", backend: "127.0.0.1:8002", websocket: false },
          { path: "/orders", backend: "127.0.0.1:8003", websocket: false },
        ],
      },
    },
    {
      id: "ssl-app",
      name: "SSL/HTTPS Application",
      description: "Secure application with SSL termination",
      icon: Shield,
      category: "Security",
      config: {
        listen_port: 443,
        ssl_cert: "/etc/ssl/certs/app.crt",
        ssl_key: "/etc/ssl/private/app.key",
        locations: [{ path: "/", backend: "127.0.0.1:3000", websocket: false }],
      },
    },
    {
      id: "mobile-api",
      name: "Mobile API Backend",
      description: "API backend optimized for mobile applications",
      icon: Smartphone,
      category: "Mobile",
      config: {
        listen_port: 80,
        locations: [
          { path: "/api/v1", backend: "127.0.0.1:8080", websocket: false },
          { path: "/uploads", backend: "127.0.0.1:8081", websocket: false },
        ],
      },
    },
  ]

  const getIconComponent = (IconComponent: any) => {
    return <IconComponent className="h-6 w-6" />
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Web":
        return "bg-blue-100 text-blue-800"
      case "Real-time":
        return "bg-green-100 text-green-800"
      case "API":
        return "bg-purple-100 text-purple-800"
      case "Security":
        return "bg-red-100 text-red-800"
      case "Mobile":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const categories = [...new Set(templates.map((t) => t.category))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuration Templates</h2>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      <div className="text-gray-600">
        Choose from pre-configured templates to quickly set up common reverse proxy scenarios.
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Configuration Templates</h2>
          <p className="text-gray-600">Choose from pre-built templates to quickly set up common configurations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates2.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIconComponent(template.icon)}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={`text-xs ${getCategoryColor(template.category)}`}>{template.category}</Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Includes:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Port {template.config.listen_port}</li>
                      <li>
                        • {template.config.locations.length} location{template.config.locations.length !== 1 ? "s" : ""}
                      </li>
                      {template.config.locations.some((loc: any) => loc.websocket) && <li>• WebSocket support</li>}
                      {template.config.ssl_cert && <li>• SSL/HTTPS enabled</li>}
                    </ul>
                  </div>
                  <Button className="w-full" onClick={() => onTemplateSelect(template)}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Need a custom template?</h3>
                <p className="text-blue-700 text-sm">
                  Contact our support team to create custom templates for your specific use cases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && <div className="text-center py-8">Loading templates...</div>}
    </div>
  )
}
