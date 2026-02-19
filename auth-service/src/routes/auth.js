const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nvr_secret_key_2024';

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    //const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    if (rows[0].is_active === 0 || rows[0].is_active === false) {
  return res.status(403).json({ error: 'Account deactivated. Contact your administrator.' });
}

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/register — accepts token from Authorization header OR x-user-role from gateway
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['admin_officer', 'registration_staff'])
], async (req, res) => {
  // Support both: called via gateway (has x-user-role) or direct with Bearer token
  let callerRole = req.headers['x-user-role'];
  let callerId = req.headers['x-user-id'];

  if (!callerRole) {
    // Try Bearer token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      callerRole = decoded.role;
      callerId = decoded.id;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  if (!['super_admin', 'admin_officer'].includes(callerRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  // Only super_admin can create admin_officer
  if (role === 'admin_officer' && callerRole !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can create admin officers' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );

    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
