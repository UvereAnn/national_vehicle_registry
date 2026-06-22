// vehicle-service/src/models/AuditLog.js
// Tracks approve/reject actions for audit trail purposes.

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,   // e.g. 'APPROVE_VEHICLE', 'REJECT_VEHICLE'
  },
  entityType: {
    type: String,
    required: true,   // e.g. 'vehicle'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);