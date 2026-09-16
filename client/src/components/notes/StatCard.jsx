import { cn } from '../../lib/utils.js';

/** Dashboard ke top 3 stat cards (Total Notes / Folders / Last Updated) */
const StatCard = ({ icon: Icon, label, value, tone = 'brand', hint }) => {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-medium text-ink-muted">{label}</p>
        <p className="truncate text-[19px] font-bold leading-tight text-ink">{value}</p>
        {hint && <p className="truncate text-[11.5px] text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
};

export default StatCard;
