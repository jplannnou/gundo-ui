import type { ReactNode } from 'react';

type CalloutVariant = 'info' | 'warning' | 'error' | 'success' | 'tip';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border-[var(--ui-info)] bg-[var(--ui-info-soft)]',
  warning: 'border-[var(--ui-warning)] bg-[var(--ui-warning-soft)]',
  error: 'border-[var(--ui-error)] bg-[var(--ui-error-soft)]',
  success: 'border-[var(--ui-success)] bg-[var(--ui-success-soft)]',
  tip: 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]',
};

const variantIconColor: Record<CalloutVariant, string> = {
  info: 'var(--ui-info)',
  warning: 'var(--ui-warning)',
  error: 'var(--ui-error)',
  success: 'var(--ui-success)',
  tip: 'var(--ui-primary)',
};

function DefaultIcon({ variant }: { variant: CalloutVariant }) {
  const color = variantIconColor[variant];
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };

  switch (variant) {
    case 'info':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    case 'warning':
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case 'error':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
    case 'success':
      return <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case 'tip':
      return <svg {...props}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>;
  }
}

export function Callout({
  variant = 'info',
  title,
  children,
  icon,
  action,
  className = '',
}: CalloutProps) {
  const isAlert = variant === 'error' || variant === 'warning';

  return (
    <div
      role={isAlert ? 'alert' : 'note'}
      className={`flex gap-3 rounded-lg border-l-4 p-4 ${variantStyles[variant]} ${className}`}
    >
      <span className="shrink-0 mt-0.5">
        {icon || <DefaultIcon variant={variant} />}
      </span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-[var(--ui-text)] mb-1">{title}</p>
        )}
        <div className="text-sm text-[var(--ui-text-secondary)]">{children}</div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-xs font-medium text-[var(--ui-text)] underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] rounded"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
