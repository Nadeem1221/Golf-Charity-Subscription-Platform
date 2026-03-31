const Score = require('../models/Score');

const SCORE_MIN = 1;
const SCORE_MAX = 45;
const DRAW_SIZE = 5;

// ─── Random draw — pure lottery ───────────────────────────────────────────────
function randomDraw() {
  const pool = [];
  while (pool.length < DRAW_SIZE) {
    const n = Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN;
    if (!pool.includes(n)) pool.push(n);
  }
  return pool.sort((a, b) => a - b);
}

// ─── Algorithmic draw — weighted by score frequency across all users ──────────
async function algorithmicDraw() {
  // Fetch all stored scores
  const allScoreRecords = await Score.find();

  // Build frequency map
  const freq = {};
  let total = 0;

  for (const record of allScoreRecords) {
    for (const entry of record.scores) {
      freq[entry.value] = (freq[entry.value] || 0) + 1;
      total++;
    }
  }

  if (total === 0) {
    // No scores yet — fall back to random
    return randomDraw();
  }

  // Build weighted pool (higher frequency = more slots = higher chance of being drawn)
  const weightedPool = [];
  for (let n = SCORE_MIN; n <= SCORE_MAX; n++) {
    const count = freq[n] || 0;
    // Weight: frequent scores get more entries (biased toward common scores)
    const weight = Math.max(1, Math.round((count / total) * 100));
    for (let i = 0; i < weight; i++) {
      weightedPool.push(n);
    }
  }

  // Sample 5 unique numbers from the weighted pool
  const drawn = new Set();
  let attempts = 0;
  while (drawn.size < DRAW_SIZE && attempts < 1000) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    drawn.add(weightedPool[idx]);
    attempts++;
  }

  // Fallback if not enough unique numbers found
  while (drawn.size < DRAW_SIZE) {
    const n = Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN;
    drawn.add(n);
  }

  return Array.from(drawn).sort((a, b) => a - b);
}

// ─── Run draw based on configured type ───────────────────────────────────────
async function runDraw(drawType = 'random') {
  if (drawType === 'algorithmic') {
    return await algorithmicDraw();
  }
  return randomDraw();
}

// ─── Match user scores against drawn numbers ──────────────────────────────────
// Returns the count of matched numbers and which numbers matched
function matchScores(userScores, drawnNumbers) {
  const userSet = new Set(userScores.map((s) => s.value));
  const drawnSet = new Set(drawnNumbers);
  const matched = [...userSet].filter((n) => drawnSet.has(n));
  return { count: matched.length, matched };
}

// ─── Process all participants for a draw ─────────────────────────────────────
// Returns categorised winners
async function processDrawResults(drawnNumbers) {
  const allScoreRecords = await Score.find().populate('user');

  const results = {
    fiveMatch: [],
    fourMatch: [],
    threeMatch: [],
    allParticipants: allScoreRecords.length,
  };

  for (const record of allScoreRecords) {
    if (!record.user || !record.user.subscription || record.user.subscription.status !== 'active') {
      continue; // only active subscribers participate
    }

    const { count, matched } = matchScores(record.scores, drawnNumbers);

    const entry = {
      userId: record.user._id,
      user: record.user,
      matchedNumbers: matched,
      matchCount: count,
    };

    if (count === 5) results.fiveMatch.push(entry);
    else if (count === 4) results.fourMatch.push(entry);
    else if (count === 3) results.threeMatch.push(entry);
  }

  return results;
}

module.exports = { runDraw, matchScores, processDrawResults, randomDraw, algorithmicDraw };
