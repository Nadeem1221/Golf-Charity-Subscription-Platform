const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
    },

    matchType: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
      required: true,
    },

    prizeAmount: {
      type: Number,
      required: true,
    },

    // Matched score values
    matchedNumbers: [{ type: Number }],

    // ─── Verification ─────────────────────────────────────────────
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    proofScreenshot: { type: String, default: null }, // file path
    proofUploadedAt: { type: Date, default: null },
    adminNote: { type: String, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },

    // ─── Payment ──────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: { type: Date, default: null },
    paymentNote: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winner', winnerSchema);
