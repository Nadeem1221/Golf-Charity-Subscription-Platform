import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function SubscriptionPage() {
  const { user, fetchMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const sub = user?.subscription;
  const isActive = sub?.status === 'active';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? You will keep access until the end of your billing period.')) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/stripe/cancel-subscription');
      await fetchMe();
      setSuccess('Subscription cancelled. You will retain access until the end of your billing period.');
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (plan) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/stripe/create-checkout-session', { plan });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page subscription-page">
      <h1>Subscription</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>Current Plan</h2>
        <div className="sub-details">
          <div className="sub-row">
            <span>Status</span>
            <span className={`badge badge-${sub?.status || 'inactive'}`}>
              {sub?.status || 'Inactive'}
              {sub?.cancelAtPeriodEnd && ' (cancels at period end)'}
            </span>
          </div>
          <div className="sub-row">
            <span>Plan</span>
            <span>{sub?.plan ? `${sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}` : 'None'}</span>
          </div>
          {sub?.currentPeriodStart && (
            <div className="sub-row">
              <span>Billing Period</span>
              <span>
                {new Date(sub.currentPeriodStart).toLocaleDateString('en-US')} –{' '}
                {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US')}
              </span>
            </div>
          )}
          {sub?.currentPeriodEnd && isActive && (
            <div className="sub-row">
              <span>Next Renewal</span>
              <span>{new Date(sub.current_period_end).toLocaleDateString('en-US')}</span>
            </div>
          )}
        </div>
      </div>

      {!isActive && (
        <div className="card">
          <h2>Reactivate Subscription</h2>
          <p>You don't have an active subscription. Subscribe to participate in draws.</p>
          <Link to="/subscribe" className="btn-primary">Subscribe Now</Link>
        </div>
      )}

      {isActive && (
        <div className="card">
          <h2>Change Plan</h2>
          <p>Switch between monthly and yearly billing. Changes take effect on your next billing cycle.</p>
          <div className="plan-switch-btns">
            {sub?.plan !== 'monthly' && (
              <button className="btn-secondary" onClick={() => handleChangePlan('monthly')} disabled={loading}>
                Switch to Monthly ($60/mo)
              </button>
            )}
            {sub?.plan !== 'yearly' && (
              <button className="btn-secondary" onClick={() => handleChangePlan('yearly')} disabled={loading}>
                Switch to Yearly ($650/yr — Save nearly 10%)
              </button>
            )}
          </div>
        </div>
      )}

      {isActive && !sub?.cancelAtPeriodEnd && (
        <div className="card card-danger">
          <h2>Cancel Subscription</h2>
          <p>You will keep access until <strong>{new Date(sub?.currentPeriodEnd).toLocaleDateString('en-US')}</strong>. After that, you will lose access to scores, draws, and dashboard features.</p>
          <button className="btn-danger" onClick={handleCancel} disabled={loading}>
            {loading ? 'Processing...' : 'Cancel Subscription'}
          </button>
        </div>
      )}
    </div>
  );
}
