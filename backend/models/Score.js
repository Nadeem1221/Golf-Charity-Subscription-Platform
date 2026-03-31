const mongoose = require('mongoose');

// Each document holds ALL 5 scores for one user (rolling window)
const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one score-record per user
    },
    // Array of up to 5 score entries, newest first
    scores: [
      {
        value: {
          type: Number,
          required: true,
          min: [1, 'Score must be at least 1'],
          max: [45, 'Score cannot exceed 45 (Stableford max)'],
        },
        date: {
          type: Date,
          required: true,
        },
        _id: false, // no sub-document IDs needed
      },
    ],
  },
  { timestamps: true }
);

// ─── Add a new score (rolling — keeps latest 5) ───────────────────────────────
scoreSchema.methods.addScore = function (value, date) {
  // Sort by date descending, prepend new score, keep first 5
  this.scores.unshift({ value, date: date || new Date() });
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (this.scores.length > 5) {
    this.scores = this.scores.slice(0, 5);
  }
};

// ─── Replace a score by index ─────────────────────────────────────────────────
scoreSchema.methods.editScore = function (index, value, date) {
  if (index < 0 || index >= this.scores.length) {
    throw new Error('Score index out of range');
  }
  this.scores[index] = { value, date: date || this.scores[index].date };
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = mongoose.model('Score', scoreSchema);
