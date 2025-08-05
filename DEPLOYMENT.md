# VPS Manager Frontend Deployment Guide

## 🚀 **PM2 Deployment**

### **Prerequisites**
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

### **Quick Deployment**
```bash
# Make scripts executable
chmod +x deploy.sh pm2-manager.sh setup-systemd.sh

# Deploy frontend
./deploy.sh

# Setup systemd service (optional)
./setup-systemd.sh
```

### **Manual Deployment**
```bash
# Set variables
APP_NAME="vps-manager-frontend"
APP_DIR="/opt/vps-manager-frontend"
LOG_DIR="$APP_DIR/logs"

# Create directories
sudo mkdir -p $APP_DIR
sudo mkdir -p $LOG_DIR

# Copy files
sudo cp -r . $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# Install and build
cd $APP_DIR
npm install --production
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 📋 **PM2 Management**

### **Using PM2 Manager Script**
```bash
# Start application
./pm2-manager.sh start

# Stop application
./pm2-manager.sh stop

# Restart application
./pm2-manager.sh restart

# Reload application (zero-downtime)
./pm2-manager.sh reload

# Check status
./pm2-manager.sh status

# View logs
./pm2-manager.sh logs

# Open monitor
./pm2-manager.sh monitor

# Deploy updates
./pm2-manager.sh deploy

# Update from git
./pm2-manager.sh update
```

### **Direct PM2 Commands**
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Stop application
pm2 stop vps-manager-frontend

# Restart application
pm2 restart vps-manager-frontend

# Reload application
pm2 reload vps-manager-frontend

# View status
pm2 status

# View logs
pm2 logs vps-manager-frontend

# Monitor
pm2 monit

# Save configuration
pm2 save

# Setup startup
pm2 startup
```

## 🔧 **Systemd Service**

### **Setup Systemd Service**
```bash
# Setup systemd service
./setup-systemd.sh

# Or manually
sudo cp vps-manager-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vps-manager-frontend
sudo systemctl start vps-manager-frontend
```

### **Systemd Commands**
```bash
# Start service
sudo systemctl start vps-manager-frontend

# Stop service
sudo systemctl stop vps-manager-frontend

# Restart service
sudo systemctl restart vps-manager-frontend

# Check status
sudo systemctl status vps-manager-frontend

# View logs
sudo journalctl -u vps-manager-frontend -f

# Enable on boot
sudo systemctl enable vps-manager-frontend

# Disable on boot
sudo systemctl disable vps-manager-frontend
```

## 🌐 **Configuration**

### **Environment Variables**
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=VPS Manager
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### **PM2 Ecosystem Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vps-manager-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/opt/vps-manager-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://localhost:8000'
    }
  }]
};
```

## 📊 **Monitoring**

### **PM2 Monitoring**
```bash
# View real-time monitoring
pm2 monit

# View detailed status
pm2 show vps-manager-frontend

# View process list
pm2 list

# View logs with timestamps
pm2 logs vps-manager-frontend --timestamp
```

### **System Monitoring**
```bash
# Check memory usage
pm2 show vps-manager-frontend | grep memory

# Check CPU usage
pm2 show vps-manager-frontend | grep cpu

# Check uptime
pm2 show vps-manager-frontend | grep uptime
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check PM2 logs
pm2 logs vps-manager-frontend

# Check if port is in use
netstat -tulpn | grep :3000

# Check Node.js version
node --version

# Check npm version
npm --version
```

#### **Memory Issues**
```bash
# Check memory usage
pm2 show vps-manager-frontend

# Restart if memory is high
pm2 restart vps-manager-frontend

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
```

#### **Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run lint
```

### **Log Files**
```bash
# PM2 logs
/opt/vps-manager-frontend/logs/err.log
/opt/vps-manager-frontend/logs/out.log
/opt/vps-manager-frontend/logs/combined.log

# Systemd logs
sudo journalctl -u vps-manager-frontend -f
```

## 🔄 **Update Process**

### **Automatic Update**
```bash
# Update from git and deploy
./pm2-manager.sh update
```

### **Manual Update**
```bash
# Pull latest changes
cd /opt/vps-manager-frontend
git pull origin main

# Install dependencies
npm install --production

# Build application
npm run build

# Restart application
pm2 restart vps-manager-frontend
```

## 📈 **Performance Optimization**

### **PM2 Configuration**
```javascript
// Optimized ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vps-manager-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/opt/vps-manager-frontend',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### **Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

**VPS Manager Frontend v2.0.0**  
*Deployed with PM2 for Production* 