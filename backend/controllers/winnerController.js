const Winner = require('../models/Winner');
const path = require('path');
const fs = require('fs');
const { sendVerificationStatusEmail } = require('../utils/email');

// ─── GET /api/winners/my ──────────────────────────────────────────────────────
exports.getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'name month year drawnNumbers publishedAt')
      .sort({ createdAt: -1 });

    const totalWon = winners
      .filter((w) => w.paymentStatus === 'paid')
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    res.json({ success: true, winners, totalWon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/winners/:id/upload-proof ───────────────────────────────────────
exports.uploadProof = async (req, res) => {
  try {
    const winner = await Winner.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Delete old proof if exists
    if (winner.proofScreenshot) {
      const oldPath = path.join(__dirname, '..', winner.proofScreenshot);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    winner.proofScreenshot = `/uploads/proofs/${req.file.filename}`;
    winner.proofUploadedAt = new Date();
    winner.verificationStatus = 'pending';
    await winner.save();

    res.json({ success: true, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: GET /api/winners/admin/all ───────────────────────────────────────
exports.adminGetAllWinners = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.verificationStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [winners, total] = await Promise.all([
      Winner.find(query)
        .populate('user', 'name email')
        .populate('draw', 'name month year')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Winner.countDocuments(query),
    ]);

    res.json({
      success: true,
      winners,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/winners/admin/:id/verify ─────────────────────────────────
exports.adminVerifyWinner = async (req, res) => {
  try {
    const { verificationStatus, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const winner = await Winner.findById(req.params.id).populate('user', 'name email');
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    winner.verificationStatus = verificationStatus;
    winner.adminNote = adminNote || null;
    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();
    await winner.save();

    // Email winner about status
    sendVerificationStatusEmail(winner.user, verificationStatus, adminNote).catch(() => {});

    res.json({ success: true, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/winners/admin/:id/mark-paid ─────────────────────────────
exports.adminMarkPaid = async (req, res) => {
  try {
    const { paymentNote } = req.body;

    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    if (winner.verificationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Winner must be verified first' });
    }

    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
    winner.paymentNote = paymentNote || null;
    await winner.save();

    res.json({ success: true, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
