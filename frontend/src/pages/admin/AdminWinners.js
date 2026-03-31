import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminWinners() {
  const [winners, setWinners]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters]       = useState({ status: '', paymentStatus: '', page: 1 });
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState(null); // id being actioned
  const [noteModal, setNoteModal]   = useState(null); // { id, action }
  const [adminNote, setAdminNote]   = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: filters.page, limit: 20 });
      if (filters.status)        params.set('status', filters.status);
      if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
      const { data } = await api.get(`/winners/admin/all?${params}`);
      if (data.success) {
        setWinners(data.winners);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchWinners(); }, [filters]);

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  // ── Open confirm modal for approve/reject ─────────────────────────────────
  const openVerifyModal = (id, action) => {
    setNoteModal({ id, action });
    setAdminNote('');
  };

  // ── Submit verification ────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!noteModal) return;
    setActionId(noteModal.id);
    try {
      await api.put(`/winners/admin/${noteModal.id}/verify`, {
        verificationStatus: noteModal.action,
        adminNote,
      });
      flash('success', `Winner ${noteModal.action}`);
      setNoteModal(null);
      await fetchWinners();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  // ── Mark paid ──────────────────────────────────────────────────────────────
  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this prize as paid?')) return;
    setActionId(id);
    try {
      await api.put(`/winners/admin/${id}/mark-paid`, { paymentNote: 'Paid by admin' });
      flash('success', 'Marked as paid');
      await fetchWinners();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to mark paid');
    } finally {
      setActionId(null);
    }
  };

  const matchBadgeClass = { '5-match': 'gold', '4-match': 'silver', '3-match': 'bronze' };

  return (
    <div className="page admin-winners">
      <h1>Winners Management</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Verification Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })}
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Summary counts */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Winners</h3>
          <p className="stat-value">{pagination.total || 0}</p>
        </div>
        <div className="stat-card stat-card-warning">
          <h3>Awaiting Verification</h3>
          <p className="stat-value">
            {winners.filter((w) => w.verificationStatus === 'pending' && w.proofScreenshot).length}
          </p>
        </div>
        <div className="stat-card stat-card-warning">
          <h3>Approved — Unpaid</h3>
          <p className="stat-value">
            {winners.filter((w) => w.verificationStatus === 'approved' && w.paymentStatus === 'pending').length}
          </p>
        </div>
      </div>

      {/* Winners table */}
      {loading ? (
        <div className="loading">Loading winners...</div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Winner</th>
                <th>Draw</th>
                <th>Match</th>
                <th>Prize</th>
                <th>Proof</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.length === 0 ? (
                <tr><td colSpan="8" className="empty-cell">No winners found</td></tr>
              ) : winners.map((w) => (
                <tr key={w._id}>
                  <td>
                    <strong>{w.user?.name}</strong>
                    <br />
                    <small>{w.user?.email}</small>
                  </td>
                  <td>{w.draw?.name || '—'}</td>
                  <td>
                    <span className={`badge badge-match badge-${matchBadgeClass[w.matchType]}`}>
                      {w.matchType}
                    </span>
                  </td>
                  <td><strong>${(w.prizeAmount / 100).toFixed(2)}</strong></td>
                  <td>
                    {w.proofScreenshot ? (
                      <a
                        href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${w.proofScreenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm btn-secondary"
                      >
                        View Screenshot
                      </a>
                    ) : (
                      <span className="text-muted">Not uploaded</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${w.verificationStatus}`}>
                      {w.verificationStatus}
                    </span>
                    {w.adminNote && (
                      <p className="admin-note-small">{w.adminNote}</p>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${w.paymentStatus}`}>
                      {w.paymentStatus === 'paid'
                        ? `Paid ${new Date(w.paidAt).toLocaleDateString('en-US')}`
                        : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns action-btns-col">
                      {/* Verification actions */}
                      {w.verificationStatus === 'pending' && w.proofScreenshot && (
                        <>
                          <button
                            className="btn-sm btn-primary"
                            disabled={actionId === w._id}
                            onClick={() => openVerifyModal(w._id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            disabled={actionId === w._id}
                            onClick={() => openVerifyModal(w._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {/* Payment action */}
                      {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                        <button
                          className="btn-sm btn-primary"
                          disabled={actionId === w._id}
                          onClick={() => handleMarkPaid(w._id)}
                        >
                          {actionId === w._id ? '...' : 'Mark Paid'}
                        </button>
                      )}
                      {w.verificationStatus === 'pending' && !w.proofScreenshot && (
                        <span className="text-muted text-sm">Awaiting proof</span>
                      )}
                      {w.paymentStatus === 'paid' && (
                        <span className="text-muted text-sm">Complete ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="btn-secondary"
          >
            ← Prev
          </button>
          <span>Page {filters.page} of {pagination.pages}</span>
          <button
            disabled={filters.page === pagination.pages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
      )}

      {/* Verify/Reject modal */}
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{noteModal.action === 'approved' ? 'Approve Winner' : 'Reject Winner'}</h2>
              <button className="modal-close" onClick={() => setNoteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                {noteModal.action === 'approved'
                  ? 'Approving this winner will allow their prize to be paid out.'
                  : 'Rejecting this winner will notify them by email. Please provide a reason.'}
              </p>
              <div className="form-group">
                <label>Admin Note {noteModal.action === 'rejected' ? '(required)' : '(optional)'}</label>
                <textarea
                  rows="3"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    noteModal.action === 'rejected'
                      ? 'e.g. Screenshot does not match recorded scores'
                      : 'Optional note for the winner'
                  }
                />
              </div>
              <div className="form-row">
                <button className="btn-secondary" onClick={() => setNoteModal(null)}>Cancel</button>
                <button
                  className={noteModal.action === 'approved' ? 'btn-primary' : 'btn-danger'}
                  onClick={handleVerify}
                  disabled={noteModal.action === 'rejected' && !adminNote.trim()}
                >
                  Confirm {noteModal.action === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
