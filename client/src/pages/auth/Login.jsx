import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout, { GoogleButton, OrDivider } from '../../components/auth/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, PasswordInput, Checkbox } from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (new URLSearchParams(location.search).get('error') === 'google_failed') {
      toast.error('Google login fail ho gaya. Dobara try karo ya email se login karo.');
    }
    api
      .get('/auth/providers')
      .then(({ data }) => setGoogleEnabled(Boolean(data.enabled)))
      .catch(() => {});
  }, [location.search, toast]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email daalo';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email daalo';
    if (!form.password) errs.password = 'Password daalo';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login({ ...form, remember });
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
      if (err.status === 401) setErrors({ password: 'Email ya password galat hai' });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to continue your journey."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
            Sign Up
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgot-password" className="text-[13px] font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full" icon={LogIn}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <OrDivider />

      <GoogleButton onClick={googleLogin} disabled={!googleEnabled} />
      {!googleEnabled && (
        <p className="mt-2 text-center text-[11.5px] text-ink-soft">Google login off hai - backend .env me GOOGLE_CLIENT_ID/SECRET daalo.</p>
      )}
    </AuthLayout>
  );
};

export default Login;
