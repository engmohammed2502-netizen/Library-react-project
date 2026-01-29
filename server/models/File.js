const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lecture', 'reference', 'exercises', 'exams'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  category: String,
  description: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastDownloadedAt: Date,
  department: String
});

// Register pagination plugin
fileSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('File', fileSchema);
