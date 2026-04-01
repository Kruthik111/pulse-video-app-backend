const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  videoId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Video'
  },
  videoTitle: {
    type: String
  },
  action: {
    type: String,
    enum: ['Upload', 'Update', 'Delete', 'Status Change'],
    required: true
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
