#!/bin/bash

APP_NAME="vps-manager-frontend"
APP_DIR="/opt/vps-manager-frontend"

case "$1" in
    start)
        echo "🚀 Starting VPS Manager Frontend..."
        cd $APP_DIR
        pm2 start ecosystem.config.js --env production
        echo "✅ Frontend started successfully!"
        ;;
    stop)
        echo "🛑 Stopping VPS Manager Frontend..."
        pm2 stop $APP_NAME
        echo "✅ Frontend stopped successfully!"
        ;;
    restart)
        echo "🔄 Restarting VPS Manager Frontend..."
        pm2 restart $APP_NAME
        echo "✅ Frontend restarted successfully!"
        ;;
    reload)
        echo "🔄 Reloading VPS Manager Frontend..."
        pm2 reload $APP_NAME
        echo "✅ Frontend reloaded successfully!"
        ;;
    status)
        echo "📊 PM2 Status:"
        pm2 status
        ;;
    logs)
        echo "📋 Frontend Logs:"
        pm2 logs $APP_NAME --lines 50
        ;;
    monitor)
        echo "📊 PM2 Monitor:"
        pm2 monit
        ;;
    deploy)
        echo "🚀 Deploying Frontend..."
        cd $APP_DIR
        npm install --production
        npm run build
        pm2 restart $APP_NAME
        echo "✅ Frontend deployed successfully!"
        ;;
    update)
        echo "🔄 Updating Frontend..."
        cd $APP_DIR
        git pull origin main
        npm install --production
        npm run build
        pm2 restart $APP_NAME
        echo "✅ Frontend updated successfully!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reload|status|logs|monitor|deploy|update}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the frontend application"
        echo "  stop    - Stop the frontend application"
        echo "  restart - Restart the frontend application"
        echo "  reload  - Reload the frontend application (zero-downtime)"
        echo "  status  - Show PM2 status"
        echo "  logs    - Show application logs"
        echo "  monitor - Open PM2 monitor"
        echo "  deploy  - Deploy the application (build + restart)"
        echo "  update  - Update from git and deploy"
        exit 1
        ;;
esac 