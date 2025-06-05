# VPS Manager Frontend

A modern, responsive web interface for the VPS Manager system built with Next.js 14, TypeScript, and Tailwind CSS. This frontend provides an intuitive dashboard for managing reverse proxy configurations, monitoring system health, and administering Nginx servers.

## 🚀 Features

### Core Functionality
- **🔐 Authentication**: JWT-based secure login with role-based access control
- **📊 Dashboard**: Real-time system monitoring and configuration overview
- **⚙️ Configuration Management**: Create, edit, delete, and manage reverse proxy configurations
- **📋 Templates**: Pre-built configuration templates for common use cases
- **⚖️ Load Balancer**: Manage upstream servers and load balancing strategies
- **🔒 SSL Management**: Certificate management and SSL configuration
- **📈 System Monitoring**: Real-time system stats, resource usage, and health checks
- **📝 Log Viewer**: Browse and download Nginx access and error logs
- **💾 Backup & Restore**: Configuration backup and restore functionality

### User Experience
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🎨 Modern UI**: Clean, intuitive interface built with shadcn/ui components
- **🌙 Theme Support**: Light and dark mode support
- **⚡ Real-time Updates**: Live system statistics and status updates
- **🔔 Notifications**: Toast notifications for user actions and system events

## 📋 Prerequisites

Before running the frontend, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **VPS Manager Backend** running and accessible
- Modern web browser with JavaScript enabled

## 🛠️ Installation

### 1. Clone and Setup

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd vps-manager-frontend

# Install dependencies
npm install
# or
yarn install
\`\`\`

### 2. Environment Configuration

Create environment configuration file:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your backend configuration:

\`\`\`env
# Backend API URL - Update this to point to your backend server
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application Settings (Optional)
NEXT_PUBLIC_APP_NAME="VPS Manager"
NEXT_PUBLIC_COMPANY_NAME="Surveyor Indonesia"
\`\`\`

### 3. Development Server

\`\`\`bash
# Start development server
npm run dev
# or
yarn dev
\`\`\`

The application will be available at `http://localhost:3000`

### 4. Production Build

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🔑 Default Login Credentials

The system comes with pre-configured users:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | Admin | Full system access |
| `user` | `user123` | User | Limited access |
| `operator` | `operator123` | User | Operations access |
| `manager` | `manager123` | Admin | Management access |

> ⚠️ **Security Note**: Change default passwords in production environments!

## 📖 Usage Guide

### Getting Started

1. **Login**: Use the credentials above to access the system
2. **Dashboard**: View system overview and statistics
3. **Create Configuration**: Click "New Configuration" to set up reverse proxy
4. **Monitor System**: Check system health and view logs
5. **Manage SSL**: Configure SSL certificates for secure connections

### Creating Reverse Proxy Configurations

1. Navigate to the **Configurations** tab
2. Click **"New Configuration"** button
3. Fill in the configuration details:
   - **Server Name**: Domain name (e.g., `example.com`)
   - **Listen Port**: Port number (80 for HTTP, 443 for HTTPS)
   - **Locations**: Define proxy paths and backend servers
   - **SSL Settings**: Configure SSL certificates if needed
4. **Save and Activate** the configuration

### Using Configuration Templates

1. Go to the **Templates** tab
2. Browse available templates:
   - **Web Application**: Standard web app with static files
   - **API Gateway**: Microservices API gateway
   - **WebSocket App**: Real-time applications
   - **Load Balanced App**: Multi-server applications
3. Select a template and customize as needed
4. Deploy the configuration

### Managing Load Balancers

1. Navigate to **Load Balancer** tab
2. Click **"Create Pool"** to set up upstream servers
3. Configure load balancing method:
   - **Round Robin**: Even distribution
   - **Least Connections**: Route to least busy server
   - **IP Hash**: Consistent routing based on client IP
4. Add backend servers with health checks
5. Apply to configurations

### SSL Certificate Management

1. Access **SSL Manager** tab
2. View existing certificates and expiration dates
3. Add custom certificates or use Let's Encrypt
4. Monitor certificate health and renewal status

### System Monitoring

1. **System Status**: View Nginx status, uptime, and resource usage
2. **Log Viewer**: Browse recent Nginx access and error logs
3. **Real-time Stats**: Monitor CPU, memory, and disk usage
4. **Health Checks**: Verify system components are running

### Backup and Restore

1. Go to **Backup** tab
2. **Create Backup**: Generate configuration snapshots
3. **Download Backups**: Save backups locally
4. **Restore**: Upload and restore previous configurations

## 🏗️ Project Structure

