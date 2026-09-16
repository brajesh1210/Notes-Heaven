import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils.js';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-slate-200 bg-white text-ink',
};

const ICON_STYLES = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-brand-600',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type = 'success', duration = 3200) => {
      if (!message) return;
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      if (duration) setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (m, d) => push(m, 'success', d),
      error: (m, d) => push(m, 'error', d),
      info: (m, d) => push(m, 'info', d),
      dismiss: remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* toasts - top on mobile, bottom-right on desktop */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-5 sm:top-auto sm:bottom-5 sm:items-end">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-pop animate-fade-in',
                STYLES[t.type]
              )}
            >
              <Icon size={18} className={cn('mt-0.5 shrink-0', ICON_STYLES[t.type])} />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button onClick={() => remove(t.id)} className="rounded p-0.5 opacity-60 transition hover:opacity-100" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
