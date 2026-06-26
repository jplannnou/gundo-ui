import './ui-classes.css';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium gu-text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border gu-bg-surface-hover px-3 py-2 text-base gu-text-text outline-none transition-colors placeholder:text-[var(--ui-text-muted)] resize-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${
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
        <p className="mt-1 text-xs gu-text-error">{error}</p>
      )}
    </div>
  );
}
