const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/profile — alias for auth/me
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name slug logo');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
