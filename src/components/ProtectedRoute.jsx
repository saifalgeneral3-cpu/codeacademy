import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from './PageLoader.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (admin) {
    if (profile == null) return <PageLoader />;
    if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />;
  }

  return children;
}
