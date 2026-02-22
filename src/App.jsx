import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Portals from './pages/Portals';
import Students from './pages/Students';
import Groups from './pages/Groups';
import PortalSettings from './pages/PortalSettings';
import Appearance from './pages/Appearance';
import Questions from './pages/Questions';
import PortalView from './pages/PortalView';
import PortalDirectory from './pages/PortalDirectory';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-paper/50 font-syne text-lg animate-pulse">Loading…</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p/:slug" element={<PortalView />} />
      <Route path="/portals" element={<PortalDirectory />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="portals" element={<Portals />} />
        <Route path="students/:portalId?" element={<Students />} />
        <Route path="groups/:portalId?" element={<Groups />} />
        <Route path="settings/:portalId?" element={<PortalSettings />} />
        <Route path="appearance/:portalId?" element={<Appearance />} />
        <Route path="questions/:portalId?" element={<Questions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
