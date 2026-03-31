const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verify JWT and attach user to request ────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// ─── Require admin role ───────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

// ─── Require active subscription (skip for admins) ───────────────────────────
const requireSubscription = (req, res, next) => {
  if (req.user.role === 'admin') return next();

  const sub = req.user.subscription;
  const isActive =
    sub.status === 'active' &&
    sub.currentPeriodEnd &&
    new Date(sub.currentPeriodEnd) > new Date();

  if (!isActive) {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }
  next();
};

module.exports = { protect, adminOnly, requireSubscription };
