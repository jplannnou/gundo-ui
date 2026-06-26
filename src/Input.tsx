import './ui-classes.css';
import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium gu-text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border gu-bg-surface-hover px-3 py-2 text-base gu-text-text outline-none transition-colors placeholder:text-[var(--ui-text-muted)] focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${
          error
            ? 'gu-border-error gu-f-border-error'
            : 'gu-border-border gu-f-border-primary'
        } ${className}`}
        style={{
          color: 'var(--ui-text, #F2F4F3)',
          backgroundColor: 'var(--ui-surface-hover, rgba(255,255,255,0.07))',
          borderColor: error ? 'var(--ui-error, #ef4444)' : 'var(--ui-border, rgba(255,255,255,0.1))',
          ...props.style,
        }}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs gu-text-error">
          {error}
        </p>
      )}
    </div>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium gu-text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border gu-bg-surface-hover px-3 py-2 text-base gu-text-text outline-none transition-colors focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${
          error
            ? 'gu-border-error gu-f-border-error'
            : 'gu-border-border gu-f-border-primary'
        } ${className}`}
        style={{
          color: 'var(--ui-text, #F2F4F3)',
          backgroundColor: 'var(--ui-surface-hover, rgba(255,255,255,0.07))',
          borderColor: error ? 'var(--ui-error, #ef4444)' : 'var(--ui-border, rgba(255,255,255,0.1))',
          ...props.style,
        }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs gu-text-error">
          {error}
        </p>
      )}
    </div>
  );
}
