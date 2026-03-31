// Prize pool distribution constants
const POOL_SHARES = {
  fiveMatch:  0.40, // 40% — jackpot (rolls over)
  fourMatch:  0.35, // 35%
  threeMatch: 0.25, // 25%
};

// What % of each subscription goes to prize pool
const PRIZE_POOL_PERCENT = 0.60; // 60% of subscription fee
const CHARITY_MIN_PERCENT = 0.10; // 10% minimum to charity

// Subscription prices (in pence/cents)
const PLAN_PRICES = {
  monthly: 6000,  // $60.00/month
  yearly:  65000, // $650.00/year
};

// ─── Calculate prize pool from active subscribers ─────────────────────────────
function calculatePrizePool(activeSubscribers) {
  // activeSubscribers: array of { plan: 'monthly'|'yearly' }
  let totalSubscriptionRevenue = 0;

  for (const sub of activeSubscribers) {
    if (sub.plan === 'monthly') {
      totalSubscriptionRevenue += PLAN_PRICES.monthly;
    } else if (sub.plan === 'yearly') {
      // Yearly is paid upfront — attribute 1 month's worth to this draw
      totalSubscriptionRevenue += Math.round(PLAN_PRICES.yearly / 12);
    }
  }

  const totalPool = Math.round(totalSubscriptionRevenue * PRIZE_POOL_PERCENT);

  return {
    totalSubscriptionRevenue,
    totalPool,
    jackpotPool:    Math.round(totalPool * POOL_SHARES.fiveMatch),
    fourMatchPool:  Math.round(totalPool * POOL_SHARES.fourMatch),
    threeMatchPool: Math.round(totalPool * POOL_SHARES.threeMatch),
  };
}

// ─── Split a pool equally among winners ──────────────────────────────────────
function splitPool(poolAmount, winnerCount) {
  if (winnerCount === 0) return 0;
  return Math.floor(poolAmount / winnerCount); // floor — no fractional pence
}

// ─── Calculate charity contribution for a user ────────────────────────────────
function calculateCharityContribution(subscriptionPlan, charityPercent) {
  const planPrice = PLAN_PRICES[subscriptionPlan] || 0;
  const percent = Math.max(charityPercent || CHARITY_MIN_PERCENT * 100, CHARITY_MIN_PERCENT * 100);
  return Math.round(planPrice * (percent / 100));
}

// ─── Format pence to pounds string ───────────────────────────────────────────
function formatCurrency(pence, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(pence / 100);
}

module.exports = {
  calculatePrizePool,
  splitPool,
  calculateCharityContribution,
  formatCurrency,
  PLAN_PRICES,
  PRIZE_POOL_PERCENT,
  POOL_SHARES,
};
