module.exports = {
  apps: [
    {
      name: "nestjs-skeleton",
      script: "dist/main.js",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M"
    }
  ]
}
