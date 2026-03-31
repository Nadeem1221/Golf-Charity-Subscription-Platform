import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="page how-it-works-page">
      <div className="page-header">
        <h1>How It Works</h1>
        <p>Everything you need to know about scoring, draws, prizes, and charity giving.</p>
      </div>

      <section className="hiw-section">
        <h2>1. Subscribe</h2>
        <p>Choose from a monthly plan or a discounted yearly plan. Your payment is processed securely via Stripe. A portion of every subscription contributes to the monthly prize pool, and a minimum of 10% goes directly to your chosen charity.</p>
        <div className="plan-cards">
          <div className="plan-card">
            <h3>Monthly</h3>
            <p className="plan-price">$60 <span>/month</span></p>
            <ul>
              <li>Full platform access</li>
              <li>Monthly draw entry</li>
              <li>Score tracking</li>
              <li>Charity contribution</li>
            </ul>
          </div>
          <div className="plan-card plan-featured">
            <span className="badge">Best Value</span>
            <h3>Yearly</h3>
            <p className="plan-price">$650 <span>/year</span></p>
            <ul>
              <li>Everything in Monthly</li>
              <li>~10% saving</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <h2>2. Enter Your Scores</h2>
        <p>After each round of golf, log your Stableford score (1–45) and the date you played. The platform stores your latest 5 scores at all times — when you add a new score, the oldest is automatically removed. Scores are always displayed most recent first.</p>
        <div className="info-box">
          <strong>Stableford Format:</strong> Scores range from 1 to 45 points per round. You need at least 1 score on record to participate in draws.
        </div>
      </section>

      <section className="hiw-section">
        <h2>3. Monthly Draws</h2>
        <p>On the last day of each month, 5 numbers between 1 and 45 are drawn. The draw can be either:</p>
        <ul className="hiw-list">
          <li><strong>Random:</strong> Pure lottery-style — every number has an equal chance.</li>
          <li><strong>Algorithmic:</strong> Weighted by the most/least common scores across all players — making it more likely for frequently-scored numbers to appear.</li>
        </ul>
        <p>Your latest 5 scores are compared against the 5 drawn numbers. The more matches, the bigger your prize.</p>
      </section>

      <section className="hiw-section">
        <h2>4. Prize Distribution</h2>
        <div className="prize-table">
          <div className="prize-row header">
            <span>Match Type</span><span>Share of Pool</span><span>Rollover?</span>
          </div>
          <div className="prize-row">
            <span>5-Number Match (Jackpot)</span><span>40%</span><span>Yes</span>
          </div>
          <div className="prize-row">
            <span>4-Number Match</span><span>35%</span><span>No</span>
          </div>
          <div className="prize-row">
            <span>3-Number Match</span><span>25%</span><span>No</span>
          </div>
        </div>
        <p>If multiple players win the same tier, the prize is split equally. If no one wins the jackpot, it rolls over to next month.</p>
      </section>

      <section className="hiw-section">
        <h2>5. Claiming Your Prize</h2>
        <p>Winners are notified by email when draw results are published. To claim your prize, you must upload a screenshot of your scores from the platform as proof of eligibility. An admin reviews and approves your submission before payment is processed.</p>
      </section>

      <section className="hiw-section">
        <h2>6. Charity Giving</h2>
        <p>At signup, you select a charity from our directory. A minimum of 10% of your subscription fee is donated to your chosen charity every month. You can increase this percentage at any time from your dashboard. You can also make independent donations not tied to gameplay.</p>
      </section>

      <div className="hiw-cta">
        <h2>Ready to join?</h2>
        <Link to="/subscribe" className="btn-primary btn-lg">Subscribe Now</Link>
      </div>
    </div>
  );
}
