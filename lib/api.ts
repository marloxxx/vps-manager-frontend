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

  async getConfigForForm(id: string) {
    return this.request(`/api/configs/${id}/form`)
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

  async validateConfig(config: any) {
    return this.request("/api/configs/validate", {
      method: "POST",
      body: JSON.stringify(config),
    })
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

  // SSL Manager methods
  async getSSLCertificates() {
    return this.request("/api/ssl/certificates")
  }

  async getSSLDomains() {
    return this.request("/api/ssl/domains")
  }

  async getSSLCertificateContent(domain: string) {
    return this.request(`/api/ssl/certificate/${domain}/content`)
  }

  async uploadSSLCertificate(domain: string, certContent: string, keyContent: string) {
    return this.request("/api/ssl/upload", {
      method: "POST",
      body: JSON.stringify({
        domain,
        cert_content: certContent,
        key_content: keyContent,
      }),
    })
  }

  async requestLetsEncryptCertificate(domain: string) {
    return this.request("/api/ssl/request-letsencrypt", {
      method: "POST",
      body: JSON.stringify({ domain }),
    })
  }

  async renewSSLCertificate(domain: string) {
    return this.request(`/api/ssl/renew/${domain}`, { method: "POST" })
  }

  // Load Balancer methods
  async getLoadBalancerPools() {
    return this.request("/api/load-balancer/pools")
  }

  async createLoadBalancerPool(pool: any) {
    return this.request("/api/load-balancer/pools", {
      method: "POST",
      body: JSON.stringify(pool),
    })
  }

  // Config Templates methods
  async getConfigTemplates() {
    return this.request("/api/templates")
  }

  // Log Viewer methods
  async getNginxLogs(logType = "error", lines = 100) {
    return this.request(`/api/logs/nginx?log_type=${logType}&lines=${lines}`)
  }

  async getApplicationLogs(lines = 100) {
    return this.request(`/api/logs/application?lines=${lines}`)
  }

  async getSystemLogs(lines = 100) {
    return this.request(`/api/logs/system?lines=${lines}`)
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

// Real-time Monitoring APIs
export const getCurrentMetrics = async (): Promise<any> => {
  const response = await apiClient.get('/api/monitoring/metrics');
  return response.data;
};

export const getMetricsHistory = async (hours: number = 24): Promise<any> => {
  const response = await apiClient.get(`/api/monitoring/metrics/history?hours=${hours}`);
  return response.data;
};

export const createAlertRule = async (rule: any): Promise<any> => {
  const response = await apiClient.post('/api/monitoring/alerts/rules', rule);
  return response.data;
};

export const getAlertRules = async (): Promise<any> => {
  const response = await apiClient.get('/api/monitoring/alerts/rules');
  return response.data;
};

export const updateAlertRule = async (ruleId: string, rule: any): Promise<any> => {
  const response = await apiClient.put(`/api/monitoring/alerts/rules/${ruleId}`, rule);
  return response.data;
};

export const deleteAlertRule = async (ruleId: string): Promise<any> => {
  const response = await apiClient.delete(`/api/monitoring/alerts/rules/${ruleId}`);
  return response.data;
};

export const getAlerts = async (status?: string): Promise<any> => {
  const params = status ? `?status=${status}` : '';
  const response = await apiClient.get(`/api/monitoring/alerts${params}`);
  return response.data;
};

export const resolveAlert = async (alertId: string): Promise<any> => {
  const response = await apiClient.post(`/api/monitoring/alerts/${alertId}/resolve`);
  return response.data;
};

// Advanced Logging APIs
export const getStructuredLogs = async (filter: any): Promise<any> => {
  const response = await apiClient.get('/api/logs/structured', { params: filter });
  return response.data;
};

export const getAuditLogs = async (params: any): Promise<any> => {
  const response = await apiClient.get('/api/logs/audit', { params });
  return response.data;
};

export const getPerformanceLogs = async (params: any): Promise<any> => {
  const response = await apiClient.get('/api/logs/performance', { params });
  return response.data;
};

export const getSecurityLogs = async (params: any): Promise<any> => {
  const response = await apiClient.get('/api/logs/security', { params });
  return response.data;
};

export const getLogRetentionPolicy = async (): Promise<any> => {
  const response = await apiClient.get('/api/logs/retention-policy');
  return response.data;
};

export const updateLogRetentionPolicy = async (policy: any): Promise<any> => {
  const response = await apiClient.put('/api/logs/retention-policy', policy);
  return response.data;
};

export const cleanupOldLogs = async (): Promise<any> => {
  const response = await apiClient.post('/api/logs/cleanup');
  return response.data;
};

// Scalability APIs
export const getClusterNodes = async (): Promise<any> => {
  const response = await apiClient.get('/api/cluster/nodes');
  return response.data;
};

export const registerClusterNode = async (nodeData: any): Promise<any> => {
  const response = await apiClient.post('/api/cluster/nodes', nodeData);
  return response.data;
};

export const getClusterLoad = async (): Promise<any> => {
  const response = await apiClient.get('/api/cluster/load');
  return response.data;
};

export const distributeTask = async (taskData: any): Promise<any> => {
  const response = await apiClient.post('/api/cluster/tasks/distribute', taskData);
  return response.data;
};

export const getCacheStats = async (): Promise<any> => {
  const response = await apiClient.get('/api/performance/cache/stats');
  return response.data;
};

export const clearCache = async (): Promise<any> => {
  const response = await apiClient.post('/api/performance/cache/clear');
  return response.data;
};

export const getConnectionPoolStats = async (): Promise<any> => {
  const response = await apiClient.get('/api/performance/connections');
  return response.data;
};

export const checkBackendHealth = async (backendUrl: string): Promise<any> => {
  const response = await apiClient.get(`/api/health/backend/${encodeURIComponent(backendUrl)}`);
  return response.data;
};

export const getBackendHealthStatus = async (): Promise<any> => {
  const response = await apiClient.get('/api/health/backends');
  return response.data;
};

export const addBackgroundTask = async (taskData: any): Promise<any> => {
  const response = await apiClient.post('/api/tasks/queue', taskData);
  return response.data;
};

export const getTaskQueueStatus = async (): Promise<any> => {
  const response = await apiClient.get('/api/tasks/queue/status');
  return response.data;
};

// WebSocket connection for real-time monitoring
export const createMonitoringWebSocket = (): WebSocket => {
  const token = localStorage.getItem('token');
  const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws/monitoring?token=${token}`;
  return new WebSocket(wsUrl);
};
