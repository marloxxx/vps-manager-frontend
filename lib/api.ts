// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Remove trailing slash if present
const API_URL = API_BASE_URL.replace(/\/$/, "")

export { API_URL }

// API client utility
export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_URL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth methods
  async login(username: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async getCurrentUser() {
    return this.request("/api/auth/me")
  }

  async logout() {
    return this.request("/api/auth/logout", { method: "POST" })
  }

  // Config methods
  async getConfigs() {
    return this.request("/api/configs")
  }

  async getConfig(id: string) {
    return this.request(`/api/configs/${id}`)
  }

  async createConfig(config: any) {
    return this.request("/api/configs", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async updateConfig(id: string, config: any) {
    return this.request(`/api/configs/${id}`, {
      method: "PUT",
      body: JSON.stringify(config),
    })
  }

  async deleteConfig(id: string) {
    return this.request(`/api/configs/${id}`, { method: "DELETE" })
  }

  async toggleConfig(id: string) {
    return this.request(`/api/configs/${id}/toggle`, { method: "POST" })
  }

  async testConfig(id: string) {
    return this.request(`/api/configs/${id}/test`, { method: "POST" })
  }

  // System methods
  async getSystemStatus() {
    return this.request("/api/system/status")
  }

  async restartNginx() {
    return this.request("/api/system/nginx/restart", { method: "POST" })
  }

  async reloadNginx() {
    return this.request("/api/system/nginx/reload", { method: "POST" })
  }

  async testNginx() {
    return this.request("/api/system/nginx/test", { method: "POST" })
  }

  async getNginxLogs(logType = "error") {
    return this.request(`/api/system/nginx/logs?log_type=${logType}`)
  }

  // Backup methods
  async getBackups() {
    return this.request("/api/backup/list")
  }

  async createBackup() {
    return this.request("/api/backup/create", { method: "POST" })
  }

  async downloadBackup(filename: string) {
    const url = `${this.baseUrl}/api/backup/download/${filename}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    return response.blob()
  }

  async restoreBackup(filename: string) {
    return this.request(`/api/backup/restore/${filename}`, { method: "POST" })
  }

  async deleteBackup(filename: string) {
    return this.request(`/api/backup/delete/${filename}`, { method: "DELETE" })
  }

  // Update token
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
