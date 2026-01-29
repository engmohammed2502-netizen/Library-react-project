module.exports = {
  apps: [{
    name: 'engineering-library-backend',
    script: './server/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 9000,
      // Note: Environment variables should be loaded from .env file
      // These are fallback values only. Use .env file for actual configuration.
      MONGODB_URI: 'mongodb://127.0.0.1:27017/engineering_library',
      // ⚠️ SECURITY: JWT_SECRET should be set in .env file, not here!
      // Remove hardcoded secrets from this file in production
      UPLOAD_PATH: '/var/www/engineering-library/server/uploads',
      MAX_FILE_SIZE: 157286400,
      MAX_IMAGE_SIZE: 3145728,
      FRONTEND_URL: 'http://localhost:9000',
      BACKUP_PATH: '/var/backups/engineering-library',
      BACKUP_RETENTION_DAYS: 30,
      LOGIN_ATTEMPTS_LIMIT: 5,
      ACCOUNT_LOCK_TIME: 24
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // إعادة التشغيل عند استهلاك ذاكرة عالية
    max_memory_restart: '500M',
    
    // مراقبة وتصحيح الأخطاء
    min_uptime: '60s',
    max_restarts: 10,
    
    // تتبع الأداء
    vizion: false,
    increment_var: 'PORT'
  }]
};
