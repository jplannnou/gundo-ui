import './ui-classes.css';
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
          className={`self-stretch w-px min-h-4 gu-bg-border ${className}`}
          role="separator"
          aria-orientation="vertical"
          {...rest}
        />
      );
    }

    if (label) {
      return (
        <div ref={ref} className={`flex items-center gap-3 ${className}`} role="separator" {...rest}>
          <div className="flex-1 h-px gu-bg-border" />
          <span className="text-xs font-medium gu-text-text-secondary">{label}</span>
          <div className="flex-1 h-px gu-bg-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`h-px w-full gu-bg-border ${className}`}
        role="separator"
        aria-orientation="horizontal"
        {...rest}
      />
    );
  }
);
