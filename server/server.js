const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const fileRoutes = require('./routes/files');
const forumRoutes = require('./routes/forum');
const adminRoutes = require('./routes/admin');

const app = express();

// middleware الأساسية
app.use(helmet());

// CORS configuration from environment variable
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:9000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 طلب في الإنتاج، 1000 في التطوير
  message: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);

// health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      service: 'Engineering Library API',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      service: 'Engineering Library API',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// static files للـ React build
const CLIENT_BUILD_PATH = process.env.CLIENT_BUILD_PATH || path.join(__dirname, '../../client/build');
app.use(express.static(CLIENT_BUILD_PATH));

// جميع الطلبات الأخرى تذهب لـ React
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// التعامل مع الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// التحقق من المتغيرات البيئية المطلوبة
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'UPLOAD_PATH',
  'BACKUP_PATH'
];

const recommendedEnvVars = [
  'CORS_ORIGIN',
  'WEB_URL',
  'SESSION_SECRET'
];

const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
const missingRecommended = recommendedEnvVars.filter(varName => !process.env[varName]);

if (missingRequired.length > 0) {
  console.error('❌ متغيرات بيئية مطلوبة مفقودة:', missingRequired.join(', '));
  console.error('⚠️ يرجى التأكد من إعداد ملف .env بشكل صحيح');
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ لا يمكن تشغيل التطبيق في الإنتاج بدون المتغيرات المطلوبة');
    process.exit(1);
  }
}

if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ متغيرات بيئية موصى بها مفقودة:', missingRecommended.join(', '));
}

// التحذير من استخدام قيم افتراضية غير آمنة
if (process.env.JWT_SECRET && (
  process.env.JWT_SECRET.includes('change-this') || 
  process.env.JWT_SECRET.includes('placeholder') ||
  process.env.JWT_SECRET.length < 32
)) {
  const errorMsg = '❌ JWT_SECRET ضعيف أو غير آمن. يرجى استخدام مفتاح قوي عشوائي (32 حرف على الأقل)';
  if (process.env.NODE_ENV === 'production') {
    console.error(errorMsg);
    console.error('❌ لا يمكن تشغيل التطبيق في الإنتاج بمفتاح JWT ضعيف');
    process.exit(1);
  } else {
    console.warn('⚠️ ' + errorMsg);
  }
}

// الاتصال بقاعدة البيانات وتشغيل السيرفر
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/engineering_library';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل على المنفذ: ${PORT}`);
    console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
    console.log(`🔧 البيئة: ${process.env.NODE_ENV}`);
    console.log(`📁 Upload Path: ${process.env.UPLOAD_PATH || 'Not configured'}`);
  });
})
.catch(err => {
  console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
  process.exit(1);
});

module.exports = app;
