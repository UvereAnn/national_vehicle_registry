// vehicle-service/src/models/Vehicle.js
// plateNumber is sparse:true from day one — this was the
// exact bug that ended the previous session. sparse:true means
// MongoDB's unique index ignores null/missing values entirely,
// so multiple pending vehicles (all with no plate yet) can
// coexist without a duplicate key collision.

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  nationalId: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  engineNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  chassisNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  plateNumber: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,   // ← the fix, built in from day one
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vehicle', vehicleSchema);