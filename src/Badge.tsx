import type { ReactNode, HTMLAttributes } from 'react';

type Variant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'purple' | 'secondary' | 'destructive' | 'outline';
type Size = 'sm' | 'md';

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  icon?: ReactNode;
  dot?: boolean;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]',
  success: 'bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
  error: 'bg-[var(--ui-error-soft)] text-[var(--ui-error)]',
  warning: 'bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
  info: 'bg-[var(--ui-info-soft)] text-[var(--ui-info)]',
  purple: 'bg-[var(--ui-tertiary-soft)] text-[var(--ui-tertiary)]',
  secondary: 'bg-[var(--ui-secondary-soft)] text-[var(--ui-secondary)]',
  destructive: 'bg-[var(--ui-error-soft)] text-[var(--ui-error)]',
  outline: 'bg-transparent border border-[var(--ui-border)] text-[var(--ui-text)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', icon, dot, className = '', ...rest }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...rest}>
      {dot && <span className={`inline-block w-1.5 h-1.5 rounded-full bg-current`} />}
      {icon && <span className="shrink-0 w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}
