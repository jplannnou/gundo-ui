import './ui-classes.css';
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
  default: 'gu-bg-surface-hover gu-text-text-secondary',
  success: 'gu-bg-success-soft gu-text-success',
  error: 'gu-bg-error-soft gu-text-error',
  warning: 'gu-bg-warning-soft gu-text-warning',
  info: 'gu-bg-info-soft gu-text-info',
  purple: 'gu-bg-tertiary-soft gu-text-tertiary',
  secondary: 'gu-bg-secondary-soft gu-text-secondary',
  destructive: 'gu-bg-error-soft gu-text-error',
  outline: 'bg-transparent border gu-border-border gu-text-text',
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
