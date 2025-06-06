module.exports = {
    apps: [
        {
            name: 'vps-manager-frontend',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000, // Specify the port you want to use
                NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8000', // Update with your backend URL
            },
            instances: 1, // Use 'max' to utilize all CPU cores
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            time: true, // Enable timestamp in logs
        },
    ],
};