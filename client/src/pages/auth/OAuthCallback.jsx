import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * After Google OAuth the backend redirects here:
 *   /auth/callback?token=JWT
 * We store the token and load the user via /me.
 */
const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const token = params.get('token');

    (async () => {
      if (token) localStorage.setItem('nh_token', token);
      const user = await refresh();

      if (user) {
        toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Google sign-in could not be completed. Please try again.');
        navigate('/login?error=google_failed', { replace: true });
      }
    })();
  }, [params, refresh, navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <PageLoader label="Signing in with Google..." />
    </div>
  );
};

export default OAuthCallback;
