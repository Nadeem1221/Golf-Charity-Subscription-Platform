import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';

export default function WinningsPage() {
  const [winners, setWinners]     = useState([]);
  const [totalWon, setTotalWon]   = useState(0);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const fileRefs = useRef({});

  const fetchWinnings = async () => {
    try {
      const { data } = await api.get('/winners/my');
      if (data.success) { setWinners(data.winners); setTotalWon(data.totalWon); }
    } catch { setError('Failed to load winnings'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchWinnings(); }, []);

  const handleUpload = async (winnerId) => {
    const file = fileRefs.current[winnerId]?.files[0];
    if (!file) { setError('Please select a screenshot file'); return; }
    const formData = new FormData();
    formData.append('proof', file);
    setUploading(winnerId); setError('');
    try {
      await api.post(`/winners/${winnerId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Proof uploaded! An admin will review your submission.');
      await fetchWinnings();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(null); }
  };

  if (loading) return <div className="loading">Loading winnings...</div>;

  const statusLabel = { pending:'Pending Review', approved:'Approved ✓', rejected:'Rejected' };

  return (
    <div className="page winnings-page">
      <h1>My Winnings</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card stat-card-highlight">
          <h3>Total Won (Paid)</h3>
          <p className="stat-value" style={{color:'var(--gold400)'}}>${(totalWon/100).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Prizes</h3>
          <p className="stat-value">{winners.filter(w => w.paymentStatus === 'pending').length}</p>
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="card">
          <div className="trophy-empty">
            <span className="trophy-icon">🏆</span>
            <h2>No winnings yet</h2>
            <p>Participate in monthly draws by keeping your scores up to date. Good luck!</p>
            <div className="trophy-tips">
              <h4>How to win</h4>
              <ul>
                <li>Keep all 5 score slots filled for maximum draw coverage</li>
                <li>Enter scores after every round to stay current</li>
                <li>Match 3, 4, or all 5 drawn numbers to win a prize tier</li>
                <li>Jackpot rolls over if unclaimed — it keeps growing!</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>Prize History</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Draw</th><th>Match</th><th>Prize</th>
                <th>Verification</th><th>Payment</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => (
                <tr key={w._id}>
                  <td>{w.draw?.name || 'N/A'}</td>
                  <td><span className={`badge badge-${w.matchType === '5-match' ? 'gold' : w.matchType === '4-match' ? 'silver' : 'bronze'}`}>{w.matchType}</span></td>
                  <td><strong style={{color:'var(--gold400)'}}>${(w.prizeAmount/100).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge badge-${w.verificationStatus}`}>{statusLabel[w.verificationStatus]}</span>
                    {w.adminNote && <p className="admin-note">{w.adminNote}</p>}
                  </td>
                  <td>
                    <span className={`badge badge-${w.paymentStatus}`}>
                      {w.paymentStatus === 'paid' ? `Paid ${new Date(w.paidAt).toLocaleDateString('en-US')}` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {w.verificationStatus !== 'approved' && w.paymentStatus !== 'paid' ? (
                      <div className="proof-upload">
                        <input type="file" accept="image/*" ref={el => (fileRefs.current[w._id] = el)} id={`proof-${w._id}`} />
                        <label htmlFor={`proof-${w._id}`} className="btn-sm btn-secondary">
                          {w.proofScreenshot ? 'Replace' : 'Upload Screenshot'}
                        </label>
                        <button className="btn-sm btn-primary" onClick={() => handleUpload(w._id)} disabled={uploading === w._id}>
                          {uploading === w._id ? '...' : 'Submit'}
                        </button>
                        {w.proofScreenshot && <span className="proof-uploaded">✓ Uploaded</span>}
                      </div>
                    ) : (
                      <span className="no-action text-sm">—</span>
                    )}
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
