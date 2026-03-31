import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const today = () => new Date().toISOString().split('T')[0];

export default function ScoresPage() {
  const [scores, setScores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [addForm, setAddForm]     = useState({ value: '', date: today() });
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm]   = useState({ value: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/scores/my');
      if (data.success) setScores(data.scores);
    } catch (err) {
      flash('error', 'Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  // ── Add score ──────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    const val = Number(addForm.value);
    if (!val || val < 1 || val > 45) {
      flash('error', 'Score must be between 1 and 45'); return;
    }
    if (!addForm.date) { flash('error', 'Date is required'); return; }

    setSubmitting(true);
    try {
      const { data } = await api.post('/scores/add', {
        value: val, date: addForm.date,
      });
      setScores(data.scores);
      setAddForm({ value: '', date: today() });
      flash('success', scores.length >= 5
        ? 'Score added — oldest score removed to keep your latest 5.'
        : 'Score added!');
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to add score');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit score ─────────────────────────────────────────
  const startEdit = (index) => {
    setEditIndex(index);
    setEditForm({
      value: scores[index].value,
      date: new Date(scores[index].date).toISOString().split('T')[0],
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const val = Number(editForm.value);
    if (!val || val < 1 || val > 45) { flash('error', 'Score must be between 1 and 45'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.put(`/scores/edit/${editIndex}`, {
        value: val, date: editForm.date,
      });
      setScores(data.scores);
      setEditIndex(null);
      flash('success', 'Score updated!');
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to update score');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete score ───────────────────────────────────────
  const handleDelete = async (index) => {
    if (!window.confirm('Remove this score?')) return;
    try {
      const { data } = await api.delete(`/scores/delete/${index}`);
      setScores(data.scores);
      flash('success', 'Score removed');
    } catch (err) {
      flash('error', 'Failed to remove score');
    }
  };

  if (loading) return <div className="loading">Loading scores...</div>;

  return (
    <div className="page scores-page">
      <h1>My Scores</h1>
      <p className="page-sub">
        Your latest 5 Stableford scores (1–45). Adding a 6th score automatically removes the oldest.
        Scores are sorted most recent first.
      </p>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Add score form ────────────────────────── */}
      <div className="card">
        <h2>Add a Score</h2>
        <form onSubmit={handleAdd} className="score-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score-value">Stableford Score (1–45)</label>
              <input
                id="score-value" type="number" min="1" max="45"
                value={addForm.value}
                onChange={(e) => setAddForm({ ...addForm, value: e.target.value })}
                placeholder="e.g. 32"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="score-date">Date Played</label>
              <input
                id="score-date" type="date"
                value={addForm.date}
                onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                max={today()}
                required
              />
            </div>
            <div className="form-group form-group-action">
              <label>&nbsp;</label>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Score'}
              </button>
            </div>
          </div>
        </form>
        <p className="capacity-hint">{scores.length} / 5 scores stored</p>
      </div>

      {/* ── Score list ────────────────────────────── */}
      <div className="card">
        <h2>My Score History</h2>
        {scores.length === 0 ? (
          <p className="empty-hint">No scores yet. Add your first round above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    {editIndex === i ? (
                      <form onSubmit={handleEdit} className="inline-edit-form">
                        <input
                          type="number" min="1" max="45"
                          value={editForm.value}
                          onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                          style={{ width: '70px' }}
                          required
                        />
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          max={today()}
                          required
                        />
                        <button type="submit" className="btn-sm btn-primary" disabled={submitting}>Save</button>
                        <button type="button" className="btn-sm btn-secondary" onClick={() => setEditIndex(null)}>Cancel</button>
                      </form>
                    ) : (
                      <strong>{s.value}</strong>
                    )}
                  </td>
                  <td>{editIndex === i ? '' : new Date(s.date).toLocaleDateString('en-US')}</td>
                  <td>
                    {editIndex !== i && (
                      <div className="action-btns">
                        <button className="btn-sm btn-secondary" onClick={() => startEdit(i)}>Edit</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(i)}>Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
