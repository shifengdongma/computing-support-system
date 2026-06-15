module.exports = {
  apps: [
    {
      name: 'mock-backend',
      script: './server/index.cjs',
      cwd: '/www/算力支撑管理系统',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './server/logs/error.log',
      out_file: './server/logs/output.log',
      merge_logs: true,
    },
  ],
}
