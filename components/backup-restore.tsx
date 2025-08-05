"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Upload, Trash2, RefreshCw, Archive, FileText, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface BackupFile {
  filename: string
  created_at: string
  size: number
  config_count: number
}

export function BackupRestore() {
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [backupOptions, setBackupOptions] = useState({
    include_configs: true,
    include_logs: false,
    include_ssl: true,
    description: "",
  })
  const [restoreOptions, setRestoreOptions] = useState({
    overwrite_existing: false,
  })

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getBackups() as { backups: BackupFile[] }
      setBackups(data.backups || [])
    } catch (error) {
      console.error("Failed to fetch backups:", error)
      toast({
        title: "Error",
        description: "Failed to fetch backups",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const createBackup = async () => {
    setCreating(true)
    try {
      await apiClient.createBackup()
      toast({
        title: "Success",
        description: "Backup created successfully",
      })
      setShowCreateDialog(false)
      setBackupOptions({
        include_configs: true,
        include_logs: false,
        include_ssl: true,
        description: "",
      })
      fetchBackups()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (filename: string) => {
    try {
      const blob = await apiClient.downloadBackup(filename)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: "Backup downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (filename: string) => {
    setRestoring(filename)
    try {
      await apiClient.restoreBackup(filename)
      toast({
        title: "Success",
        description: "Backup restored successfully",
      })
      setShowRestoreDialog(false)
      setRestoreOptions({ overwrite_existing: false })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      })
    } finally {
      setRestoring(null)
    }
  }

  const deleteBackup = async (filename: string) => {
    setDeleting(filename)
    try {
      await apiClient.deleteBackup(filename)
      toast({
        title: "Success",
        description: "Backup deleted successfully",
      })
      fetchBackups()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const restoreBackupFromFile = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a backup file",
        variant: "destructive",
      })
      return
    }

    // For now, we'll just show a message since file upload isn't implemented in the API
    toast({
      title: "Info",
      description: "File upload restore is not yet implemented. Please use the download/restore method.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Backup & Restore</h2>
          <Button disabled>
            <Archive className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading backups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Backup & Restore</h2>
          <p className="text-gray-600 mt-1">
            Create, download, and restore system backups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} disabled={creating}>
            <Archive className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "Create Backup"}
          </Button>
          <Button onClick={fetchBackups} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Backup List */}
      <div className="grid gap-4">
        {backups.map((backup) => (
          <Card key={backup.filename}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Archive className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{backup.filename}</CardTitle>
                    <CardDescription>
                      Created: {formatDate(backup.created_at)} • Size: {formatFileSize(backup.size)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{backup.config_count} configs</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadBackup(backup.filename)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowRestoreDialog(true)
                      setRestoreOptions({ overwrite_existing: false })
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleting === backup.filename}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting === backup.filename ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{backup.filename}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBackup(backup.filename)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {backups.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Found</h3>
              <p className="text-gray-500 mb-4">
                No backups have been created yet. Create your first backup to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Archive className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Backup Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new backup of your VPS Manager configuration and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Backup Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-configs"
                    checked={backupOptions.include_configs}
                    onCheckedChange={(checked) =>
                      setBackupOptions({ ...backupOptions, include_configs: checked })
                    }
                  />
                  <Label htmlFor="include-configs">Include Configurations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-logs"
                    checked={backupOptions.include_logs}
                    onCheckedChange={(checked) =>
                      setBackupOptions({ ...backupOptions, include_logs: checked })
                    }
                  />
                  <Label htmlFor="include-logs">Include Logs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-ssl"
                    checked={backupOptions.include_ssl}
                    onCheckedChange={(checked) =>
                      setBackupOptions({ ...backupOptions, include_ssl: checked })
                    }
                  />
                  <Label htmlFor="include-ssl">Include SSL Certificates</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this backup..."
                value={backupOptions.description}
                onChange={(e) =>
                  setBackupOptions({ ...backupOptions, description: e.target.value })
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={createBackup} disabled={creating}>
              {creating ? "Creating..." : "Create Backup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Backup Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Restore your system from a backup file. This will overwrite current configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                Warning: This action will overwrite current configurations and may restart services.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="overwrite-existing"
                checked={restoreOptions.overwrite_existing}
                onCheckedChange={(checked) =>
                  setRestoreOptions({ ...restoreOptions, overwrite_existing: checked })
                }
              />
              <Label htmlFor="overwrite-existing">Overwrite existing configurations</Label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreBackup("latest")}
              disabled={restoring !== null}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {restoring ? "Restoring..." : "Restore Backup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
