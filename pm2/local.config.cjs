// config/pm2/local.config.js
module.exports = {
  apps: [
    {
      name: "auth-server",
      script: "/opt/cmdetect/apps/auth-server/dist/server.js",

      // Process Management
      instances: 1,
      exec_mode: "fork",

      // Restart Policy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",

      // Resources
      max_memory_restart: "500M",

      // Environment Variables
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },

      // Logs
      error_file: "/opt/cmdetect/logs/pm2-auth-error.log",
      out_file: "/opt/cmdetect/logs/pm2-auth-out.log",
      time: true,

      // Merge logs (single file per type)
      merge_logs: true,

      // Log rotation
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
