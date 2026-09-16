import { cn } from '../../lib/utils.js';

/** Khaali state - koi note/result na mile to */
const EmptyState = ({ icon: Icon, title, description, action, className, compact = false }) => (
  <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-10' : 'py-16', className)}>
    {Icon && (
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon size={24} />
      </span>
    )}
    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
