"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Download, Upload, Trash2, RefreshCw, Archive, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/backup/list")
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error)
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
      const response = await fetch("/api/backup/create", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Backup created successfully",
        })
        fetchBackups()
      } else {
        throw new Error("Failed to create backup")
      }
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
      const response = await fetch(`/api/backup/download/${filename}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/backup/restore/${filename}`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Backup restored successfully",
        })
      } else {
        throw new Error("Failed to restore backup")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      })
    }
    setRestoring(null)
  }

  const deleteBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/backup/delete/${filename}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Backup deleted successfully",
        })
        fetchBackups()
      } else {
        throw new Error("Failed to delete backup")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      })
    }
    setDeleting(null)
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
        description: "Please select a backup file to restore",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Restore Started",
      description: "Restoring configuration from backup...",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
        <div className="flex gap-2">
          <Button onClick={createBackup} disabled={creating}>
            <Archive className={`h-4 w-4 mr-2 ${creating ? "animate-spin" : ""}`} />
            {creating ? "Creating..." : "Create Backup"}
          </Button>
          <Button onClick={fetchBackups} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {backups.length > 0 ? new Date(backups[0].created_at).toLocaleDateString() : "No backups"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Backup */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Upload Backup</CardTitle>
          <CardDescription>Upload a previously downloaded backup file to restore configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="file" accept=".json,.zip" className="flex-1" />
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Restore
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Restore from Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">Select Backup File</Label>
            <Input id="backup-file" type="file" accept=".json" onChange={handleFileSelect} className="cursor-pointer" />
          </div>
          {selectedFile && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{selectedFile.name}</span>
                <Badge variant="outline">{formatFileSize(selectedFile.size)}</Badge>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={restoreBackupFromFile} disabled={!selectedFile}>
              <Upload className="h-4 w-4 mr-2" />
              Restore Configuration
            </Button>
            {selectedFile && (
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Clear
              </Button>
            )}
          </div>
          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            <strong>Warning:</strong> Restoring a backup will overwrite all current configurations. This action cannot
            be undone.
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>Manage your configuration backups</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading backups...</div>
          ) : backups.length > 0 ? (
            <div className="space-y-4">
              {backups.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Archive className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{backup.filename}</h4>
                      <p className="text-sm text-gray-600">Created {new Date(backup.created_at).toLocaleString()}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{backup.config_count} configs</Badge>
                        <Badge variant="outline">{formatFileSize(backup.size)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadBackup(backup.filename)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={() => setRestoring(backup.filename)}>
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleting(backup.filename)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No backups found</h3>
              <p className="text-gray-600 mb-4">Create your first backup to protect your configurations</p>
              <Button onClick={createBackup}>
                <Archive className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoring} onOpenChange={(open) => !open && setRestoring(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this backup? This will replace all current configurations and cannot be
              undone. Make sure to create a backup of your current state first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoring && restoreBackup(restoring)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Restore Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteBackup(deleting)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
