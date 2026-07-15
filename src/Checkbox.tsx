import './ui-classes.css';
import type { InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';

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
        {/* Unchecked: --ui-border (white/10%) is ~1.3:1 on the dark surface — a
            16px unfilled box was effectively invisible. --ui-text-muted clears
            WCAG 1.4.11 (3.5:1 dark / 4.1:1 light) and the soft fill makes it
            read as a control, matching Input's filled treatment. */}
        <span className={`flex items-center justify-center w-4 h-4 rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ui-focus-ring-color)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--ui-surface)] ${
          checked || indeterminate
            ? 'gu-bg-primary gu-border-primary'
            : 'gu-border-text-muted gu-bg-surface-hover peer-hover:border-[var(--ui-text-secondary)]'
        }`}>
          {checked && !indeterminate && (
            <Check className="w-3 h-3 text-white" strokeWidth={2.5} aria-hidden="true" />
          )}
          {indeterminate && (
            <Minus className="w-3 h-3 text-white" strokeWidth={2.5} aria-hidden="true" />
          )}
        </span>
      </span>
      {label && (
        <span className="text-sm gu-text-text">{label}</span>
      )}
    </label>
  );
}
