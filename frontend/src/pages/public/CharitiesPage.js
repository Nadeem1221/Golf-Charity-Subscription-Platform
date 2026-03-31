import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'community', 'sports', 'other'];

export default function CharitiesPage() {
  const [charities, setCharities]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search)   params.set('search', search);
      if (category && category !== 'all') params.set('category', category);

      const { data } = await api.get(`/charities?${params}`);
      if (data.success) {
        setCharities(data.charities);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharities(); }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCharities();
  };

  return (
    <div className="page charities-page">
      <div className="page-header">
        <h1>Our Charities</h1>
        <p>Choose a cause that matters to you. A minimum of 10% of every subscription goes directly to your chosen charity.</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${category === (cat === 'all' ? '' : cat) ? 'active' : ''}`}
              onClick={() => { setCategory(cat === 'all' ? '' : cat); setPage(1); }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading charities...</div>
      ) : charities.length === 0 ? (
        <div className="empty-state">No charities found.</div>
      ) : (
        <div className="charity-grid">
          {charities.map((charity) => (
            <div key={charity._id} className="charity-card">
              {charity.isFeatured && <span className="badge badge-featured">Featured</span>}
              {charity.logo && (
                <img src={charity.logo} alt={charity.name} className="charity-logo" />
              )}
              <div className="charity-card-body">
                <span className="charity-category">{charity.category}</span>
                <h3>{charity.name}</h3>
                <p>{charity.shortDescription || charity.description?.slice(0, 120)}...</p>
                {charity.subscriberCount > 0 && (
                  <p className="charity-stat">{charity.subscriberCount} supporters</p>
                )}
              </div>
              <div className="charity-card-footer">
                <Link to={`/charities/${charity._id}`} className="btn-secondary">
                  View Charity
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary"
          >
            ← Previous
          </button>
          <span>Page {page} of {pagination.pages}</span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
