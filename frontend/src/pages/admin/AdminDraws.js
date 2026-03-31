// ─── AdminDraws.js ────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export function AdminDraws() {
  const [draws, setDraws]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]       = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const fetchDraws = async () => {
    const { data } = await api.get('/draws/admin/all');
    if (data.success) setDraws(data.draws);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDraws(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/draws/admin/create', form);
      setSuccess('Draw created!');
      await fetchDraws();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create draw');
    } finally {
      setCreating(false);
    }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="page admin-draws">
      <h1>Draw Management</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create draw */}
      <div className="card">
        <h2>Create New Draw</h2>
        <form onSubmit={handleCreate} className="form-row">
          <div className="form-group">
            <label>Month</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <input type="number" value={form.year} min="2024" max="2030"
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Draw Type</label>
            <select value={form.drawType} onChange={(e) => setForm({ ...form, drawType: e.target.value })}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <div className="form-group form-group-action">
            <label>&nbsp;</label>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Draw'}
            </button>
          </div>
        </form>
      </div>

      {/* Draws list */}
      <div className="card">
        <h2>All Draws</h2>
        {loading ? <div className="loading">Loading...</div> : (
          <table className="data-table">
            <thead>
              <tr><th>Draw</th><th>Status</th><th>Type</th><th>Prize Pool</th><th>Participants</th><th>Published</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {draws.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No draws yet</td></tr>
              ) : draws.map((d) => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                  <td>{d.drawType}</td>
                  <td>${(d.totalPrizePool / 100).toFixed(2)}</td>
                  <td>{d.participantCount || '—'}</td>
                  <td>{d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('en-US') : '—'}</td>
                  <td><Link to={`/admin/draws/${d._id}`} className="btn-sm btn-secondary">Manage</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDraws;
