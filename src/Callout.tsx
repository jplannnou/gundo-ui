import './ui-classes.css';
import type { ReactNode } from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle, Lightbulb } from 'lucide-react';

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
  info: 'gu-border-info gu-bg-info-soft',
  warning: 'gu-border-warning gu-bg-warning-soft',
  error: 'gu-border-error gu-bg-error-soft',
  success: 'gu-border-success gu-bg-success-soft',
  tip: 'gu-border-primary gu-bg-primary-soft',
};

const variantIconColor: Record<CalloutVariant, string> = {
  info: 'var(--ui-info)',
  warning: 'var(--ui-warning)',
  error: 'var(--ui-error)',
  success: 'var(--ui-success)',
  tip: 'var(--ui-primary)',
};

const variantIcons: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  tip: Lightbulb,
};

function DefaultIcon({ variant }: { variant: CalloutVariant }) {
  const Icon = variantIcons[variant];
  return <Icon width={18} height={18} style={{ color: variantIconColor[variant] }} aria-hidden="true" />;
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
          <p className="text-sm font-semibold gu-text-text mb-1">{title}</p>
        )}
        <div className="text-sm gu-text-text-secondary">{children}</div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-xs font-medium gu-text-text underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color rounded"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
