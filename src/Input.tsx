import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-[var(--ui-surface-hover)] px-3 py-2 text-sm text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
          error
            ? 'border-[var(--ui-error)] focus:border-[var(--ui-error)]'
            : 'border-[var(--ui-border)] focus:border-[var(--ui-primary)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[var(--ui-error)]">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg border bg-[var(--ui-surface-hover)] px-3 py-2 text-sm text-[var(--ui-text)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
          error
            ? 'border-[var(--ui-error)] focus:border-[var(--ui-error)]'
            : 'border-[var(--ui-border)] focus:border-[var(--ui-primary)]'
        } ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-[var(--ui-error)]">{error}</p>
      )}
    </div>
  );
}
