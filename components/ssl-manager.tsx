"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Plus, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function SSLManager() {
  const [certificates] = useState([
    {
      domain: "*.ptsi.co.id",
      issuer: "Let's Encrypt",
      expires: "2024-12-31",
      status: "valid",
      autoRenew: true,
    },
    {
      domain: "example.com",
      issuer: "Custom CA",
      expires: "2024-06-15",
      status: "expiring",
      autoRenew: false,
    },
  ])

  const [newCert, setNewCert] = useState({
    domain: "",
    certPath: "",
    keyPath: "",
  })

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

  const handleAddCertificate = () => {
    if (!newCert.domain || !newCert.certPath || !newCert.keyPath) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "SSL certificate added successfully",
    })

    setNewCert({ domain: "", certPath: "", keyPath: "" })
  }

  const renewCertificate = (domain: string) => {
    toast({
      title: "Certificate Renewal",
      description: `Renewing certificate for ${domain}...`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SSL Certificate Manager</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Let's Encrypt Certificate
        </Button>
      </div>

      {/* Certificate List */}
      <div className="grid gap-6">
        {certificates.map((cert, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(cert.status)}
                  {cert.domain}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(cert.status)}
                  {cert.autoRenew && <Badge variant="outline">Auto-Renew</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Issuer</Label>
                  <p className="font-medium">{cert.issuer}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Expires</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {cert.expires}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Auto Renewal</Label>
                  <p className="font-medium">{cert.autoRenew ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => renewCertificate(cert.domain)}
                    disabled={cert.status === "valid"}
                  >
                    Renew Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Custom Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom SSL Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={newCert.domain}
                onChange={(e) => setNewCert({ ...newCert, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certPath">Certificate Path</Label>
              <Input
                id="certPath"
                value={newCert.certPath}
                onChange={(e) => setNewCert({ ...newCert, certPath: e.target.value })}
                placeholder="/path/to/certificate.crt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyPath">Private Key Path</Label>
              <Input
                id="keyPath"
                value={newCert.keyPath}
                onChange={(e) => setNewCert({ ...newCert, keyPath: e.target.value })}
                placeholder="/path/to/private.key"
              />
            </div>
          </div>
          <Button onClick={handleAddCertificate}>
            <Shield className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
