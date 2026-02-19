const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/db');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  console.log('Admin check - role:', role); // debug
  if (!['super_admin', 'admin_officer'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /admin/users/:id/toggle
router.put('/users/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const newStatus = rows[0].is_active ? 0 : 1;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'}`, is_active: newStatus });
  } catch (err) {
    console.error('Toggle user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];
  if (role !== 'super_admin') return res.status(403).json({ error: 'Super admin only' });
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [[total]] = await db.query('SELECT COUNT(*) as count FROM vehicles');
    const [[pending]] = await db.query("SELECT COUNT(*) as count FROM vehicles WHERE status='pending'");
    const [[approved]] = await db.query("SELECT COUNT(*) as count FROM vehicles WHERE status='approved'");
    const [[rejected]] = await db.query("SELECT COUNT(*) as count FROM vehicles WHERE status='rejected'");
    const [[today]] = await db.query(
      "SELECT COUNT(*) as count FROM vehicles WHERE status='approved' AND DATE(updated_at) = CURDATE()"
    );
    const [[staffCount]] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role='registration_staff' AND is_active=1"
    );

    res.json({
      total: total.count,
      pending: pending.count,
      approved: approved.count,
      rejected: rejected.count,
      approvedToday: today.count,
      activeStaff: staffCount.count
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
