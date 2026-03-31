// ─── DrawsPage.js ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export function DrawsPage() {
  const [draws, setDraws]         = useState([]);
  const [participation, setParticipation] = useState({ winners: [], recentDraws: [] });
  const [myScores, setMyScores]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/draws'),
      api.get('/draws/my/participation'),
      api.get('/scores/my'),
    ]).then(([drawsRes, partRes, scoresRes]) => {
      if (drawsRes.data.success)  setDraws(drawsRes.data.draws);
      if (partRes.data.success)   setParticipation(partRes.data);
      if (scoresRes.data.success) setMyScores(scoresRes.data.scores);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading draws...</div>;

  const userScoreVals = myScores.map((s) => s.value);

  return (
    <div className="page draws-page">
      <h1>Draws</h1>

      {/* Upcoming draw */}
      <div className="card">
        <h2>My Current Scores (Draw Entries)</h2>
        {myScores.length === 0 ? (
          <p className="empty-hint">No scores logged yet. Add scores to participate in draws.</p>
        ) : (
          <div className="drawn-numbers">
            {myScores.map((s, i) => (
              <span key={i} className="drawn-ball user-ball">{s.value}</span>
            ))}
          </div>
        )}
        <p className="hint">These are the numbers that will be matched against the monthly draw.</p>
      </div>

      {/* Draw history */}
      <div className="card">
        <h2>Published Draws</h2>
        {draws.length === 0 ? (
          <p className="empty-hint">No draws published yet.</p>
        ) : (
          draws.map((draw) => {
            const matchCount = userScoreVals.filter((v) => draw.drawnNumbers.includes(v)).length;
            return (
              <div key={draw._id} className="draw-item">
                <div className="draw-item-header">
                  <h3>{draw.name}</h3>
                  <span className="badge badge-published">Published</span>
                </div>
                <div className="drawn-numbers">
                  {draw.drawnNumbers.map((n, i) => (
                    <span key={i} className={`drawn-ball ${userScoreVals.includes(n) ? 'matched' : ''}`}>{n}</span>
                  ))}
                </div>
                <p>
                  Prize pool: <strong>${(draw.totalPrizePool / 100).toFixed(2)}</strong> ·
                  Participants: <strong>{draw.participantCount}</strong> ·
                  Your matches: <strong>{matchCount}</strong>
                  {draw.jackpotRolledOver && <span className="badge badge-rollover ml-2">Jackpot Rolled Over</span>}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* My wins */}
      {participation.winners.length > 0 && (
        <div className="card">
          <h2>My Wins</h2>
          {participation.winners.map((w) => (
            <div key={w._id} className="winner-item">
              <strong>{w.draw?.name}</strong> — {w.matchType} —
              ${(w.prizeAmount / 100).toFixed(2)} —
              <span className={`badge badge-${w.verificationStatus}`}>{w.verificationStatus}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DrawsPage;
