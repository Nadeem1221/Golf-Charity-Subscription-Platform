import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => { if (data.success) setAnalytics(data.analytics); })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (!analytics) return null;

  const a = analytics;

  return (
    <div className="page admin-dashboard">
      <h1>Platform Analytics</h1>

      {/* ── Key stats ────────────────────────────────── */}
      <div className="stats-grid stats-grid-wide">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{a.totalUsers}</p>
        </div>
        <div className="stat-card stat-card-highlight">
          <h3>Active Subscribers</h3>
          <p className="stat-value">{a.activeSubscribers}</p>
          <p className="stat-sub">{a.monthlySubscribers} monthly · {a.yearlySubscribers} yearly</p>
        </div>
        <div className="stat-card">
          <h3>Total Draws</h3>
          <p className="stat-value">{a.totalDraws}</p>
        </div>
        <div className="stat-card">
          <h3>Total Winners</h3>
          <p className="stat-value">{a.totalWinners}</p>
        </div>
        <div className="stat-card stat-card-warning">
          <h3>Pending Verifications</h3>
          <p className="stat-value">{a.pendingVerifications}</p>
          <Link to="/admin/winners" className="btn-link">Review →</Link>
        </div>
        <div className="stat-card stat-card-warning">
          <h3>Pending Payments</h3>
          <p className="stat-value">{a.pendingPayments}</p>
          <Link to="/admin/winners" className="btn-link">Process →</Link>
        </div>
        <div className="stat-card">
          <h3>Active Charities</h3>
          <p className="stat-value">{a.totalCharities}</p>
        </div>
        <div className="stat-card stat-card-highlight">
          <h3>Total Prize Pool (All Time)</h3>
          <p className="stat-value">${(a.totalPrizePool / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* ── Recent draws ────────────────────────────── */}
      {a.recentDraws?.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h2>Recent Draws</h2>
            <Link to="/admin/draws" className="btn-link">All Draws →</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Draw</th>
                <th>Prize Pool</th>
                <th>Participants</th>
                <th>Jackpot</th>
              </tr>
            </thead>
            <tbody>
              {a.recentDraws.map((d) => (
                <tr key={d._id}>
                  <td><Link to={`/admin/draws/${d._id}`}>{d.name}</Link></td>
                  <td>${(d.totalPrizePool / 100).toFixed(2)}</td>
                  <td>{d.participantCount}</td>
                  <td>{d.jackpotRolledOver ? <span className="badge badge-rollover">Rolled Over</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Signup trend ───────────────────────────── */}
      {a.signupTrend && (
        <div className="card">
          <h2>Signup Trend (Last 6 Months)</h2>
          <div className="bar-chart">
            {(() => {
              const sixMonths = [];
              const today = new Date();
              for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                sixMonths.push({
                  year: d.getFullYear(),
                  month: d.getMonth() + 1,
                  name: d.toLocaleString('default', { month: 'short' }),
                  count: 0
                });
              }
              a.signupTrend.forEach(item => {
                const found = sixMonths.find(m => m.year === item._id.year && m.month === item._id.month);
                if (found) found.count = item.count;
              });
              const max = Math.max(...sixMonths.map(x => x.count), 1) * 1.2; // Add 20% headroom
              return sixMonths.map((item, i) => {
                const height = Math.max((item.count / max) * 100, 2); // 2% min height for visibility
                return (
                  <div key={i} className="bar-item">
                    <div className="bar-fill" style={{ height: `${item.count === 0 ? 0 : height}%` }} />
                    <span className="bar-label">{item.name}</span>
                    <span className="bar-value">{item.count > 0 ? item.count : ''}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ── Top charities ──────────────────────────── */}
      {a.charityTotals?.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h2>Top Charities by Donations</h2>
            <Link to="/admin/charities" className="btn-link">Manage →</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Charity</th><th>Total Donated</th><th>Supporters</th></tr>
            </thead>
            <tbody>
              {a.charityTotals.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>${(c.totalDonated / 100).toFixed(2)}</td>
                  <td>{c.subscriberCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
