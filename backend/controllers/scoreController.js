const Score = require('../models/Score');

// ─── GET /api/scores/my ───────────────────────────────────────────────────────
exports.getMyScores = async (req, res) => {
  try {
    let record = await Score.findOne({ user: req.user._id });
    if (!record) {
      return res.json({ success: true, scores: [] });
    }
    res.json({ success: true, scores: record.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/scores/add ─────────────────────────────────────────────────────
exports.addScore = async (req, res) => {
  try {
    const { value, date } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45 (Stableford format)',
      });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Score date is required' });
    }

    let record = await Score.findOne({ user: req.user._id });

    if (!record) {
      record = new Score({ user: req.user._id, scores: [] });
    }

    record.addScore(Number(value), new Date(date));
    await record.save();

    res.json({ success: true, scores: record.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/scores/edit/:index ──────────────────────────────────────────────
exports.editScore = async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { value, date } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45',
      });
    }

    const record = await Score.findOne({ user: req.user._id });
    if (!record || record.scores.length === 0) {
      return res.status(404).json({ success: false, message: 'No scores found' });
    }

    record.editScore(index, Number(value), date ? new Date(date) : undefined);
    await record.save();

    res.json({ success: true, scores: record.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/scores/delete/:index ────────────────────────────────────────
exports.deleteScore = async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const record = await Score.findOne({ user: req.user._id });
    if (!record || index < 0 || index >= record.scores.length) {
      return res.status(404).json({ success: false, message: 'Score not found' });
    }

    record.scores.splice(index, 1);
    await record.save();

    res.json({ success: true, scores: record.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
