import './ui-classes.css';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  error: 'gu-border-error gu-bg-error-soft gu-text-error',
  warning: 'gu-border-warning gu-bg-warning-soft gu-text-warning',
  info: 'gu-border-info gu-bg-info-soft gu-text-info',
  success: 'gu-border-success gu-bg-success-soft gu-text-success',
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
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
