import type { ReactNode } from 'react';

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  type?: AlertType;
  children: ReactNode;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  error: 'border-[var(--ui-error)] bg-[var(--ui-error-soft)] text-[var(--ui-error)]',
  warning: 'border-[var(--ui-warning)] bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
  info: 'border-[var(--ui-info)] bg-[var(--ui-info-soft)] text-[var(--ui-info)]',
  success: 'border-[var(--ui-success)] bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
};

export function AlertBanner({ type = 'info', children, className = '' }: AlertBannerProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${typeStyles[type]} ${className}`}>
      {children}
    </div>
  );
}
