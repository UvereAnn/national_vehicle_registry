const express = require('express');
const db = require('../models/db');

const router = express.Router();

// GET /public/verify/:plate
router.get('/verify/:plate', async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase();
    const [rows] = await db.query(
      "SELECT owner_name, make, model, year, color, plate_number, status FROM vehicles WHERE plate_number = ?",
      [plate]
    );

    if (!rows.length) {
      return res.status(404).json({ found: false, message: 'Plate number not found' });
    }

    res.json({ found: true, vehicle: rows[0] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
