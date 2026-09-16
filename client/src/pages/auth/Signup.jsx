import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout, { GoogleButton, OrDivider } from '../../components/auth/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, PasswordInput } from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';

const strengthOf = (pw = '') => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(true);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api
      .get('/auth/providers')
      .then(({ data }) => setGoogleEnabled(Boolean(data.enabled)))
      .catch(() => {});
  }, []);

  const strength = strengthOf(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
      if (err.status === 409) setErrors({ email: 'This email is already registered' });
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
      title="Create Your Account"
      subtitle="Start your journey to better learning."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          autoComplete="name"
          placeholder="Enter your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />

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

        <div>
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="w-12 text-right text-[11px] font-medium text-ink-muted">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full" icon={UserPlus}>
          {loading ? 'Creating your account...' : 'Sign Up'}
        </Button>
      </form>

      <OrDivider />

      <GoogleButton onClick={googleLogin} disabled={!googleEnabled} />
    </AuthLayout>
  );
};

export default Signup;
