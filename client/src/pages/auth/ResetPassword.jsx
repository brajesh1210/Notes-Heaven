import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { PasswordInput } from '../../components/ui/Input.jsx';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useAuth();

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/auth/verify-reset-token/${token}`)
      .then(({ data }) => {
        setValid(true);
        setEmail(data.email);
      })
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.password) errs.password = 'Naya password daalo';
    else if (form.password.length < 6) errs.password = 'Kam se kam 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Dono passwords match nahi kar rahe';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const { data, message } = await api.put(`/auth/reset-password/${token}`, { password: form.password });
      if (data.token) localStorage.setItem('nh_token', data.token);
      await refresh();
      toast.success(message || 'Password reset ho gaya');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <PageLoader label="Reset link verify kar rahe hain..." />
      </div>
    );
  }

  if (!valid) {
    return (
      <AuthLayout
        title="Link expired"
        subtitle="Ye reset link invalid ya expire ho gaya hai."
        footer={
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
            <ArrowLeft size={14} /> Back to login
          </Link>
        }
      >
        <div className="space-y-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <KeyRound size={24} />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted">Reset links sirf 30 minute ke liye valid hote hain. Naya link request karo.</p>
          <Button className="w-full" onClick={() => navigate('/forgot-password')}>
            Naya reset link bhejo
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle={email ? `Password reset kar rahe hain: ${email}` : 'Naya password daalo.'}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput
          label="New Password"
          name="password"
          autoFocus
          placeholder="Naya password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          hint="6+ characters, ek uppercase aur number rakho to aur strong hoga"
        />
        <PasswordInput
          label="Confirm Password"
          name="confirm"
          placeholder="Dobara wahi password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" loading={loading} className="w-full" icon={ShieldCheck}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
