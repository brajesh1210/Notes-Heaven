import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../ui/Spinner.jsx';

/** Login ke baad hi andar aane do */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Session check kar rahe hain..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children ?? <Outlet />;
};

/** Login/Signup page par pehle se logged-in user ko dashboard bhej do */
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader label="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children ?? <Outlet />;
};

export default ProtectedRoute;
