import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Logo from '../components/brand/Logo.jsx';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <Logo size="lg" />

      <span className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass size={28} />
      </span>

      <h1 className="mt-5 text-[28px] font-bold tracking-[-0.02em] text-ink">404 - Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">This page does not exist or has been moved. Let's head back to your dashboard.</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button icon={ArrowLeft} onClick={() => navigate(-1)} variant="outline">
          Go back
        </Button>
        <Button as={Link} to="/dashboard">
          Open Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
