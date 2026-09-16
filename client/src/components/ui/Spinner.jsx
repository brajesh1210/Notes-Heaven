import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const Spinner = ({ size = 18, className }) => <Loader2 size={size} className={cn('animate-spin text-brand-700', className)} />;

/** page-level loader */
export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-ink-muted">
    <Spinner size={26} />
    <p className="text-sm">{label}</p>
  </div>
);

/** list skeleton - shown while notes load */
export const SkeletonList = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card flex items-center gap-4 p-4">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid gap-3 sm:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="card h-[74px] animate-pulse bg-slate-50" />
    ))}
  </div>
);

export default Spinner;
