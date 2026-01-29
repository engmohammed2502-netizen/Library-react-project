const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  universityId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 12
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin', 'root', 'guest'],
    default: 'student'
  },
  department: {
    type: String,
    enum: ['electrical', 'chemical', 'civil', 'mechanical', 'medical', null],
    default: null
  },
  name: {
    type: String,
    trim: true
  },
  fullName: String,
  displayName: String,
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 10
  },
  avatar: {
    type: String
  },
  
  // نظام التجميد
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lockedUntil: {
    type: Date
  },
  
  // التتبع
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// تشفير الباسورد
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة الباسورد
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// التحقق من الحساب المجمد
userSchema.methods.isLocked = function() {
  const lockDate = this.lockUntil || this.lockedUntil;
  return lockDate && lockDate > Date.now();
};

// Register pagination plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);
