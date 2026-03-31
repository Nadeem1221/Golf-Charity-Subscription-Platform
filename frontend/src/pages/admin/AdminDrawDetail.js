import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDrawDetail() {
  const { id } = useParams();
  const [draw, setDraw]           = useState(null);
  const [simResults, setSimResults] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const fetchDraw = async () => {
    try {
      const { data } = await api.get(`/draws/${id}`);
      if (data.success) {
        setDraw(data.draw);
        if (data.draw.simulationResults) setSimResults(data.draw.simulationResults);
      }
    } catch {
      setError('Failed to load draw');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDraw(); }, [id]);

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    try {
      const { data } = await api.post(`/draws/admin/${id}/simulate`);
      setDraw(data.draw);
      setSimResults(data.simulationResults);
      setSuccess('Simulation complete. Review results before publishing.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish this draw? This action cannot be undone.')) return;
    setPublishing(true);
    setError('');
    try {
      const { data } = await api.post(`/draws/admin/${id}/publish`);
      setDraw(data.draw);
      setSuccess('Draw published! Winners have been created and emails sent.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleDrawTypeUpdate = async (drawType) => {
    try {
      const { data } = await api.put(`/draws/admin/${id}`, { drawType });
      setDraw(data.draw);
    } catch {
      setError('Failed to update draw type');
    }
  };

  if (loading) return <div className="loading">Loading draw...</div>;
  if (!draw)   return <div className="error-state">Draw not found</div>;

  return (
    <div className="page admin-draw-detail">
      <Link to="/admin/draws" className="back-link">← Back to Draws</Link>
      <div className="page-header-row">
        <h1>{draw.name}</h1>
        <span className={`badge badge-${draw.status} badge-lg`}>{draw.status}</span>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Draw info */}
      <div className="card">
        <h2>Draw Configuration</h2>
        <div className="detail-grid">
          <div><strong>Prize Pool</strong><p>${(draw.totalPrizePool / 100).toFixed(2)}</p></div>
          <div><strong>Jackpot (40%)</strong><p>${(draw.jackpotPool / 100).toFixed(2)}</p></div>
          <div><strong>4-Match (35%)</strong><p>${(draw.fourMatchPool / 100).toFixed(2)}</p></div>
          <div><strong>3-Match (25%)</strong><p>${(draw.threeMatchPool / 100).toFixed(2)}</p></div>
          <div><strong>Rollover Amount</strong><p>${(draw.rolloverAmount / 100).toFixed(2)}</p></div>
          <div><strong>Active Subscribers</strong><p>{draw.activeSubscriberCount}</p></div>
        </div>

        {draw.status !== 'published' && (
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Draw Type</label>
            <select
              value={draw.drawType}
              onChange={(e) => handleDrawTypeUpdate(e.target.value)}
            >
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (weighted by score frequency)</option>
            </select>
          </div>
        )}
      </div>

      {/* Simulation */}
      {draw.status !== 'published' && (
        <div className="card">
          <h2>Run Simulation</h2>
          <p>Generate drawn numbers and preview results before publishing. You can simulate multiple times.</p>
          <button className="btn-primary" onClick={handleSimulate} disabled={simulating}>
            {simulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      )}

      {/* Simulation results */}
      {simResults && (
        <div className="card card-highlight">
          <h2>Simulation Results</h2>
          <div className="drawn-numbers large">
            {simResults.drawnNumbers?.map((n, i) => (
              <span key={i} className="drawn-ball drawn-ball-lg">{n}</span>
            ))}
          </div>
          <div className="sim-stats">
            <div className="sim-stat">
              <strong>{simResults.fiveMatchCount}</strong>
              <span>5-match winners · ${(simResults.jackpotPerWinner / 100).toFixed(2)} each</span>
            </div>
            <div className="sim-stat">
              <strong>{simResults.fourMatchCount}</strong>
              <span>4-match winners · ${(simResults.fourMatchPerWinner / 100).toFixed(2)} each</span>
            </div>
            <div className="sim-stat">
              <strong>{simResults.threeMatchCount}</strong>
              <span>3-match winners · ${(simResults.threeMatchPerWinner / 100).toFixed(2)} each</span>
            </div>
            <div className="sim-stat">
              <strong>{simResults.participantCount}</strong>
              <span>participants</span>
            </div>
          </div>
          {simResults.fiveMatchCount === 0 && (
            <div className="alert alert-info">No 5-match winners — jackpot will roll over to next month.</div>
          )}

          {draw.status === 'simulated' && (
            <button
              className="btn-primary btn-lg"
              onClick={handlePublish}
              disabled={publishing}
              style={{ marginTop: '1rem' }}
            >
              {publishing ? 'Publishing...' : '🚀 Publish Draw Results'}
            </button>
          )}
        </div>
      )}

      {/* Published results */}
      {draw.status === 'published' && (
        <div className="card">
          <h2>Published Results</h2>
          <p>Published: {new Date(draw.publishedAt).toLocaleString('en-US')}</p>
          <div className="drawn-numbers large">
            {draw.drawnNumbers?.map((n, i) => (
              <span key={i} className="drawn-ball drawn-ball-lg">{n}</span>
            ))}
          </div>
          <div className="sim-stats">
            <div><strong>{draw.fiveMatchWinners?.length}</strong><span> 5-match winners</span></div>
            <div><strong>{draw.fourMatchWinners?.length}</strong><span> 4-match winners</span></div>
            <div><strong>{draw.threeMatchWinners?.length}</strong><span> 3-match winners</span></div>
          </div>
          {draw.jackpotRolledOver && (
            <div className="alert alert-info">Jackpot rolled over to next month.</div>
          )}
        </div>
      )}
    </div>
  );
}
