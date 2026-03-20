import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border bg-[var(--ui-surface-hover)] px-3 py-2 text-base text-[var(--ui-text)] outline-none transition-colors placeholder:text-[var(--ui-text-muted)] resize-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
          error
            ? 'border-[var(--ui-error)] focus:border-[var(--ui-error)]'
            : 'border-[var(--ui-border)] focus:border-[var(--ui-primary)]'
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
        <p className="mt-1 text-xs text-[var(--ui-error)]">{error}</p>
      )}
    </div>
  );
}
