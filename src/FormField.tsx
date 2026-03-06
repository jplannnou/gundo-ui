import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-[var(--ui-error)] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-[var(--ui-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--ui-text-muted)]">{hint}</p>
      )}
    </div>
  );
}
