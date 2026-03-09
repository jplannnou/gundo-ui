import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ label, checked = false, indeterminate = false, onChange, disabled, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <span className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange?.(e.target.checked)}
          disabled={disabled}
          ref={el => {
            if (el) el.indeterminate = indeterminate;
          }}
          className="peer sr-only"
          {...props}
        />
        <span className={`flex items-center justify-center w-4 h-4 rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ui-focus-ring-color)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--ui-surface)] ${
          checked || indeterminate
            ? 'bg-[var(--ui-primary)] border-[var(--ui-primary)]'
            : 'border-[var(--ui-border)] bg-transparent peer-hover:border-[var(--ui-border-hover)]'
        }`}>
          {checked && !indeterminate && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 6l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {indeterminate && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 6h7" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>
      {label && (
        <span className="text-sm text-[var(--ui-text)]">{label}</span>
      )}
    </label>
  );
}
