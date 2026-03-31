import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function SubscribePage() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (isSubscribed) {
      navigate('/dashboard/subscription');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/stripe/create-checkout-session', { plan: selectedPlan });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page subscribe-page">
      <div className="page-header">
        <h1>Choose Your Plan</h1>
        <p>Subscribe to start entering scores, participating in draws, and supporting your charity.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isSubscribed && (
        <div className="alert alert-info">
          You already have an active subscription. <Link to="/dashboard/subscription">Manage it here.</Link>
        </div>
      )}

      <div className="plan-selector">
        <div
          className={`plan-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('monthly')}
        >
          <div className="plan-radio">
            <input
              type="radio" name="plan" value="monthly"
              checked={selectedPlan === 'monthly'}
              onChange={() => setSelectedPlan('monthly')}
            />
          </div>
          <h2>Monthly</h2>
          <p className="plan-price">$60 <span>/month</span></p>
          <ul className="plan-features">
            <li>Full platform access</li>
            <li>Monthly draw entry</li>
            <li>Score tracking (up to 5)</li>
            <li>Charity contribution (min 10%)</li>
            <li>Winner verification</li>
          </ul>
        </div>

        <div
          className={`plan-card plan-featured ${selectedPlan === 'yearly' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('yearly')}
        >
          <span className="plan-badge">Best Value — Save nearly 10%</span>
          <div className="plan-radio">
            <input
              type="radio" name="plan" value="yearly"
              checked={selectedPlan === 'yearly'}
              onChange={() => setSelectedPlan('yearly')}
            />
          </div>
          <h2>Yearly</h2>
          <p className="plan-price">$650 <span>/year</span></p>
          <p className="plan-saving">That's just ~$54.16/month</p>
          <ul className="plan-features">
            <li>Everything in Monthly</li>
            <li>12 draws per year</li>
            <li>Priority support</li>
            <li>Higher charity impact</li>
          </ul>
        </div>
      </div>

      <div className="subscribe-action">
        <button
          className="btn-primary btn-lg"
          onClick={handleSubscribe}
          disabled={loading || isSubscribed}
        >
          {loading ? 'Processing...' : isSubscribed ? 'Already Subscribed' : `Subscribe — ${selectedPlan === 'monthly' ? '$60/mo' : '$650/yr'}`}
        </button>
        <p className="subscribe-small">
          Secure payment via Stripe. Cancel anytime. By subscribing you agree to our terms.
        </p>
      </div>

      <div className="subscribe-breakdown">
        <h3>Where your money goes</h3>
        <div className="breakdown-bars">
          <div className="breakdown-row">
            <span>Prize Pool</span>
            <div className="breakdown-bar">
              <div className="breakdown-fill" style={{ width: '60%' }}>60%</div>
            </div>
          </div>
          <div className="breakdown-row">
            <span>Charity (min)</span>
            <div className="breakdown-bar">
              <div className="breakdown-fill breakdown-charity" style={{ width: '10%' }}>10%</div>
            </div>
          </div>
          <div className="breakdown-row">
            <span>Platform</span>
            <div className="breakdown-bar">
              <div className="breakdown-fill breakdown-platform" style={{ width: '30%' }}>30%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
