const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const db = require('../models/db');

const router = express.Router();
const PLATE_SERVICE_URL = process.env.PLATE_SERVICE_URL || 'http://localhost:3003';

const validateVehicle = [
  body('owner_name').notEmpty().trim(),
  body('national_id').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('make').notEmpty().trim(),
  body('model').notEmpty().trim(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('color').notEmpty().trim(),
  body('engine_number').notEmpty().trim(),
  body('chassis_number').notEmpty().trim()
];

// GET /vehicles
router.get('/', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    console.log('GET vehicles - role:', role, 'userId:', userId);

    let query = `SELECT v.*, 
      u.name as staff_name,
      a.name as approved_by_name,
      r.name as reviewed_by_name
      FROM vehicles v 
      LEFT JOIN users u ON v.submitted_by = u.id
      LEFT JOIN users a ON v.reviewed_by = a.id
      LEFT JOIN users r ON v.reviewed_by = r.id`;
    const params = [];

    if (role === 'registration_staff') {
      query += ' WHERE v.submitted_by = ?';
      params.push(userId);
    }
    query += ' ORDER BY v.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name as staff_name, a.name as reviewed_by_name
       FROM vehicles v 
       LEFT JOIN users u ON v.submitted_by = u.id
       LEFT JOIN users a ON v.reviewed_by = a.id
       WHERE v.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /vehicles
router.post('/', validateVehicle, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const userId = req.headers['x-user-id'];
    const { owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number } = req.body;

    const [engDup] = await db.query('SELECT id FROM vehicles WHERE engine_number = ?', [engine_number]);
    if (engDup.length) return res.status(409).json({ error: 'Engine number already registered' });

    const [chsDup] = await db.query('SELECT id FROM vehicles WHERE chassis_number = ?', [chassis_number]);
    if (chsDup.length) return res.status(409).json({ error: 'Chassis number already registered' });

    const [result] = await db.query(
      'INSERT INTO vehicles (owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number, userId]
    );

    res.status(201).json({ message: 'Registration submitted', id: result.insertId });
  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /vehicles/:id - edit pending
router.put('/:id', validateVehicle, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });

    const v = rows[0];
    if (v.status !== 'pending') return res.status(400).json({ error: 'Can only edit pending registrations' });
    if (role === 'registration_staff' && String(v.submitted_by) !== String(userId)) {
      return res.status(403).json({ error: 'Not authorized to edit this registration' });
    }

    const { owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number } = req.body;
    await db.query(
      'UPDATE vehicles SET owner_name=?, national_id=?, phone=?, address=?, make=?, model=?, year=?, color=?, engine_number=?, chassis_number=? WHERE id=?',
      [owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number, req.params.id]
    );
    res.json({ message: 'Registration updated' });
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /vehicles/:id/approve
router.put('/:id/approve', async (req, res) => {
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];
  console.log('Approve - role:', role, 'userId:', userId);

  if (!['super_admin', 'admin_officer'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    if (rows[0].status !== 'pending') return res.status(400).json({ error: 'Vehicle is not pending' });

    // Call plate service
    let plateNumber;
    try {
      const plateRes = await axios.post(`${PLATE_SERVICE_URL}/plates/generate`, {
        vehicle_id: req.params.id
      });
      plateNumber = plateRes.data.plate_number;
    } catch (err) {
      console.error('Plate service error:', err.message);
      return res.status(503).json({ error: 'Plate generation service unavailable' });
    }

    await db.query(
      "UPDATE vehicles SET status='approved', plate_number=?, reviewed_by=?, updated_at=NOW() WHERE id=?",
      [plateNumber, userId, req.params.id]
    );

    // Log the action
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_VEHICLE', 'vehicle', req.params.id, `Approved and assigned plate: ${plateNumber}`]
    ).catch(() => {}); // don't fail if audit log fails

    res.json({ message: 'Vehicle approved', plate_number: plateNumber });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /vehicles/:id/reject
router.put('/:id/reject', async (req, res) => {
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];
  console.log('Reject - role:', role, 'userId:', userId);

  if (!['super_admin', 'admin_officer'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { reason } = req.body;
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    if (rows[0].status !== 'pending') return res.status(400).json({ error: 'Vehicle is not pending' });

    await db.query(
      "UPDATE vehicles SET status='rejected', rejection_reason=?, reviewed_by=?, updated_at=NOW() WHERE id=?",
      [reason || 'No reason provided', userId, req.params.id]
    );

    // Log the action
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, 'REJECT_VEHICLE', 'vehicle', req.params.id, `Rejected. Reason: ${reason || 'No reason provided'}`]
    ).catch(() => {});

    res.json({ message: 'Vehicle rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
