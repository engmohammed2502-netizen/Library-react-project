const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const forumMessageSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String
  },
  userRole: {
    type: String,
    enum: ['student', 'professor', 'admin', 'root', 'guest']
  },
  userAvatar: {
    type: String
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumMessage'
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumMessage',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
forumMessageSchema.index({ forum: 1, createdAt: -1 });
forumMessageSchema.index({ userId: 1, createdAt: -1 });
forumMessageSchema.index({ replyTo: 1 });
forumMessageSchema.index({ isPinned: -1, createdAt: -1 });
forumMessageSchema.index({ isDeleted: 1 });

// Virtual for reply count
forumMessageSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for like count
forumMessageSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Pre-save middleware to populate userName and userRole from User
forumMessageSchema.pre('save', async function(next) {
  // If userName/userRole not set, populate from User
  if (!this.userName || !this.userRole) {
    try {
      const User = require('./User');
      const user = await User.findById(this.userId).select('name username role');
      if (user) {
        this.userName = user.name || user.username || 'Unknown';
        this.userRole = user.role || 'guest';
      }
    } catch (error) {
      console.error('Error populating user data in ForumMessage:', error);
    }
  }
  
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Method to soft delete
forumMessageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = userId;
  return this.save();
};

// Method to restore
forumMessageSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// Method to toggle like
forumMessageSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to get messages by forum
forumMessageSchema.statics.getByForum = function(forumId, options = {}) {
  const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
  return this.paginate(
    { forum: forumId, isDeleted: false },
    {
      page,
      limit,
      sort,
      populate: [
        { path: 'userId', select: 'name role avatar department' },
        { path: 'replyTo', select: 'content userId' },
        {
          path: 'replies',
          populate: { path: 'userId', select: 'name role avatar' }
        }
      ]
    }
  );
};

// Static method to get pinned messages
forumMessageSchema.statics.getPinned = function(forumId) {
  return this.find({
    forum: forumId,
    isPinned: true,
    isDeleted: false
  })
  .populate('userId', 'name role avatar')
  .sort({ createdAt: -1 });
};

// Register pagination plugin
forumMessageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ForumMessage', forumMessageSchema);
