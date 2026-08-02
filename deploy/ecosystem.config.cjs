const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "travelguide-api",
      cwd: path.join(repositoryRoot, "backend"),
      script: "dist/main.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      kill_timeout: 10_000,
      env: { NODE_ENV: "production" },
    },
    {
      name: "travelguide-web",
      cwd: path.join(repositoryRoot, "frontend"),
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      kill_timeout: 10_000,
      env: { NODE_ENV: "production" },
    },
  ],
};
