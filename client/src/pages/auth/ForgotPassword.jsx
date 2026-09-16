import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck, Send, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email daalo');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Valid email daalo');

    setError('');
    setLoading(true);
    try {
      const { data, message } = await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      setDevLink(data.devResetUrl || '');
      toast.success(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={sent ? 'Check your email' : 'Forgot Password?'}
      subtitle={sent ? 'Reset link bhej diya gaya hai.' : 'Apna email daalo, hum reset link bhej denge.'}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MailCheck size={24} />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted">
            Agar <span className="font-semibold text-ink">{email}</span> registered hai, to wahan 30 minute valid reset link chala gaya
            hai. Inbox ke saath <span className="font-medium text-ink">Spam</span> folder bhi check karo.
          </p>

          {devLink && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
              <p className="text-[12px] font-semibold text-amber-800">DEV MODE - SMTP configured nahi hai</p>
              <p className="mt-1 text-[12px] leading-relaxed text-amber-800">Testing ke liye ye link direct use karo:</p>
              <button
                onClick={() => navigate(devLink.replace(window.location.origin, ''))}
                className="mt-1 block break-all text-left text-[12px] font-medium text-brand-700 underline"
              >
                {devLink}
              </button>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Dusra email try karo
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            autoFocus
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" size="lg" loading={loading} className="w-full" icon={Send}>
            Send reset link
          </Button>
          <p className="text-center text-[12.5px] text-ink-soft">
            Link 30 minute me expire ho jayega. Yaad aa gaya?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:underline">
              Login karo
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
