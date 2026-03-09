import { useId, type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({ label, required, error, hint, children, className = '', htmlFor }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="block text-xs text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5"
      >
        {label}
        {required && <span className="text-[var(--ui-error)] ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[var(--ui-error)]" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-[var(--ui-text-muted)]">{hint}</p>
      )}
    </div>
  );
}
