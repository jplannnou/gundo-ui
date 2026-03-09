import type { ReactNode } from 'react';

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  error: 'border-[var(--ui-error)] bg-[var(--ui-error-soft)] text-[var(--ui-error)]',
  warning: 'border-[var(--ui-warning)] bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
  info: 'border-[var(--ui-info)] bg-[var(--ui-info-soft)] text-[var(--ui-info)]',
  success: 'border-[var(--ui-success)] bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
};

export function AlertBanner({ type = 'info', title, children, onDismiss, className = '' }: AlertBannerProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${typeStyles[type]} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {title && <p className="font-medium mb-1">{title}</p>}
          <div>{children}</div>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
