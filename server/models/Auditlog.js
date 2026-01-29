const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: String,
  userRole: String,
  ipAddress: String,
  userAgent: String,
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'login_failed', 'account_locked',
      'file_upload', 'file_download', 'file_delete',
      'course_create', 'course_update', 'course_delete',
      'user_create', 'user_update', 'user_delete',
      'forum_post', 'forum_delete', 'admin_action'
    ]
  },
  resourceType: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  }
});

// Register pagination plugin
auditLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('AuditLog', auditLogSchema);
