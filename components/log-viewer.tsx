"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, FileText, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function LogViewer() {
  const [logs, setLogs] = useState<string[]>([])
  const [logType, setLogType] = useState("error")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [logType])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/system/nginx/logs?log_type=${logType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
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
    a.download = `nginx-${logType}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLogLevel = (logLine: string) => {
    if (logLine.includes("[error]")) return "error"
    if (logLine.includes("[warn]")) return "warning"
    if (logLine.includes("[info]")) return "info"
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
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log Viewer</h2>
        <div className="flex items-center gap-4">
          <Select value={logType} onValueChange={setLogType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Error Logs</SelectItem>
              <SelectItem value="access">Access Logs</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nginx {logType === "error" ? "Error" : "Access"} Logs
            <Badge variant="outline">{logs.length} lines</Badge>
          </CardTitle>
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
    </div>
  )
}
