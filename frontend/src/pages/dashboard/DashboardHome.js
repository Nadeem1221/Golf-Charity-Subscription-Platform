import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// Animated count-up hook
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

export default function DashboardHome() {
  const { user, isSubscribed } = useAuth();
  const [searchParams] = useSearchParams();
  const [scores, setScores]         = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);
  const [winnings, setWinnings]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const subscriptionSuccess = searchParams.get('subscription') === 'success';

  useEffect(() => {
    if (!isSubscribed) { setLoading(false); return; }
    Promise.all([
      api.get('/scores/my'),
      api.get('/draws/latest'),
      api.get('/winners/my'),
    ]).then(([sRes, dRes, wRes]) => {
      if (sRes.data.success) setScores(sRes.data.scores);
      if (dRes.data.success) setLatestDraw(dRes.data.draw);
      if (wRes.data.success) setWinnings(wRes.data.winners);
    }).finally(() => setLoading(false));
  }, [isSubscribed]);

  const totalWon = winnings.filter(w => w.paymentStatus === 'paid').reduce((s,w) => s + w.prizeAmount, 0);
  const pendingCount = winnings.filter(w => w.paymentStatus === 'pending' && w.verificationStatus !== 'rejected').length;
  const sub = user?.subscription;

  const animatedWon = useCountUp(totalWon / 100, 1000);
  const animatedScores = useCountUp(scores.length, 600);

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard-home">

      {subscriptionSuccess && (
        <div className="alert alert-success">🎉 Subscription activated! You're now entered in the next monthly draw.</div>
      )}

      {/* Welcome banner */}
      <div className="welcome-banner">
        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p>{isSubscribed
          ? `Your ${sub?.plan} subscription is active · Renews ${sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-US') : 'N/A'}`
          : 'Subscribe to start participating in monthly prize draws'
        }</p>
      </div>

      {/* No subscription */}
      {!isSubscribed && (
        <div className="subscription-prompt">
          <h2>No Active Subscription</h2>
          <p>Subscribe to log scores, enter monthly draws, and support your chosen charity.</p>
          <Link to="/subscribe" className="btn-primary btn-lg">Subscribe Now →</Link>
        </div>
      )}

      {isSubscribed && (
        <>
          {/* Stats grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-highlight">
              <h3>Subscription</h3>
              <p className="stat-value stat-active">Active</p>
              <p className="stat-sub">{sub?.plan} plan</p>
              <Link to="/dashboard/subscription" className="btn-link" style={{marginTop:'.5rem'}}>Manage →</Link>
            </div>
            <div className="stat-card">
              <h3>Scores Entered</h3>
              <p className="stat-value">{animatedScores}<span style={{fontSize:'1.1rem',color:'var(--txtM)'}}>/5</span></p>
              <p className="stat-sub">Stableford scores</p>
              <Link to="/dashboard/scores" className="btn-link" style={{marginTop:'.5rem'}}>Manage →</Link>
            </div>
            <div className="stat-card">
              <h3>Total Won</h3>
              <p className="stat-value" style={{color:'var(--gold400)'}}>${animatedWon.toFixed(2)}</p>
              <p className="stat-sub">{pendingCount} pending</p>
              <Link to="/dashboard/winnings" className="btn-link" style={{marginTop:'.5rem'}}>View →</Link>
            </div>
            <div className="stat-card">
              <h3>Charity</h3>
              <p className="stat-value" style={{fontSize:'1.5rem'}}>{user?.charityContributionPercent || 10}%</p>
              <p className="stat-sub">{user?.selectedCharity?.name || 'Not selected'}</p>
              <Link to="/dashboard/profile" className="btn-link" style={{marginTop:'.5rem'}}>Update →</Link>
            </div>
          </div>

          {/* Scores preview */}
          <div className="card dashboard-section">
            <div className="section-header">
              <h2>My Scores</h2>
              <Link to="/dashboard/scores" className="btn-link">Manage scores →</Link>
            </div>
            {scores.length === 0 ? (
              <p className="empty-hint">No scores yet. <Link to="/dashboard/scores" style={{color:'var(--gold400)'}}>Add your first round →</Link></p>
            ) : (
              <>
                <div className="scores-preview">
                  {scores.map((s, i) => (
                    <div key={i} className="score-chip" style={{animationDelay:`${i*0.06}s`}}>
                      <span className="score-val">{s.value}</span>
                      <span className="score-date">{new Date(s.date).toLocaleDateString('en-US')}</span>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({length: 5 - scores.length}).map((_, i) => (
                    <div key={`empty-${i}`} className="score-chip" style={{opacity:.3, animationDelay:`${(scores.length+i)*0.06}s`}}>
                      <span className="score-val">—</span>
                      <span className="score-date">empty</span>
                    </div>
                  ))}
                </div>
                <p className="hint" style={{marginTop:'.75rem'}}>{scores.length}/5 scores stored · Adding a 6th automatically replaces the oldest</p>
              </>
            )}
          </div>

          {/* Latest draw */}
          {latestDraw && (
            <div className="card dashboard-section">
              <div className="section-header">
                <h2>{latestDraw.name}</h2>
                <Link to="/dashboard/draws" className="btn-link">All draws →</Link>
              </div>
              <p className="hint" style={{marginBottom:'.75rem'}}>Drawn numbers — your matches are highlighted in gold</p>
              <div className="drawn-numbers">
                {latestDraw.drawnNumbers.map((n, i) => {
                  const matched = scores.some(s => s.value === n);
                  return <span key={i} className={`drawn-ball ${matched ? 'matched' : ''}`}>{n}</span>;
                })}
              </div>
              <p className="match-hint">
                {scores.filter(s => latestDraw.drawnNumbers.includes(s.value)).length} of your scores matched this draw
                {latestDraw.jackpotRolledOver && <span className="badge badge-rollover" style={{marginLeft:'.5rem'}}>Jackpot Rolled Over</span>}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
