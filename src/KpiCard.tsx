import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon, trend, className = '' }: KpiCardProps) {
  const trendColor = trend
    ? trend.value > 0
      ? 'var(--ui-success)'
      : trend.value < 0
        ? 'var(--ui-error)'
        : 'var(--ui-text-muted)'
    : undefined;

  const trendArrow = trend
    ? trend.value > 0
      ? '↑'
      : trend.value < 0
        ? '↓'
        : '→'
    : null;

  return (
    <div className={`rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--ui-text)] tabular-nums">
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center gap-2">
              {trend && (
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{ color: trendColor }}
                >
                  {trendArrow} {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ''}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[var(--ui-text-muted)]">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
