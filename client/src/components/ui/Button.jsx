import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const SIZES = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };
const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  'danger-soft': 'btn-danger-soft',
};

/** The single button component used across the project - design's blue primary */
const Button = forwardRef(
  (
    { as: Tag = 'button', variant = 'primary', size = 'md', loading = false, icon: Icon, iconRight: IconRight, className, children, disabled, ...props },
    ref
  ) => (
    <Tag
      ref={ref}
      className={cn('btn', VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={16} /> : null}
    </Tag>
  )
);

Button.displayName = 'Button';
export default Button;

/** icon-only button (topbar, toolbars) */
export const IconButton = forwardRef(({ icon: Icon, label, className, size = 18, active = false, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition',
      'hover:bg-slate-100 hover:text-ink focus:outline-none focus-visible:shadow-focus',
      active && 'bg-brand-50 text-brand-700 hover:bg-brand-50 hover:text-brand-700',
      className
    )}
    {...props}
  >
    <Icon size={size} />
  </button>
));

IconButton.displayName = 'IconButton';
