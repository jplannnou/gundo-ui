import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--ui-primary)] text-[var(--ui-surface)] hover:bg-[var(--ui-primary-hover)]',
  secondary:
    'border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] text-[var(--ui-text)] hover:bg-[var(--ui-border)]',
  danger:
    'bg-[var(--ui-error)] text-white hover:opacity-90',
  ghost:
    'text-[var(--ui-text-secondary)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0 w-4 h-4">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0 w-4 h-4">{icon}</span>}
        </>
      )}
    </button>
  );
}
