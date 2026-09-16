import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Google OAuth ke baad backend yahan redirect karta hai:
 *   /auth/callback?token=JWT
 * Token localStorage me daal kar /me se user load kar lete hain.
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
        toast.success(`Welcome, ${user.name.split(' ')[0]}! 🎉`);
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Google login complete nahi ho paya. Dobara try karo.');
        navigate('/login?error=google_failed', { replace: true });
      }
    })();
  }, [params, refresh, navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <PageLoader label="Google se login ho raha hai..." />
    </div>
  );
};

export default OAuthCallback;
