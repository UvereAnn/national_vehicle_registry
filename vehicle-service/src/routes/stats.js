// vehicle-service/src/routes/stats.js
// Stats live in vehicle-service (not auth-service) because vehicle
// counts belong to the service that owns vehicle data.
// activeStaff count comes from the User collection — vehicle-service
// doesn't have a User model, so we use a direct MongoDB collection
// query via mongoose.connection.db rather than duplicating the schema.

const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Run all vehicle counts in parallel
    const [total, pending, approved, rejected, approvedToday] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'pending' }),
      Vehicle.countDocuments({ status: 'approved' }),
      Vehicle.countDocuments({ status: 'rejected' }),
      Vehicle.countDocuments({ status: 'approved', updatedAt: { $gte: startOfToday } }),
    ]);

    // Query the users collection directly via the existing Mongoose connection
    // without importing a full User model — avoids duplicating the schema
    // across services while still getting the activeStaff count
    const usersCollection = mongoose.connection.db.collection('users');
    const activeStaff = await usersCollection.countDocuments({
      role: 'staff',
      isActive: true,
    });

    res.json({ total, pending, approved, rejected, approvedToday, activeStaff });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;