// ─── ProfilePage.js ───────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    selectedCharity: user?.selectedCharity?._id || '',
    charityContributionPercent: user?.charityContributionPercent || 10,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/charities?limit=50').then(({ data }) => {
      if (data.success) setCharities(data.charities);
    });
  }, []);

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (form.charityContributionPercent < 10) {
      flash('error', 'Minimum contribution is 10%'); return;
    }
    setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', form);
      updateUser(data.user);
      flash('success', 'Profile updated!');
    } catch (err) {
      flash('error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      flash('error', 'Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      flash('success', 'Password changed successfully!');
    } catch (err) {
      flash('error', err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page profile-page">
      <h1>My Profile</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Profile form */}
      <div className="card">
        <h2>Personal Details</h2>
        <form onSubmit={handleProfileSave} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={user?.email} disabled readOnly />
            <small>Email cannot be changed here.</small>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+44 7700 900000" />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="United Kingdom" />
          </div>
          <div className="form-group">
            <label>Selected Charity</label>
            <select value={form.selectedCharity} onChange={(e) => setForm({ ...form, selectedCharity: e.target.value })}>
              <option value="">-- None selected --</option>
              {charities.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Charity Contribution: {form.charityContributionPercent}%</label>
            <input type="range" min="10" max="100"
              value={form.charityContributionPercent}
              onChange={(e) => setForm({ ...form, charityContributionPercent: Number(e.target.value) })}
            />
            <small>Minimum 10%</small>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="card">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange} className="profile-form">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
