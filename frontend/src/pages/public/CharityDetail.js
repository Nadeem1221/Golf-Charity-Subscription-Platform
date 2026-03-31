// ─── CharityDetail.js ─────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export function CharityDetail() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/charities/${id}`).then(({ data }) => {
      if (data.success) setCharity(data.charity);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!charity) return <div className="error-state">Charity not found.</div>;

  return (
    <div className="page charity-detail-page">
      <Link to="/charities" className="back-link">← Back to Charities</Link>
      {charity.isFeatured && <span className="badge badge-featured">Featured Charity</span>}

      <div className="charity-hero">
        {charity.logo && <img src={charity.logo} alt={charity.name} className="charity-logo-lg" />}
        <div>
          <span className="charity-category">{charity.category}</span>
          <h1>{charity.name}</h1>
          {charity.website && (
            <a href={charity.website} target="_blank" rel="noopener noreferrer" className="btn-link">
              Visit Website →
            </a>
          )}
        </div>
      </div>

      <div className="charity-body">
        <div className="charity-description">
          <h2>About</h2>
          <p>{charity.description}</p>
          <div className="charity-stats-row">
            <div className="stat"><strong>{charity.subscriberCount}</strong><span>supporters</span></div>
            <div className="stat"><strong>${(charity.totalDonated / 100).toFixed(0)}</strong><span>donated</span></div>
          </div>
        </div>

        {charity.images?.length > 0 && (
          <div className="charity-images">
            {charity.images.map((img, i) => (
              <img key={i} src={img} alt={`${charity.name} ${i + 1}`} />
            ))}
          </div>
        )}

        {charity.events?.length > 0 && (
          <div className="charity-events">
            <h2>Upcoming Events</h2>
            {charity.events.map((ev, i) => (
              <div key={i} className="event-card">
                <h3>{ev.title}</h3>
                <p className="event-date">{new Date(ev.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {ev.location && <p className="event-location">📍 {ev.location}</p>}
                {ev.description && <p>{ev.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="charity-cta">
        <h2>Support {charity.name}</h2>
        <p>Subscribe to the platform and choose this charity — a minimum of 10% of your subscription goes directly to them.</p>
        <Link to={`/register`} className="btn-primary btn-lg">Subscribe & Support</Link>
      </div>
    </div>
  );
}

export default CharityDetail;
