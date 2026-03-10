type StatusDotStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusDotProps {
  status?: StatusDotStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  className?: string;
}

const statusColors: Record<StatusDotStatus, string> = {
  success: 'bg-[var(--ui-success)]',
  warning: 'bg-[var(--ui-warning)]',
  error: 'bg-[var(--ui-error)]',
  info: 'bg-[var(--ui-info)]',
  neutral: 'bg-[var(--ui-text-muted)]',
};

const sizeClasses: Record<string, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function StatusDot({
  status = 'neutral',
  size = 'md',
  pulse = false,
  label,
  className = '',
}: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="status" aria-label={label || status}>
      <span className={`${sizeClasses[size]} rounded-full ${statusColors[status]} ${pulse ? 'animate-pulse' : ''}`} />
      {label && <span className="text-xs text-[var(--ui-text-secondary)]">{label}</span>}
    </span>
  );
}
