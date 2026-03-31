import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', website: '',
  category: 'other', country: '', logo: '', isFeatured: false,
};

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const fetchCharities = async () => {
    const { data } = await api.get('/charities?limit=100');
    if (data.success) setCharities(data.charities);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCharities(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit   = (c) => {
    setForm({ name: c.name, description: c.description, shortDescription: c.shortDescription || '',
      website: c.website || '', category: c.category, country: c.country || '',
      logo: c.logo || '', isFeatured: c.isFeatured });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/charities/${editId}`, form);
      } else {
        await api.post('/charities', form);
      }
      setSuccess(editId ? 'Charity updated!' : 'Charity created!');
      setShowForm(false);
      await fetchCharities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this charity?')) return;
    try {
      await api.delete(`/charities/${id}`);
      setSuccess('Charity deactivated');
      await fetchCharities();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to deactivate charity');
    }
  };

  const CATEGORIES = ['health', 'education', 'environment', 'community', 'sports', 'other'];

  return (
    <div className="page admin-charities">
      <div className="page-header-row">
        <h1>Charity Management</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Charity</button>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Charity' : 'Add Charity'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Short Description (max 200 chars)</label>
                <input value={form.shortDescription} maxLength={200}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Full Description *</label>
                <textarea rows="4" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Logo URL</label>
                <input type="url" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group form-group-checkbox">
                <label>
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                  {' '}Featured on homepage
                </label>
              </div>
              <div className="form-row">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Charities table */}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Supporters</th><th>Donated</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {charities.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No charities</td></tr>
              ) : charities.map((c) => (
                <tr key={c._id} className={!c.isActive ? 'row-inactive' : ''}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.category}</td>
                  <td>{c.subscriberCount}</td>
                  <td>${(c.totalDonated / 100).toFixed(2)}</td>
                  <td>{c.isFeatured ? <span className="badge badge-featured">Yes</span> : '—'}</td>
                  <td><span className={`badge badge-${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-sm btn-secondary" onClick={() => openEdit(c)}>Edit</button>
                      {c.isActive && (
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
