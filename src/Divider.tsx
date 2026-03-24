import { forwardRef, type HTMLAttributes } from 'react';

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  function Divider({ className = '', label, orientation = 'horizontal', ...rest }, ref) {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={`self-stretch w-px min-h-4 bg-[var(--ui-border)] ${className}`}
          role="separator"
          aria-orientation="vertical"
          {...rest}
        />
      );
    }

    if (label) {
      return (
        <div ref={ref} className={`flex items-center gap-3 ${className}`} role="separator" {...rest}>
          <div className="flex-1 h-px bg-[var(--ui-border)]" />
          <span className="text-xs text-[var(--ui-text-muted)] uppercase tracking-wider">{label}</span>
          <div className="flex-1 h-px bg-[var(--ui-border)]" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`h-px w-full bg-[var(--ui-border)] ${className}`}
        role="separator"
        aria-orientation="horizontal"
        {...rest}
      />
    );
  }
);
