"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Plus, Calendar, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface SSLCertificate {
  domain: string
  issuer: string
  expires: string
  status: string
  auto_renew: boolean
  cert_path?: string
  key_path?: string
}

export function SSLManager() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([])
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [renewing, setRenewing] = useState<string | null>(null)
  const [newCert, setNewCert] = useState({
    domain: "",
    certPath: "",
    keyPath: "",
  })

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getSSLCertificates() as { certificates: SSLCertificate[] }
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error("Failed to fetch SSL certificates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch SSL certificates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="default">Valid</Badge>
      case "expiring":
        return <Badge variant="secondary">Expiring Soon</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expiring":
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRequestLetsEncrypt = async () => {
    if (!newCert.domain) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      })
      return
    }

    setRequesting(true)
    try {
      await apiClient.requestLetsEncryptCertificate(newCert.domain)
      toast({
        title: "Success",
        description: `Let's Encrypt certificate requested for ${newCert.domain}`,
      })
      setNewCert({ domain: "", certPath: "", keyPath: "" })
      fetchCertificates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request Let's Encrypt certificate",
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
    }
  }

  const renewCertificate = async (domain: string) => {
    setRenewing(domain)
    try {
      await apiClient.renewSSLCertificate(domain)
      toast({
        title: "Success",
        description: `Certificate renewed for ${domain}`,
      })
      fetchCertificates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew certificate",
        variant: "destructive",
      })
    } finally {
      setRenewing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">SSL Certificate Manager</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Request Let's Encrypt Certificate
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SSL Certificate Manager</h2>
        <Button onClick={handleRequestLetsEncrypt} disabled={requesting}>
          <Plus className="h-4 w-4 mr-2" />
          {requesting ? "Requesting..." : "Request Let's Encrypt Certificate"}
        </Button>
      </div>

      {/* Certificate List */}
      <div className="grid gap-6">
        {certificates.map((cert, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(cert.status)}
                  <div>
                    <CardTitle className="text-lg">{cert.domain}</CardTitle>
                    <p className="text-sm text-gray-500">{cert.issuer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(cert.status)}
                  {cert.status === "expiring" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => renewCertificate(cert.domain)}
                      disabled={renewing === cert.domain}
                    >
                      {renewing === cert.domain ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Renew
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Expires: {cert.expires || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Auto-renew: {cert.auto_renew ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {certificates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SSL Certificates</h3>
              <p className="text-gray-500 mb-4">
                No SSL certificates found. Request a Let's Encrypt certificate to get started.
              </p>
              <Button onClick={handleRequestLetsEncrypt} disabled={requesting}>
                <Plus className="h-4 w-4 mr-2" />
                Request Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Request New Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Request Let's Encrypt Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newCert.domain}
                onChange={(e) => setNewCert({ ...newCert, domain: e.target.value })}
              />
            </div>
            <Button onClick={handleRequestLetsEncrypt} disabled={requesting || !newCert.domain}>
              {requesting ? "Requesting..." : "Request Certificate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
