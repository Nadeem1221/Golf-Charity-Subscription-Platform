const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const User = require('../models/User');
const Score = require('../models/Score');
const { runDraw, processDrawResults } = require('../utils/drawEngine');
const { calculatePrizePool, splitPool } = require('../utils/prizePool');
const { sendDrawResultsEmail } = require('../utils/email');

// ─── GET /api/draws ───────────────────────────────────────────────────────────
exports.getDraws = async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/draws/latest ────────────────────────────────────────────────────
exports.getLatestDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/draws/:id ───────────────────────────────────────────────────────
exports.getDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id)
      .populate('fiveMatchWinners fourMatchWinners threeMatchWinners', 'name email');
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/draws/my-participation ─────────────────────────────────────────
exports.getMyParticipation = async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'name month year drawnNumbers status publishedAt')
      .sort({ createdAt: -1 });

    const publishedDraws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(6)
      .select('name month year drawnNumbers publishedAt');

    res.json({ success: true, winners, recentDraws: publishedDraws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: GET /api/draws/admin/all ─────────────────────────────────────────
exports.adminGetAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ year: -1, month: -1 });
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/draws/admin/create ─────────────────────────────────────
exports.adminCreateDraw = async (req, res) => {
  try {
    const { month, year, drawType } = req.body;

    const existing = await Draw.findOne({ month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Draw for this month already exists' });
    }

    // Calculate prize pool from active subscribers
    const activeUsers = await User.find({ 'subscription.status': 'active', role: 'subscriber' })
      .select('subscription');
    const poolData = calculatePrizePool(
      activeUsers.map((u) => ({ plan: u.subscription.plan }))
    );

    // Check for rollover from previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear, jackpotRolledOver: true });
    const rollover = prevDraw ? prevDraw.jackpotPool : 0;

    const draw = await Draw.create({
      month,
      year,
      name: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year} Draw`,
      drawType: drawType || 'random',
      totalPrizePool: poolData.totalPool + rollover,
      jackpotPool: poolData.jackpotPool + rollover,
      fourMatchPool: poolData.fourMatchPool,
      threeMatchPool: poolData.threeMatchPool,
      rolloverAmount: rollover,
      activeSubscriberCount: activeUsers.length,
    });

    res.status(201).json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/draws/admin/:id/simulate ───────────────────────────────
exports.adminSimulateDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') {
      return res.status(400).json({ success: false, message: 'Draw already published' });
    }

    const drawnNumbers = await runDraw(draw.drawType);
    const results = await processDrawResults(drawnNumbers);

    draw.drawnNumbers = drawnNumbers;
    draw.simulationResults = {
      drawnNumbers,
      fiveMatchCount: results.fiveMatch.length,
      fourMatchCount: results.fourMatch.length,
      threeMatchCount: results.threeMatch.length,
      participantCount: results.allParticipants,
      jackpotPerWinner: results.fiveMatch.length > 0
        ? splitPool(draw.jackpotPool, results.fiveMatch.length) : draw.jackpotPool,
      fourMatchPerWinner: results.fourMatch.length > 0
        ? splitPool(draw.fourMatchPool, results.fourMatch.length) : 0,
      threeMatchPerWinner: results.threeMatch.length > 0
        ? splitPool(draw.threeMatchPool, results.threeMatch.length) : 0,
    };
    draw.status = 'simulated';
    await draw.save();

    res.json({ success: true, draw, simulationResults: draw.simulationResults });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/draws/admin/:id/publish ─────────────────────────────────
exports.adminPublishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') {
      return res.status(400).json({ success: false, message: 'Already published' });
    }
    if (!draw.drawnNumbers || draw.drawnNumbers.length < 5) {
      return res.status(400).json({ success: false, message: 'Run simulation first' });
    }

    const results = await processDrawResults(draw.drawnNumbers);

    // Build Winner documents
    const createWinners = async (list, matchType, poolAmount) => {
      if (list.length === 0) return [];
      const prizeAmount = splitPool(poolAmount, list.length);
      const docs = list.map((w) => ({
        user: w.userId,
        draw: draw._id,
        matchType,
        prizeAmount,
        matchedNumbers: w.matchedNumbers,
      }));
      return await Winner.insertMany(docs);
    };

    const fiveWinners   = await createWinners(results.fiveMatch,  '5-match', draw.jackpotPool);
    const fourWinners   = await createWinners(results.fourMatch,  '4-match', draw.fourMatchPool);
    const threeWinners  = await createWinners(results.threeMatch, '3-match', draw.threeMatchPool);

    // Update draw record
    draw.fiveMatchWinners  = fiveWinners.map((w) => w.user);
    draw.fourMatchWinners  = fourWinners.map((w) => w.user);
    draw.threeMatchWinners = threeWinners.map((w) => w.user);
    draw.participantCount  = results.allParticipants;
    draw.status            = 'published';
    draw.publishedAt       = new Date();
    draw.jackpotRolledOver = fiveWinners.length === 0; // rollover if no jackpot winner
    await draw.save();

    // Send result emails asynchronously
    const allParticipants = await Score.find().populate('user', 'email name');
    for (const record of allParticipants) {
      if (!record.user) continue;
      const winnerRecord = [...fiveWinners, ...fourWinners, ...threeWinners]
        .find((w) => w.user.toString() === record.user._id.toString());

      sendDrawResultsEmail(
        record.user,
        draw,
        winnerRecord?.matchType || null,
        winnerRecord?.prizeAmount || 0
      ).catch(() => {});
    }

    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/draws/admin/:id ─────────────────────────────────────────
exports.adminUpdateDraw = async (req, res) => {
  try {
    const draw = await Draw.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
