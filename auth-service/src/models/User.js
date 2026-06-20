// auth-service/src/models/User.js
// Roles locked in from the start: staff / admin / superadmin
// isActive included from day one (was a retrofit last time)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true, // stored hashed
  },
  role: {
    type: String,
    enum: ['staff', 'admin', 'superadmin'],
    default: 'staff',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);