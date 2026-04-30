type Size = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  /** Accessible label announced by screen readers. Defaults to "Loading". */
  label?: string;
  className?: string;
}

const sizeStyles: Record<Size, string> = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className={`animate-spin rounded-full border-[var(--ui-primary)] border-t-transparent ${sizeStyles[size]} ${className}`}
    />
  );
}
