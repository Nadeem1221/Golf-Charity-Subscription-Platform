import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="public-layout">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">GolfCharity</Link>
        <div className="navbar-links">
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/charities">Charities</Link>
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/subscribe" className="btn-primary">Subscribe</Link>
            </>
          ) : (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'}>
                {isAdmin ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Golf Charity Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
