// vehicle-service/src/routes/public.js
// Mounted at /api/public — no auth required, used by the
// public plate verification page

const express = require('express');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

// GET /api/public/verify/:plate
router.get('/verify/:plate', async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase();
    const vehicle = await Vehicle.findOne({ plateNumber: plate })
      .select('ownerName make model year color plateNumber status');

    if (!vehicle) {
      return res.status(404).json({ found: false, message: 'Plate number not found' });
    }

    res.json({ found: true, vehicle });
  } catch (err) {
    console.error('Public verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;