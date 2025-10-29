module.exports = {
  apps: [
    {
      name: "junyue-spa",
      cwd: "/root/junyue-pro",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/junyue-spa/error.log",
      out_file: "/var/log/junyue-spa/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      min_uptime: "30s",
      max_restarts: 10,
      restart_delay: 10000,
      kill_timeout: 5000,
      listen_timeout: 30000,
    },
  ],
};
