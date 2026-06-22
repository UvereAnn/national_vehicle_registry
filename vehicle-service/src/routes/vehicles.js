// vehicle-service/src/routes/vehicles.js
// Mounted at the FULL path /api/vehicles in index.js.
// Role checks use staff/admin/superadmin throughout — same as
// auth-service and the frontend, one naming scheme everywhere.

const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

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
  body('chassis_number').notEmpty().trim(),
];

// GET /api/vehicles — list all, filtered by role
router.get('/', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    let filter = {};
    if (role === 'staff') {
      filter.submittedBy = userId;
    }

    const vehicles = await Vehicle.find(filter)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    // Flatten to match what the frontend table expects
    const result = vehicles.map(v => ({
      ...v.toObject(),
      staff_name: v.submittedBy?.name || null,
      reviewed_by_name: v.reviewedBy?.name || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    res.json({
      ...vehicle.toObject(),
      staff_name: vehicle.submittedBy?.name || null,
      reviewed_by_name: vehicle.reviewedBy?.name || null,
    });
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/vehicles — submit new registration
router.post('/', validateVehicle, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const userId = req.headers['x-user-id'];
    const {
      owner_name, national_id, phone, address,
      make, model, year, color, engine_number, chassis_number
    } = req.body;

    const engDup = await Vehicle.findOne({ engineNumber: engine_number });
    if (engDup) return res.status(409).json({ error: 'Engine number already registered' });

    const chsDup = await Vehicle.findOne({ chassisNumber: chassis_number });
    if (chsDup) return res.status(409).json({ error: 'Chassis number already registered' });

    const vehicle = new Vehicle({
      ownerName: owner_name,
      nationalId: national_id,
      phone,
      address,
      make,
      model,
      year,
      color,
      engineNumber: engine_number,
      chassisNumber: chassis_number,
      submittedBy: userId,
      status: 'pending',
    });

    await vehicle.save();
    res.status(201).json({ message: 'Registration submitted', id: vehicle._id });
  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vehicles/:id — edit pending registration
router.put('/:id', validateVehicle, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'pending') {
      return res.status(400).json({ error: 'Can only edit pending registrations' });
    }
    if (role === 'staff' && String(vehicle.submittedBy) !== String(userId)) {
      return res.status(403).json({ error: 'Not authorized to edit this registration' });
    }

    const {
      owner_name, national_id, phone, address,
      make, model, year, color, engine_number, chassis_number
    } = req.body;

    vehicle.ownerName = owner_name;
    vehicle.nationalId = national_id;
    vehicle.phone = phone;
    vehicle.address = address;
    vehicle.make = make;
    vehicle.model = model;
    vehicle.year = year;
    vehicle.color = color;
    vehicle.engineNumber = engine_number;
    vehicle.chassisNumber = chassis_number;

    await vehicle.save();
    res.json({ message: 'Registration updated' });
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vehicles/:id/approve — admin only
router.put('/:id/approve', async (req, res) => {
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];

  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'pending') {
      return res.status(400).json({ error: 'Vehicle is not pending' });
    }

    // Call plate-service to generate a unique plate number
    let plateNumber;
    try {
      const plateRes = await axios.post(`${PLATE_SERVICE_URL}/plates/generate`, {
        vehicle_id: req.params.id,
      });
      plateNumber = plateRes.data.plate_number;
    } catch (err) {
      console.error('Plate service error:', err.message);
      return res.status(503).json({ error: 'Plate generation service unavailable' });
    }

    vehicle.status = 'approved';
    vehicle.plateNumber = plateNumber;
    vehicle.reviewedBy = userId;
    await vehicle.save();

    // Log the action — fire and forget, don't fail the request if logging fails
    AuditLog.create({
      userId,
      action: 'APPROVE_VEHICLE',
      entityType: 'vehicle',
      entityId: vehicle._id,
      details: `Approved and assigned plate: ${plateNumber}`,
    }).catch(() => {});

    res.json({ message: 'Vehicle approved', plate_number: plateNumber });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vehicles/:id/reject — admin only
router.put('/:id/reject', async (req, res) => {
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];

  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { reason } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'pending') {
      return res.status(400).json({ error: 'Vehicle is not pending' });
    }

    vehicle.status = 'rejected';
    vehicle.rejectionReason = reason || 'No reason provided';
    vehicle.reviewedBy = userId;
    await vehicle.save();

    AuditLog.create({
      userId,
      action: 'REJECT_VEHICLE',
      entityType: 'vehicle',
      entityId: vehicle._id,
      details: `Rejected. Reason: ${reason || 'No reason provided'}`,
    }).catch(() => {});

    res.json({ message: 'Vehicle rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;