import type { ReactNode } from 'react';

interface KpiCardProps {
  /** Card heading — use `title` (preferred) or `label` (compat alias) */
  title?: string;
  /** Compat alias for `title` */
  label?: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  /** Trend indicator — accepts object `{ value, label }` or a plain number (%) */
  trend?: { value: number; label?: string } | number;
  /** Compat alias for trend label when trend is a number */
  trendLabel?: string;
  /** Custom class for the value text (e.g. color override like `text-brand`) */
  valueClassName?: string;
  /** Compat alias: Tailwind class applied to value text (e.g. `text-income`) */
  color?: string;
  /** Custom class for the icon container background */
  iconClassName?: string;
  /** Slot for a sparkline or mini-chart rendered as background overlay */
  sparkline?: ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  label,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  valueClassName,
  color,
  iconClassName,
  sparkline,
  className = '',
}: KpiCardProps) {
  const heading = title ?? label ?? '';

  // Normalize trend to object form
  const trendObj = trend != null
    ? typeof trend === 'number'
      ? { value: trend, label: trendLabel }
      : trend
    : null;

  const trendColor = trendObj
    ? trendObj.value > 0
      ? 'var(--ui-success)'
      : trendObj.value < 0
        ? 'var(--ui-error)'
        : 'var(--ui-text-muted)'
    : undefined;

  const trendArrow = trendObj
    ? trendObj.value > 0
      ? '↑'
      : trendObj.value < 0
        ? '↓'
        : '→'
    : null;

  // Resolve value color: valueClassName > color > default
  const valClass = valueClassName || color || 'text-[var(--ui-text)]';

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">
            {heading}
          </p>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${valClass}`}>
            {value}
          </p>
          {(subtitle || trendObj) && (
            <div className="mt-1 flex items-center gap-2">
              {trendObj && (
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{ color: trendColor }}
                >
                  {trendArrow} {Math.abs(trendObj.value)}%{trendObj.label ? ` ${trendObj.label}` : ''}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[var(--ui-text-muted)]">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName || 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'}`}>
            {icon}
          </div>
        )}
      </div>
      {sparkline && (
        <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none">
          {sparkline}
        </div>
      )}
    </div>
  );
}
