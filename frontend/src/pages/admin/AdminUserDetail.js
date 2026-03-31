import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser]       = useState(null);
  const [scores, setScores]   = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingScores, setEditingScores] = useState(false);
  const [scoresDraft, setScoresDraft] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      if (data.success) {
        setUser(data.user);
        setScores(data.scores);
        setWinnings(data.winnings);
        setScoresDraft(data.scores.map((s) => ({
          value: s.value,
          date: new Date(s.date).toISOString().split('T')[0],
        })));
      }
    } catch {
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUser(); }, [id]);

  const handleScoreSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/users/${id}/scores`, { scores: scoresDraft });
      setScores(data.scores);
      setEditingScores(false);
      setSuccess('Scores updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update scores');
    } finally {
      setSaving(false);
    }
  };

  const addScoreRow = () => {
    if (scoresDraft.length >= 5) return;
    setScoresDraft([...scoresDraft, { value: '', date: new Date().toISOString().split('T')[0] }]);
  };

  const updateScoreRow = (i, field, val) => {
    const updated = [...scoresDraft];
    updated[i] = { ...updated[i], [field]: val };
    setScoresDraft(updated);
  };

  const removeScoreRow = (i) => {
    setScoresDraft(scoresDraft.filter((_, idx) => idx !== i));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user)   return <div className="error-state">User not found</div>;

  return (
    <div className="page admin-user-detail">
      <Link to="/admin/users" className="back-link">← Back to Users</Link>
      <h1>{user.name}</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* User info */}
      <div className="card">
        <h2>Account Details</h2>
        <div className="detail-grid">
          <div><strong>Email</strong><p>{user.email}</p></div>
          <div><strong>Role</strong><p>{user.role}</p></div>
          <div><strong>Status</strong><p>{user.isActive ? 'Active' : 'Deactivated'}</p></div>
          <div><strong>Joined</strong><p>{new Date(user.createdAt).toLocaleDateString('en-US')}</p></div>
          <div><strong>Subscription</strong>
            <p>
              <span className={`badge badge-${user.subscription?.status}`}>{user.subscription?.status}</span>
              {' '}{user.subscription?.plan}
            </p>
          </div>
          <div><strong>Renewal</strong>
            <p>{user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString('en-US') : '—'}</p>
          </div>
          <div><strong>Charity</strong><p>{user.selectedCharity?.name || '—'}</p></div>
          <div><strong>Charity %</strong><p>{user.charityContributionPercent}%</p></div>
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <div className="section-header">
          <h2>Golf Scores</h2>
          {!editingScores ? (
            <button className="btn-secondary" onClick={() => setEditingScores(true)}>Edit Scores</button>
          ) : (
            <div className="action-btns">
              <button className="btn-primary" onClick={handleScoreSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn-secondary" onClick={() => { setEditingScores(false); setScoresDraft(scores.map((s) => ({ value: s.value, date: new Date(s.date).toISOString().split('T')[0] }))); }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {!editingScores ? (
          scores.length === 0 ? (
            <p className="empty-hint">No scores recorded.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Score</th><th>Date</th></tr></thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.value}</td>
                    <td>{new Date(s.date).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <div className="score-edit-grid">
            {scoresDraft.map((s, i) => (
              <div key={i} className="score-edit-row">
                <input type="number" min="1" max="45" placeholder="Score"
                  value={s.value} onChange={(e) => updateScoreRow(i, 'value', e.target.value)} />
                <input type="date" value={s.date} onChange={(e) => updateScoreRow(i, 'date', e.target.value)} />
                <button className="btn-sm btn-danger" onClick={() => removeScoreRow(i)}>✕</button>
              </div>
            ))}
            {scoresDraft.length < 5 && (
              <button className="btn-secondary btn-sm" onClick={addScoreRow}>+ Add Score</button>
            )}
          </div>
        )}
      </div>

      {/* Winnings */}
      <div className="card">
        <h2>Winnings History</h2>
        {winnings.length === 0 ? (
          <p className="empty-hint">No winnings.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Draw</th><th>Match</th><th>Prize</th><th>Verified</th><th>Paid</th></tr></thead>
            <tbody>
              {winnings.map((w) => (
                <tr key={w._id}>
                  <td>{w.draw?.name}</td>
                  <td>{w.matchType}</td>
                  <td>${(w.prizeAmount / 100).toFixed(2)}</td>
                  <td><span className={`badge badge-${w.verificationStatus}`}>{w.verificationStatus}</span></td>
                  <td><span className={`badge badge-${w.paymentStatus}`}>{w.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
