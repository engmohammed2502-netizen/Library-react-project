const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

/**
 * نموذج تنبيهات الأمان
 * يسجل جميع الأحداث الأمنية المهمة في النظام
 */
const securityAlertSchema = new Schema({
  // نوع التنبيه
  type: {
    type: String,
    enum: [
      'login_attempt',      // محاولة تسجيل دخول
      'failed_login',       // تسجيل دخول فاشل
      'suspicious_activity', // نشاط مشبوه
      'password_change',    // تغيير كلمة المرور
      'account_lockout',    // تجميد حساب
      'account_unlock',     // إلغاء تجميد حساب
      'file_upload',        // رفع ملف
      'file_download',      // تحميل ملف
      'user_creation',      // إنشاء مستخدم
      'user_deletion',      // حذف مستخدم
      'role_change',        // تغيير صلاحية
      'system_error',       // خطأ نظام
      'brute_force_attempt', // محاولة هجوم بقوة الغاشمة
      'sql_injection_attempt', // محاولة حقن SQL
      'xss_attempt',        // محاولة هجوم XSS
      'ddos_attempt',       // محاولة هجوم DDoS
      'unauthorized_access' // وصول غير مصرح
    ],
    required: true
  },
  
  // مستوى الخطورة
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // عنوان التنبيه
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // وصف تفصيلي
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // المستخدم المتعلق بالتنبيه
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // بيانات المستخدم (في حالة عدم وجود حساب)
  userData: {
    userId: String,
    username: String,
    role: String,
    ipAddress: String,
    userAgent: String
  },
  
  // عنوان IP للمستخدم
  ipAddress: {
    type: String,
    required: true
  },
  
  // وكيل المستخدم (User Agent)
  userAgent: {
    type: String,
    required: true
  },
  
  // الموقع الجغرافي (إذا كان متاحاً)
  location: {
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number
  },
  
  // بيانات إضافية
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  
  // حالة التنبيه
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'ignored'],
    default: 'pending'
  },
  
  // ملاحظات المشرف
  adminNotes: {
    type: String,
    trim: true
  },
  
  // المشرف الذي تعامل مع التنبيه
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // تاريخ المراجعة
  reviewedAt: {
    type: Date
  },
  
  // هل تم إرسال إشعار للمشرف؟
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // تاريخ إرسال الإشعار
  notificationSentAt: {
    type: Date
  }
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true   }
});

// Register pagination plugin
securityAlertSchema.plugin(mongoosePaginate);

// فهارس للبحث السريع
securityAlertSchema.index({ type: 1 });
securityAlertSchema.index({ severity: 1 });
securityAlertSchema.index({ status: 1 });
securityAlertSchema.index({ user: 1 });
securityAlertSchema.index({ ipAddress: 1 });
securityAlertSchema.index({ createdAt: -1 });
securityAlertSchema.index({ createdAt: 1, type: 1 });
securityAlertSchema.index({ 'userData.role': 1 });

/**
 * دوال مخصصة للنموذج
 */

