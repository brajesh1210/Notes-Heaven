import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../ui/Spinner.jsx';

/** Only authenticated users get past this route */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children ?? <Outlet />;
};

/** Send already logged-in users from Login/Signup straight to the dashboard */
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader label="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children ?? <Outlet />;
};

export default ProtectedRoute;
