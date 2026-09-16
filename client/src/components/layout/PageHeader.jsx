import { cn } from '../../lib/utils.js';

/** Top heading + right-side actions for every page */
const PageHeader = ({ title, subtitle, actions, className, compact = false }) => (
  <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', compact ? 'mb-4' : 'mb-6', className)}>
    <div className="min-w-0">
      <h1 className="truncate text-[22px] font-bold tracking-[-0.01em] text-ink sm:text-[26px]">{title}</h1>
      {subtitle && <p className="mt-1 text-[13.5px] text-ink-muted">{subtitle}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
