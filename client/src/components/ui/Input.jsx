import { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const Field = ({ label, htmlFor, error, hint, required, children }) => (
  <div className="w-full">
    {label && (
      <label htmlFor={htmlFor} className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="field-error">
        <AlertCircle size={13} /> {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>
    ) : null}
  </div>
);

export const Input = forwardRef(({ label, error, hint, required, className, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <input ref={ref} id={inputId} className={cn('input', error && 'input-error', className)} {...props} />
    </Field>
  );
});
Input.displayName = 'Input';

export const PasswordInput = forwardRef(({ label, error, hint, required, className, id, ...props }, ref) => {
  const [show, setShow] = useState(false);
  const inputId = id || props.name;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={show ? 'text' : 'password'}
          className={cn('input pr-11', error && 'input-error', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-soft transition hover:bg-slate-100 hover:text-ink"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const Textarea = forwardRef(({ label, error, hint, required, className, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <textarea ref={ref} id={inputId} className={cn('input min-h-[110px] resize-y', error && 'input-error', className)} {...props} />
    </Field>
  );
});
Textarea.displayName = 'Textarea';

export const Checkbox = ({ label, checked, onChange, className, id, ...props }) => (
  <label htmlFor={id} className={cn('inline-flex select-none items-center gap-2 text-sm text-ink-muted', className)}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-line text-brand-700 accent-brand-700 focus:ring-brand-500"
      {...props}
    />
    {label}
  </label>
);

export default Input;
