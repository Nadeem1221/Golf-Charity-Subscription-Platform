const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true }, // 1-12
    year:  { type: Number, required: true },
    name:  { type: String }, // e.g. "March 2026 Draw"

    status: {
      type: String,
      enum: ['pending', 'simulated', 'published'],
      default: 'pending',
    },

    // ─── Draw configuration ────────────────────────────────────────
    drawType: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'random',
    },

    // The 5 drawn numbers (1–45)
    drawnNumbers: {
      type: [Number],
      default: [],
    },

    // ─── Prize pool snapshot at time of draw ──────────────────────
    totalPrizePool: { type: Number, default: 0 },
    jackpotPool:    { type: Number, default: 0 }, // 40% + any rollover
    fourMatchPool:  { type: Number, default: 0 }, // 35%
    threeMatchPool: { type: Number, default: 0 }, // 25%

    // Rollover from previous month (jackpot only)
    rolloverAmount: { type: Number, default: 0 },

    // ─── Participant snapshot ──────────────────────────────────────
    participantCount: { type: Number, default: 0 },
    activeSubscriberCount: { type: Number, default: 0 },

    // ─── Winners (populated after draw) ───────────────────────────
    fiveMatchWinners:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fourMatchWinners:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    threeMatchWinners:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    jackpotRolledOver: { type: Boolean, default: false },

    publishedAt: { type: Date, default: null },

    // Simulation results (temporary, cleared on publish)
    simulationResults: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Compound unique index: only one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
