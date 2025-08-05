"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, FileText, AlertTriangle, Server, Code, Activity } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface LogSource {
  id: string
  name: string
  description: string
  icon: any
}

export function LogViewer() {
  const [logs, setLogs] = useState<string[]>([])
  const [logSource, setLogSource] = useState("nginx")
  const [logType, setLogType] = useState("error")
  const [lines, setLines] = useState(100)
  const [loading, setLoading] = useState(false)

  const logSources: LogSource[] = [
    {
      id: "nginx",
      name: "Nginx Logs",
      description: "Web server access and error logs",
      icon: Server,
    },
    {
      id: "application",
      name: "Application Logs",
      description: "VPS Manager application logs",
      icon: Code,
    },
    {
      id: "system",
      name: "System Logs",
      description: "System journal logs",
      icon: Activity,
    },
  ]

  useEffect(() => {
    fetchLogs()
  }, [logSource, logType, lines])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let data
      if (logSource === "nginx") {
        data = await apiClient.getNginxLogs(logType, lines) as { logs: string[] }
      } else if (logSource === "application") {
        data = await apiClient.getApplicationLogs(lines) as { logs: string[] }
      } else if (logSource === "system") {
        data = await apiClient.getSystemLogs(lines) as { logs: string[] }
      }
      setLogs(data?.logs || [])
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadLogs = () => {
    const logContent = logs.join("\n")
    const blob = new Blob([logContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${logSource}-${logType}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLogLevel = (logLine: string) => {
    const lowerLine = logLine.toLowerCase()
    if (lowerLine.includes("[error]") || lowerLine.includes("error")) return "error"
    if (lowerLine.includes("[warn]") || lowerLine.includes("warning")) return "warning"
    if (lowerLine.includes("[info]") || lowerLine.includes("info")) return "info"
    if (lowerLine.includes("[debug]") || lowerLine.includes("debug")) return "debug"
    return "default"
  }

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "default"
      case "debug":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSourceIcon = (sourceId: string) => {
    const source = logSources.find(s => s.id === sourceId)
    return source ? source.icon : FileText
  }

  const getSourceName = (sourceId: string) => {
    const source = logSources.find(s => s.id === sourceId)
    return source ? source.name : "Unknown"
  }

  const currentSource = logSources.find(s => s.id === logSource)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log Viewer</h2>
        <div className="flex items-center gap-4">
          <Select value={logSource} onValueChange={setLogSource}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {logSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    <source.icon className="h-4 w-4" />
                    {source.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {logSource === "nginx" && (
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error Logs</SelectItem>
                <SelectItem value="access">Access Logs</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={lines.toString()} onValueChange={(value) => setLines(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 lines</SelectItem>
              <SelectItem value="100">100 lines</SelectItem>
              <SelectItem value="200">200 lines</SelectItem>
              <SelectItem value="500">500 lines</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={downloadLogs} variant="outline" disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {currentSource && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentSource.icon className="h-5 w-5" />
              {currentSource.name}
              {logSource === "nginx" && (
                <span className="text-sm font-normal text-gray-500">
                  ({logType === "error" ? "Error" : "Access"} logs)
                </span>
              )}
              <Badge variant="outline">{logs.length} lines</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">{currentSource.description}</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logs found</p>
                <p className="text-sm mt-2">Try refreshing or selecting a different log source</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => {
                  const level = getLogLevel(log)
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {level === "error" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getLogBadgeVariant(level)} className="text-xs">
                            {level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">Line {index + 1}</span>
                        </div>
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words">{log}</pre>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Log Sources Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {logSources.map((source) => (
          <Card
            key={source.id}
            className={`cursor-pointer transition-colors ${logSource === source.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
              }`}
            onClick={() => setLogSource(source.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <source.icon className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium">{source.name}</h3>
                  <p className="text-sm text-gray-500">{source.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
