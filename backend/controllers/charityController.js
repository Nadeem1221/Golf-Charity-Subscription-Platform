const Charity = require('../models/Charity');
const User = require('../models/User');

// ─── GET /api/charities ───────────────────────────────────────────────────────
exports.getCharities = async (req, res) => {
  try {
    const { search, category, featured, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [charities, total] = await Promise.all([
      Charity.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Charity.countDocuments(query),
    ]);

    res.json({
      success: true,
      charities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/charities/:id ───────────────────────────────────────────────────
exports.getCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found' });
    }
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/charities (admin) ──────────────────────────────────────────────
exports.createCharity = async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/charities/:id (admin) ──────────────────────────────────────────
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found' });
    }
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/charities/:id (admin) ───────────────────────────────────────
exports.deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found' });
    }
    // Soft delete
    charity.isActive = false;
    await charity.save();
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
