#!/bin/bash

echo "🔧 Setting up VPS Manager Frontend Systemd Service..."

# Copy service file
echo "Copying systemd service file..."
sudo cp vps-manager-frontend.service /etc/systemd/system/

# Reload systemd
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable service
echo "Enabling service..."
sudo systemctl enable vps-manager-frontend.service

# Start service
echo "Starting service..."
sudo systemctl start vps-manager-frontend.service

# Check status
echo "Checking service status..."
sudo systemctl status vps-manager-frontend.service

echo ""
echo "✅ VPS Manager Frontend systemd service setup complete!"
echo ""
echo "Systemd Commands:"
echo "  Start: sudo systemctl start vps-manager-frontend"
echo "  Stop: sudo systemctl stop vps-manager-frontend"
echo "  Restart: sudo systemctl restart vps-manager-frontend"
echo "  Status: sudo systemctl status vps-manager-frontend"
echo "  Enable: sudo systemctl enable vps-manager-frontend"
echo "  Disable: sudo systemctl disable vps-manager-frontend"
echo ""
echo "Logs:"
echo "  Journal: sudo journalctl -u vps-manager-frontend -f" 