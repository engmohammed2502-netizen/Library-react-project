const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const forumSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Reference to last message (for quick access)
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumMessage'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  // Legacy embedded messages (for backward compatibility)
  messages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    displayName: String,
    role: String,
    text: {
      type: String,
      required: true
    },
    image: String,
    replies: [{
      user: mongoose.Schema.Types.ObjectId,
      username: String,
      displayName: String,
      text: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    likes: [mongoose.Schema.Types.ObjectId],
    isPinned: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Register pagination plugin
forumSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Forum', forumSchema);
