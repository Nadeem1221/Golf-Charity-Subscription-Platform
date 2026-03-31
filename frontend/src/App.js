import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage        from './pages/public/HomePage';
import CharitiesPage   from './pages/public/CharitiesPage';
import CharityDetail  from './pages/public/CharityDetail';
import HowItWorks     from './pages/public/HowItWorks';
import SubscribePage  from './pages/public/SubscribePage';

// Auth pages
import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardHome     from './pages/dashboard/DashboardHome';
import ScoresPage        from './pages/dashboard/ScoresPage';
import DrawsPage         from './pages/dashboard/DrawsPage';
import WinningsPage      from './pages/dashboard/WinningsPage';
import ProfilePage       from './pages/dashboard/ProfilePage';
import SubscriptionPage  from './pages/dashboard/SubscriptionPage';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminUserDetail   from './pages/admin/AdminUserDetail';
import AdminDraws        from './pages/admin/AdminDraws';
import AdminDrawDetail   from './pages/admin/AdminDrawDetail';
import AdminCharities    from './pages/admin/AdminCharities';
import AdminWinners      from './pages/admin/AdminWinners';

// Layout wrappers
import PublicLayout    from './components/common/PublicLayout';
import DashboardLayout from './components/common/DashboardLayout';
import AdminLayout     from './components/common/AdminLayout';

// ─── Route guards ─────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/charities"  element={<CharitiesPage />} />
        <Route path="/charities/:id" element={<CharityDetail />} />
        <Route path="/how-it-works"  element={<HowItWorks />} />
        <Route path="/subscribe"     element={<SubscribePage />} />
      </Route>

      {/* ── Auth ───────────────────────────────────── */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* ── User Dashboard ─────────────────────────── */}
      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard"              element={<DashboardHome />} />
        <Route path="/dashboard/scores"       element={<ScoresPage />} />
        <Route path="/dashboard/draws"        element={<DrawsPage />} />
        <Route path="/dashboard/winnings"     element={<WinningsPage />} />
        <Route path="/dashboard/profile"      element={<ProfilePage />} />
        <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
      </Route>

      {/* ── Admin ──────────────────────────────────── */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin"                  element={<AdminDashboard />} />
        <Route path="/admin/users"            element={<AdminUsers />} />
        <Route path="/admin/users/:id"        element={<AdminUserDetail />} />
        <Route path="/admin/draws"            element={<AdminDraws />} />
        <Route path="/admin/draws/:id"        element={<AdminDrawDetail />} />
        <Route path="/admin/charities"        element={<AdminCharities />} />
        <Route path="/admin/winners"          element={<AdminWinners />} />
      </Route>

      {/* ── Fallback ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
