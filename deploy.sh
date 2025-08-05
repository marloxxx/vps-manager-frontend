#!/bin/bash

echo "🚀 Deploying VPS Manager Frontend with PM2..."

# Set variables
APP_NAME="vps-manager-frontend"
APP_DIR="/opt/vps-manager-frontend"
LOG_DIR="$APP_DIR/logs"

# Create necessary directories
echo "Creating directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $LOG_DIR

# Copy application files
echo "Copying application files..."
sudo cp -r . $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# Navigate to app directory
cd $APP_DIR

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the application
echo "Building application..."
npm run build

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "Stopping existing PM2 process..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo "Setting up PM2 startup script..."
pm2 startup

echo ""
echo "✅ VPS Manager Frontend deployed successfully!"
echo "🌐 Frontend URL: http://localhost:3000"
echo ""
echo "PM2 Commands:"
echo "  View logs: pm2 logs $APP_NAME"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Stop: pm2 stop $APP_NAME"
echo "  Status: pm2 status"
echo ""
echo "Log files:"
echo "  Error: $LOG_DIR/err.log"
echo "  Output: $LOG_DIR/out.log"
echo "  Combined: $LOG_DIR/combined.log" 