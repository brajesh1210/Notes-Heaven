import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';

/** Reusable dropdown for "..." menus (closes on outside click + ESC) */
const Menu = ({ trigger, children, align = 'right', className, menuClassName }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute z-50 mt-1.5 min-w-[190px] overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-pop animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

export const MenuItem = ({ icon: Icon, children, danger = false, className, ...props }) => (
  <button
    type="button"
    role="menuitem"
    className={cn(
      'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium transition',
      danger ? 'text-red-600 hover:bg-red-50' : 'text-ink hover:bg-slate-50',
      className
    )}
    {...props}
  >
    {Icon && <Icon size={15} className="shrink-0" />}
    {children}
  </button>
);

export const MenuDivider = () => <div className="my-1.5 h-px bg-line" />;

export const MenuLabel = ({ children }) => (
  <p className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{children}</p>
);

export default Menu;
