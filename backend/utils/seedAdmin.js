const User = require('../models/User');

// Creates the default admin account on first run if it doesn't exist
async function seedAdmin() {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return;

    await User.create({
      name: 'Platform Admin',
      email: process.env.ADMIN_EMAIL || 'admin@golfcharity.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isEmailVerified: true,
      subscription: { status: 'active' },
    });

    console.log('✅  Admin account seeded:', process.env.ADMIN_EMAIL);
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
}

module.exports = seedAdmin;
