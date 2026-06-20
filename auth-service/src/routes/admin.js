// auth-service/src/routes/admin.js
// Mounted at the FULL path /api/admin in index.js.
// Built MongoDB-native from the start — no MySQL legacy this time.
// Role checks use staff/admin/superadmin throughout, matching User.js exactly.

const express = require('express');
const User = require('../models/User');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, is_active: user.isActive });
  } catch (err) {
    console.error('Toggle user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'superadmin') {
    return res.status(403).json({ error: 'Super admin only' });
  }
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;