import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Redirects to /login (preserving where the user was headed) if there's no
// logged-in user once the initial session check has finished. Renders
// nothing while that check is in flight, rather than redirecting
// prematurely on every page load.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}