// دالة لإنشاء تنبيه تسجيل دخول فاشل
securityAlertSchema.statics.createFailedLoginAlert = async function(userId, ipAddress, userAgent, metadata = {}) {
  const alertData = {
    type: 'failed_login',
    severity: 'medium',
    title: 'محاولة تسجيل دخول فاشلة',
    description: 'تم تسجيل محاولة تسجيل دخول فاشلة لحساب المستخدم',
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه هجوم بقوة الغاشمة
securityAlertSchema.statics.createBruteForceAlert = async function(ipAddress, userAgent, attempts, metadata = {}) {
  const alertData = {
    type: 'brute_force_attempt',
    severity: 'high',
    title: 'محاولة هجوم بقوة الغاشمة',
    description: `تم الكشف عن ${attempts} محاولة تسجيل دخول فاشلة من نفس العنوان IP في فترة زمنية قصيرة`,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      attempts,
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه محاولة حقن SQL
securityAlertSchema.statics.createSQLInjectionAlert = async function(userId, ipAddress, userAgent, query, metadata = {}) {
  const alertData = {
    type: 'sql_injection_attempt',
    severity: 'critical',
    title: 'محاولة هجوم بحقن SQL',
    description: 'تم الكشف عن محاولة هجوم بحقن SQL في استعلام قاعدة البيانات',
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      maliciousQuery: query.substring(0, 500), // حفظ أول 500 حرف فقط
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه محاولة XSS
securityAlertSchema.statics.createXSSAlert = async function(userId, ipAddress, userAgent, input, metadata = {}) {
  const alertData = {
    type: 'xss_attempt',
    severity: 'high',
    title: 'محاولة هجوم XSS',
    description: 'تم الكشف عن محاولة هجوم XSS في بيانات الإدخال',
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      maliciousInput: input.substring(0, 500), // حفظ أول 500 حرف فقط
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه وصول غير مصرح
securityAlertSchema.statics.createUnauthorizedAccessAlert = async function(userId, ipAddress, userAgent, endpoint, metadata = {}) {
  const alertData = {
    type: 'unauthorized_access',
    severity: 'high',
    title: 'محاولة وصول غير مصرح',
    description: `محاولة وصول غير مصرح إلى نقطة النهاية: ${endpoint}`,
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      endpoint,
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه تجميد حساب
securityAlertSchema.statics.createAccountLockoutAlert = async function(userId, ipAddress, userAgent, reason, metadata = {}) {
  const alertData = {
    type: 'account_lockout',
    severity: 'medium',
    title: 'تجميد حساب مستخدم',
    description: `تم تجميد حساب المستخدم بسبب: ${reason}`,
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      reason,
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة لإنشاء تنبيه رفع ملف مشبوه
securityAlertSchema.statics.createSuspiciousFileUploadAlert = async function(userId, ipAddress, userAgent, filename, metadata = {}) {
  const alertData = {
    type: 'file_upload',
    severity: 'medium',
    title: 'رفع ملف مشبوه',
    description: `تم رفع ملف مشبوه: ${filename}`,
    user: userId,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      filename,
      timestamp: new Date()
    }
  };
  
  return this.create(alertData);
};

// دالة للحصول على إحصائيات التنبيهات
securityAlertSchema.statics.getStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        pendingAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        criticalAlerts: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        highAlerts: {
          $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
        },
        mediumAlerts: {
          $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
        },
        lowAlerts: {
          $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAlerts: 1,
        pendingAlerts: 1,
        criticalAlerts: 1,
        highAlerts: 1,
        mediumAlerts: 1,
        lowAlerts: 1
      }
    }
  ]);
  
  return stats[0] || {
    totalAlerts: 0,
    pendingAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  };
};

// دالة للحصول على التنبيهات حسب النوع
securityAlertSchema.statics.getAlertsByType = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// دالة للحصول على التنبيهات حسب عنوان IP
securityAlertSchema.statics.getTopIPs = async function(limit = 10, startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        criticalCount: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        lastActivity: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// دالة لحذف التنبيهات القديمة
securityAlertSchema.statics.cleanupOldAlerts = async function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    severity: { $ne: 'critical' }
  });
  
  return {
    deletedCount: result.deletedCount,
    cutoffDate
  };
};

// دالة لتحديث حالة التنبيه
securityAlertSchema.methods.updateStatus = async function(newStatus, adminId, notes = '') {
  this.status = newStatus;
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  
  if (notes) {
    this.adminNotes = notes;
  }
  
  return this.save();
};

// دالة للتحقق إذا كان التنبيه حرجاً ويتطلب إجراءً فورياً
securityAlertSchema.methods.isCritical = function() {
  return this.severity === 'critical' && this.status === 'pending';
};

// دالة للحصول على ملخص التنبيه
securityAlertSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    severity: this.severity,
    title: this.title,
    description: this.description,
    status: this.status,
    createdAt: this.createdAt,
    user: this.user,
    ipAddress: this.ipAddress
  };
};

// مرجع افتراضي للمستخدم
securityAlertSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

const SecurityAlert = mongoose.model('SecurityAlert', securityAlertSchema);

module.exports = SecurityAlert;
