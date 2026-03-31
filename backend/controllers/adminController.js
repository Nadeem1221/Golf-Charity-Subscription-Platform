const User = require('../models/User');
const Score = require('../models/Score');
const Draw =  require('../models/Draw');
const Winner =  require('../models/Winner');
const Charity = require('../models/Charity');
const SubscriptionLog =  require('../models/SubscriptionLog');

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      monthlySubscribers,
      yearlySubscribers,
      totalDraws,
      totalWinners,
      pendingVerifications,
      pendingPayments,
      totalCharities,
    ] = await Promise.all([
      User.countDocuments({ role: 'subscriber' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'monthly' }),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'yearly' }),
      Draw.countDocuments(),
      Winner.countDocuments(),
      Winner.countDocuments({ verificationStatus: 'pending', proofScreenshot: { $ne: null } }),
      Winner.countDocuments({ verificationStatus: 'approved', paymentStatus: 'pending' }),
      Charity.countDocuments({ isActive: true }),
    ]);

    // Total prize pool across all published draws
    const prizePoolAgg = await Draw.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$totalPrizePool' } } },
    ]);
    const totalPrizePool = prizePoolAgg[0]?.total || 0;

    // Monthly signup trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const signupTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'subscriber' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Charity contribution totals
    const charityTotals = await Charity.find({ isActive: true })
      .select('name totalDonated subscriberCount')
      .sort({ totalDonated: -1 })
      .limit(5);

    // Recent draw stats
    const recentDraws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(5)
      .select('name month year totalPrizePool participantCount jackpotRolledOver');

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeSubscribers,
        monthlySubscribers,
        yearlySubscribers,
        totalDraws,
        totalWinners,
        pendingVerifications,
        pendingPayments,
        totalCharities,
        totalPrizePool,
        signupTrend,
        charityTotals,
        recentDraws,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = { role: 'subscriber' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query['subscription.status'] = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('selectedCharity', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity', 'name slug');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const scores = await Score.findOne({ user: user._id });
    const winnings = await Winner.find({ user: user._id })
      .populate('draw', 'name month year')
      .sort({ createdAt: -1 });

    res.json({ success: true, user, scores: scores?.scores || [], winnings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { name, email, isActive, subscription } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (isActive !== undefined) updates.isActive = isActive;
    if (subscription) updates.subscription = subscription;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/users/:id/scores ─────────────────────────────────────────
exports.adminEditUserScores = async (req, res) => {
  try {
    const { scores } = req.body; // array of { value, date }

    let record = await Score.findOne({ user: req.params.id });
    if (!record) {
      record = new Score({ user: req.params.id, scores: [] });
    }

    // Validate and set scores directly
    const validated = scores
      .filter((s) => s.value >= 1 && s.value <= 45)
      .slice(0, 5)
      .map((s) => ({ value: Number(s.value), date: new Date(s.date) }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    record.scores = validated;
    await record.save();

    res.json({ success: true, scores: record.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
