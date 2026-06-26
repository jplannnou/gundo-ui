import './ui-classes.css';
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
  /**
   * Trend rendering style. `plain` (default, backwards-compatible) shows the
   * trend as inline colored text. `pill` shows it as a soft-filled rounded
   * badge — the modern dashboard pattern (Linear / Vercel / Stripe).
   */
  trendVariant?: 'plain' | 'pill';
  /** Custom class for the value text (e.g. color override like `text-brand`) */
  valueClassName?: string;
  /** Compat alias: Tailwind class applied to value text (e.g. `text-income`) */
  color?: string;
  /** Custom class for the icon container background */
  iconClassName?: string;
  /** Slot for a sparkline or mini-chart rendered as background overlay */
  sparkline?: ReactNode;
  /**
   * Use the display font (Quicksand) for the value. Recommended for B2C/marketing
   * surfaces (Vida, Datacenter, Ametller). Dashboards (Engine/Radar/Finance/CC)
   * keep the default Montserrat for data-density.
   */
  display?: boolean;
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
  trendVariant = 'plain',
  valueClassName,
  color,
  iconClassName,
  sparkline,
  display = false,
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
        : 'var(--ui-text-secondary)'
    : undefined;

  // Soft fill background for the pill variant — semantic match to trendColor.
  const trendBg = trendObj
    ? trendObj.value > 0
      ? 'var(--ui-success-soft)'
      : trendObj.value < 0
        ? 'var(--ui-error-soft)'
        : 'var(--ui-surface-hover)'
    : undefined;

  const trendArrow = trendObj
    ? trendObj.value > 0
      ? '↑'
      : trendObj.value < 0
        ? '↓'
        : '→'
    : null;

  // Resolve value color: valueClassName > color > default
  const valClass = valueClassName || color || 'gu-text-text';

  return (
    <div className={`relative overflow-hidden rounded-xl border gu-border-border gu-bg-surface p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium gu-text-text-secondary">
            {heading}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${valClass} ${display ? 'gu-font-font-display' : ''}`}
          >
            {value}
          </p>
          {(subtitle || trendObj) && (
            <div className="mt-1 flex items-center gap-2">
              {trendObj && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
                    trendVariant === 'pill' ? 'rounded-full px-2 py-0.5' : ''
                  }`}
                  style={{
                    color: trendColor,
                    backgroundColor: trendVariant === 'pill' ? trendBg : undefined,
                  }}
                >
                  {trendArrow} {Math.abs(trendObj.value)}%{trendObj.label ? ` ${trendObj.label}` : ''}
                </span>
              )}
              {subtitle && (
                <span className="text-xs gu-text-text-secondary">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName || 'gu-bg-primary-soft gu-text-primary'}`}>
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
