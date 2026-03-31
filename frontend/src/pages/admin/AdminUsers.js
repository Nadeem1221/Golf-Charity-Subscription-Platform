import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const { data } = await api.get(`/admin/users?${params}`);
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [page, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (userId, currentValue) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentValue });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  return (
    <div className="page admin-users">
      <div className="page-header-row">
        <h1>Users</h1>
        <span className="total-badge">{pagination.total || 0} total</span>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text" placeholder="Search name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Plan</th>
                <th>Charity</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                  <td>
                    <Link to={`/admin/users/${u._id}`}>{u.name}</Link>
                    {!u.isActive && <span className="badge badge-danger ml-1">Deactivated</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.subscription?.status}`}>
                      {u.subscription?.status || 'none'}
                    </span>
                  </td>
                  <td>{u.subscription?.plan || '—'}</td>
                  <td>{u.selectedCharity?.name || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/users/${u._id}`} className="btn-sm btn-secondary">View</Link>
                      <button
                        className={`btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">← Prev</button>
          <span>Page {page} of {pagination.pages}</span>
          <button disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Next →</button>
        </div>
      )}
    </div>
  );
}
