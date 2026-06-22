// vehicle-service/src/models/User.js
const mongoose = require('mongoose');

// Minimal schema configuration so vehicle-service can resolve user names and roles 
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { collection: 'users' }); // Forces it to read from the exact collection auth-service writes to

module.exports = mongoose.model('User', UserSchema);