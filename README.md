# VPS Manager Frontend

**Surveyor Indonesia - VPS Manager v2.0.0**

A modern, responsive web interface for comprehensive VPS management with advanced monitoring, logging, and scalability features.

## 🚀 **Features Overview**

### **Core Features**
- **Configuration Management** - Create, edit, and manage Nginx configurations
- **SSL Certificate Management** - Let's Encrypt integration and custom certificate uploads
- **Load Balancing** - Advanced load balancer with health checks
- **Backup & Restore** - Automated backup system with retention policies
- **System Monitoring** - Real-time system metrics and health monitoring

### **Advanced Features**
- **Real-time Monitoring Dashboard** - WebSocket-based live metrics and alerts
- **Advanced Logging System** - Structured logging with audit trails and compliance
- **Scalability Monitoring** - Redis caching, connection pooling, and horizontal scaling
- **Performance Analytics** - Detailed performance metrics and optimization tools

## 📋 **Table of Contents**

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Components](#components)
4. [Real-time Monitoring](#real-time-monitoring)
5. [Advanced Logging](#advanced-logging)
6. [Scalability Features](#scalability-features)
7. [User Interface](#user-interface)
8. [Deployment](#deployment)

## 🛠️ **Installation**

### **Prerequisites**
```bash
# Node.js 18+ and npm/pnpm
node --version
npm --version

# Install pnpm (recommended)
npm install -g pnpm
```

### **Frontend Setup**
```bash
# Clone repository
git clone <repository-url>
cd vps-manager-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=VPS Manager
NEXT_PUBLIC_VERSION=2.0.0
```

## ⚙️ **Configuration**

### **API Configuration**
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### **Authentication**
```typescript
// components/auth-provider.tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // JWT token management
  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.login(credentials)
    localStorage.setItem('token', response.access_token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
}
```

## 🧩 **Components**

### **Core Components**

#### **Configuration Management**
- `ConfigList` - Display and manage Nginx configurations
- `CreateConfigDialog` - Create new configurations
- `EditConfigDialog` - Edit existing configurations
- `ConfigTemplates` - Pre-defined configuration templates

#### **System Management**
- `SystemStatus` - Real-time system health monitoring
- `BackupRestore` - Backup and restore functionality
- `SSLManager` - SSL certificate management
- `LoadBalancer` - Load balancer configuration

#### **Logging & Monitoring**
- `LogViewer` - Basic log viewing
- `RealTimeMonitoring` - Advanced real-time monitoring
- `AdvancedLogging` - Structured logging with filtering
- `ScalabilityMonitoring` - Performance and scalability metrics

### **UI Components**
- Modern, responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-optimized interface
- Real-time updates with WebSocket connections

## 📊 **Real-time Monitoring**

### **Features**
- **Live Metrics Dashboard** - CPU, memory, disk, network usage
- **WebSocket Connection** - Real-time data streaming
- **Alert Management** - Threshold-based alerts and notifications
- **Historical Data** - Metrics history with customizable time ranges
- **Performance Trends** - Visual trend analysis

### **Metrics Displayed**
```typescript
interface SystemMetrics {
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  nginx_connections: number
  nginx_requests_per_second: number
}
```

### **Alert System**
```typescript
interface Alert {
  id: string
  rule_id: string
  timestamp: string
  metric: string
  value: number
  threshold: number
  status: string
  message: string
}
```

### **Usage Example**
```tsx
import RealTimeMonitoring from '@/components/real-time-monitoring'

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <RealTimeMonitoring />
    </div>
  )
}
```

## 📝 **Advanced Logging**

### **Features**
- **Structured Logs** - JSON-formatted application logs
- **Audit Logs** - User actions and compliance tracking
- **Performance Logs** - Request timing and performance metrics
- **Security Logs** - Security events and threat detection
- **Log Filtering** - Advanced filtering by level, source, time range
- **Log Retention** - Configurable retention policies

### **Log Types**
```typescript
interface LogEntry {
  timestamp: string
  level: string
  message: string
  source: string
  user_id?: string
  action?: string
  resource?: string
  ip_address?: string
  user_agent?: string
  duration_ms?: number
  status_code?: number
  request_id?: string
}
```

### **Filtering Options**
```typescript
interface LogFilter {
  level?: string
  source?: string
  start_time?: string
  end_time?: string
  user_id?: string
  action?: string
  limit: number
}
```

### **Usage Example**
```tsx
import AdvancedLogging from '@/components/advanced-logging'

export default function LoggingPage() {
  return (
    <div className="container mx-auto p-6">
      <AdvancedLogging />
    </div>
  )
}
```

## 🔧 **Scalability Features**

### **Cache Performance**
- **Redis Integration** - Distributed caching support
- **Memory Cache** - In-memory cache fallback
- **Cache Statistics** - Hit rates and performance metrics
- **Cache Management** - Clear cache and monitor usage

### **Connection Pooling**
- **Database Connections** - Connection pool monitoring
- **Utilization Metrics** - Connection usage statistics
- **Health Checks** - Connection pool health monitoring

### **Cluster Management**
- **Node Registration** - Register cluster nodes
- **Load Distribution** - Monitor load across nodes
- **Health Monitoring** - Backend service health checks
- **Task Queue** - Background task processing

### **Performance Monitoring**
```typescript
interface CacheStats {
  redis: {
    connected: boolean
    memory_usage?: any
    keys?: number
  }
  memory_cache: {
    config_cache_size: number
    metrics_cache_size: number
  }
}

interface ConnectionPoolStats {
  available_connections: number
  in_use_connections: number
  max_connections: number
}
```

### **Usage Example**
```tsx
import ScalabilityMonitoring from '@/components/scalability-monitoring'

export default function ScalabilityPage() {
  return (
    <div className="container mx-auto p-6">
      <ScalabilityMonitoring />
    </div>
  )
}
```

## 🎨 **User Interface**

### **Design System**
- **Modern UI** - Clean, professional interface
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 compliant
- **Theme Support** - Dark/light mode
- **Component Library** - Reusable UI components

### **Navigation**
```tsx
// Main navigation tabs
<TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
  <TabsTrigger value="configs">Configurations</TabsTrigger>
  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
  <TabsTrigger value="logging">Logging</TabsTrigger>
  <TabsTrigger value="scalability">Scalability</TabsTrigger>
  <TabsTrigger value="ssl">SSL</TabsTrigger>
  <TabsTrigger value="backup">Backup</TabsTrigger>
  <TabsTrigger value="loadbalancer">Load Balancer</TabsTrigger>
  <TabsTrigger value="templates">Templates</TabsTrigger>
  <TabsTrigger value="logs">Logs</TabsTrigger>
  <TabsTrigger value="system">System</TabsTrigger>
</TabsList>
```

### **Component Structure**
```
components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── config-list.tsx        # Configuration management
├── create-config-dialog.tsx
├── edit-config-dialog.tsx
├── system-status.tsx      # System monitoring
├── backup-restore.tsx     # Backup management
├── ssl-manager.tsx        # SSL certificate management
├── load-balancer.tsx      # Load balancer
├── config-templates.tsx   # Configuration templates
├── log-viewer.tsx         # Basic log viewing
├── real-time-monitoring.tsx # Advanced monitoring
├── advanced-logging.tsx   # Structured logging
└── scalability-monitoring.tsx # Performance monitoring
```

## 🚀 **Deployment**

### **Development**
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### **Production Build**
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Export static files
pnpm export
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### **Environment Configuration**
```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.vps-manager.com
NEXT_PUBLIC_APP_NAME=VPS Manager
NEXT_PUBLIC_VERSION=2.0.0
NODE_ENV=production
```

## 📚 **API Integration**

### **Authentication**
```typescript
// JWT token management
const token = localStorage.getItem('token')
if (token) {
  apiClient.setAuthToken(token)
}
```

### **WebSocket Connection**
```typescript
// Real-time monitoring
const ws = new WebSocket(`${API_URL}/ws/monitoring?token=${token}`)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle real-time updates
}
```

### **Error Handling**
```typescript
// Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      logout()
    }
    return Promise.reject(error)
  }
)
```

## 🔒 **Security**

### **Authentication**
- **JWT Tokens** - Secure token-based authentication
- **Token Refresh** - Automatic token renewal
- **Session Management** - Secure session handling
- **Logout** - Proper token cleanup

### **Data Protection**
- **HTTPS Only** - Secure communication
- **Input Validation** - Client-side validation
- **XSS Protection** - Content Security Policy
- **CSRF Protection** - Cross-site request forgery protection

### **Privacy**
- **Data Minimization** - Only collect necessary data
- **User Consent** - Clear privacy policies
- **Data Retention** - Configurable retention policies
- **Audit Logging** - Track user actions

## 🧪 **Testing**

### **Unit Tests**
```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test components/real-time-monitoring.test.tsx
```

### **Integration Tests**
```bash
# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### **Test Structure**
```
__tests__/
├── components/
│   ├── real-time-monitoring.test.tsx
│   ├── advanced-logging.test.tsx
│   └── scalability-monitoring.test.tsx
├── lib/
│   └── api.test.ts
└── utils/
    └── helpers.test.ts
```

## 📖 **Documentation**

### **Component Documentation**
- **Storybook** - Interactive component documentation
- **TypeScript** - Type definitions and interfaces
- **JSDoc** - Inline code documentation
- **README Files** - Component-specific documentation

### **API Documentation**
- **OpenAPI/Swagger** - Interactive API documentation
- **Type Definitions** - TypeScript interfaces
- **Example Requests** - Usage examples
- **Error Codes** - Error handling documentation

## 🤝 **Contributing**

### **Development Setup**
```bash
# Fork and clone repository
git clone <your-fork-url>
cd vps-manager-frontend

# Install dependencies
pnpm install

# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
pnpm test
pnpm lint
pnpm type-check

# Commit and push
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### **Code Style**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Conventional Commits** - Commit message format

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [Wiki](https://github.com/surveyor-indonesia/vps-manager/wiki)
- **Issues**: [GitHub Issues](https://github.com/surveyor-indonesia/vps-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/surveyor-indonesia/vps-manager/discussions)

---

**Surveyor Indonesia - VPS Manager v2.0.0**  
*Modern Web Interface for Comprehensive VPS Management*
