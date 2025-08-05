module.exports = {
    apps: [
        {
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
                NEXT_PUBLIC_API_URL: 'http://localhost:8000',
                NEXT_PUBLIC_APP_NAME: 'VPS Manager',
                NEXT_PUBLIC_APP_VERSION: '2.0.0'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                NEXT_PUBLIC_API_URL: 'http://localhost:8000',
                NEXT_PUBLIC_APP_NAME: 'VPS Manager',
                NEXT_PUBLIC_APP_VERSION: '2.0.0'
            },
            error_file: '/opt/vps-manager-frontend/logs/err.log',
            out_file: '/opt/vps-manager-frontend/logs/out.log',
            log_file: '/opt/vps-manager-frontend/logs/combined.log',
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            pid_file: '/opt/vps-manager-frontend/pm2.pid'
        }
    ]
}; 