\`\`\`
vps-manager-frontend/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main dashboard page
│   ├── login/               # Authentication pages
│   └── globals.css          # Global styles and CSS variables
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card component
│   │   ├── dialog.tsx       # Modal dialogs
│   │   └── ...              # Other UI components
│   ├── auth-provider.tsx    # Authentication context
│   ├── navbar.tsx           # Navigation bar
│   ├── config-list.tsx      # Configuration management
│   ├── system-status.tsx    # System monitoring
│   ├── log-viewer.tsx       # Log viewing interface
│   └── ...                  # Feature-specific components
├── hooks/                   # Custom React hooks
│   ├── use-toast.ts         # Toast notification hook
│   └── use-mobile.tsx       # Mobile detection hook
├── lib/                     # Utility functions
│   └── utils.ts             # Common utilities
├── public/                  # Static assets
│   └── images/              # Images and icons
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `VPS Manager` | No |
| `NEXT_PUBLIC_COMPANY_NAME` | Company name | `Surveyor Indonesia` | No |

### API Integration

The frontend communicates with the VPS Manager Backend through RESTful APIs:

- **Authentication**: JWT token-based authentication
- **Real-time Updates**: Polling for system statistics
- **File Operations**: Configuration and log file management
- **System Control**: Nginx service management

### Styling and Theming

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **CSS Variables**: Theme customization support
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Set `NEXT_PUBLIC_API_URL` in Vercel dashboard
3. **Deploy**: Automatic deployment on git push
4. **Custom Domain**: Configure your domain in Vercel settings

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
\`\`\`

### Docker Deployment

\`\`\`bash
# Build Docker image
docker build -t vps-manager-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend:8000 \
  vps-manager-frontend
\`\`\`

### Static Export

\`\`\`bash
# Build and export static files
npm run build
npm run export

# Serve with any web server
npx serve out/
\`\`\`

### Traditional Web Server

\`\`\`bash
# Build the application
npm run build

# Copy build files to web server
cp -r .next/static/* /var/www/html/
cp -r public/* /var/www/html/
\`\`\`

## 🔍 API Endpoints

The frontend interacts with these backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Configuration Management
- `GET /api/configs` - List all configurations
- `POST /api/configs` - Create new configuration
- `GET /api/configs/{id}` - Get specific configuration
- `PUT /api/configs/{id}` - Update configuration
- `DELETE /api/configs/{id}` - Delete configuration
- `POST /api/configs/{id}/toggle` - Enable/disable configuration
- `POST /api/configs/{id}/test` - Test configuration

### System Management
- `GET /api/system/status` - System statistics
- `POST /api/system/nginx/restart` - Restart Nginx
- `POST /api/system/nginx/reload` - Reload Nginx config
- `GET /api/system/nginx/logs` - Get Nginx logs

### Backup Operations
- `GET /api/backup/list` - List backups
- `POST /api/backup/create` - Create backup
- `GET /api/backup/download/{filename}` - Download backup
- `POST /api/backup/restore/{filename}` - Restore backup

## 🛠️ Development

### Adding New Features

1. **Create Components**: Add new components in `components/`
2. **Add Routes**: Create new pages in `app/`
3. **Update Navigation**: Modify `navbar.tsx`
4. **API Integration**: Add API calls in component files
5. **Styling**: Use Tailwind classes and shadcn/ui components

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks
- **File Naming**: kebab-case for files, PascalCase for components

### Testing

\`\`\`bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
\`\`\`

## 🐛 Troubleshooting

### Common Issues

#### API Connection Failed
\`\`\`
Error: Failed to fetch configurations
\`\`\`
**Solutions:**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured in backend
- Check network connectivity

#### Authentication Issues
\`\`\`
Error: Invalid authentication credentials
\`\`\`
**Solutions:**
- Clear browser localStorage: `localStorage.clear()`
- Check if JWT token is expired
- Verify backend user database
- Try logging in again

#### Build Errors
\`\`\`
Error: Module not found
\`\`\`
**Solutions:**
- Delete `.next` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

#### Styling Issues
\`\`\`
Styles not loading correctly
\`\`\`
**Solutions:**
- Check Tailwind CSS configuration
- Verify CSS imports in `globals.css`
- Clear browser cache
- Check for CSS conflicts

### Debug Mode

Enable debug logging by setting environment variables:

\`\`\`bash
# Enable debug mode
DEBUG=1 npm run dev

# Verbose logging
NEXT_PUBLIC_DEBUG=true npm run dev
\`\`\`

### Browser Developer Tools

1. **Network Tab**: Monitor API requests and responses
2. **Console**: Check for JavaScript errors and warnings
3. **Application Tab**: Inspect localStorage and session data
4. **React DevTools**: Debug component state and props

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork Repository**: Create your own fork
2. **Create Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your feature or fix
4. **Test Thoroughly**: Ensure all functionality works
5. **Commit Changes**: Use conventional commit messages
6. **Submit PR**: Create a pull request with description

### Code Standards

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

### Commit Messages

\`\`\`bash
# Feature
git commit -m "feat: add SSL certificate management"

# Bug fix
git commit -m "fix: resolve authentication token expiry"

# Documentation
git commit -m "docs: update installation guide"

# Refactor
git commit -m "refactor: improve component structure"
\`\`\`

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and project wiki
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Email**: Contact support@surveyorindonesia.com
- **Community**: Join our Discord server for discussions

### Reporting Bugs

When reporting bugs, please include:

1. **Environment**: OS, browser, Node.js version
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: Visual evidence if applicable
6. **Console Logs**: Browser console errors

### Feature Requests

For feature requests, please provide:

1. **Use Case**: Why is this feature needed?
2. **Description**: Detailed description of the feature
3. **Mockups**: Visual mockups if applicable
4. **Priority**: How important is this feature?

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **shadcn**: For the beautiful UI component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For the comprehensive icon library
- **Surveyor Indonesia**: For project sponsorship and support

---

**Made with ❤️ by Surveyor Indonesia**

For more information, visit our [website](https://ptsi.co.id) 
