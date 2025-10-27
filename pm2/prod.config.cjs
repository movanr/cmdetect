// config/pm2/prod.config.js
module.exports = {
  apps: [
    {
      name: "auth-server",
      script: "/opt/cmdetect/apps/auth-server/dist/index.js",

      // Production: Could use cluster mode later
      instances: 1,
      exec_mode: "fork",

      // Aggressive restart policy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 4000,

      // Resources
      max_memory_restart: "1G",

      // Production Environment
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Logs with rotation
      error_file: "/opt/cmdetect/logs/pm2-auth-error.log",
      out_file: "/opt/cmdetect/logs/pm2-auth-out.log",
      log_file: "/opt/cmdetect/logs/pm2-auth.log",
      time: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Kill timeout
      kill_timeout: 5000,
    },
  ],
};
