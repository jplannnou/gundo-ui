import './ui-classes.css';
import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface DetailBadge {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badges?: DetailBadge[];
  score?: number;
  /** Icon or avatar */
  icon?: ReactNode;
  /** Primary + secondary actions */
  actions?: ReactNode;
  /** Extra metadata row (e.g. date, author) */
  meta?: ReactNode;
  /** Tab bar slot */
  tabs?: ReactNode;
  className?: string;
}

/* ─── Badge config ───────────────────────────────────────────────────── */

const badgeStyles: Record<string, string> = {
  primary: 'gu-bg-primary-soft gu-text-primary',
  success: 'bg-[color-mix(in_srgb,var(--ui-success)_15%,transparent)] gu-text-success',
  warning: 'bg-[color-mix(in_srgb,var(--ui-warning)_15%,transparent)] gu-text-warning',
  danger: 'bg-[color-mix(in_srgb,var(--ui-error)_15%,transparent)] gu-text-error',
  info: 'bg-[color-mix(in_srgb,var(--ui-info)_15%,transparent)] gu-text-info',
  neutral: 'gu-bg-surface-hover gu-text-text-muted',
};

/* ─── DetailHeader ────────────────────────────────────────────────────── */

export function DetailHeader({
  title,
  subtitle,
  description,
  breadcrumbs = [],
  badges = [],
  score,
  icon,
  actions,
  meta,
  tabs,
  className = '',
}: DetailHeaderProps) {
  const scoreColor = score !== undefined
    ? score >= 75 ? 'var(--ui-success)'
      : score >= 50 ? 'var(--ui-primary)'
      : score >= 25 ? 'var(--ui-warning)'
      : 'var(--ui-error)'
    : undefined;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Navegación" className="flex items-center gap-1.5 text-xs gu-text-text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {crumb.href || crumb.onClick ? (
                <a
                  href={crumb.href}
                  onClick={crumb.onClick}
                  className="transition-colors gu-h-text-text focus-visible:outline-none focus-visible:ring-1 gu-fv-ring-primary rounded"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? 'gu-text-text-secondary' : ''}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main row */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border gu-border-border gu-bg-surface-raised">
            {icon}
          </div>
        )}

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold gu-text-text leading-tight">{title}</h1>
            {badges.map((b, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[b.variant ?? 'primary']}`}
              >
                {b.label}
              </span>
            ))}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm gu-text-text-secondary">{subtitle}</p>
          )}
          {description && (
            <p className="mt-1.5 text-sm gu-text-text-muted leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          {meta && <div className="mt-2">{meta}</div>}
        </div>

        {/* Score + Actions */}
        <div className="flex shrink-0 items-center gap-3">
          {score !== undefined && (
            <div
              className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border-2"
              style={{ borderColor: scoreColor }}
              aria-label={`Score: ${score}`}
            >
              <span className="text-base font-bold tabular-nums leading-none" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="text-[9px] gu-text-text-muted">score</span>
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Tabs slot */}
      {tabs && <div>{tabs}</div>}
    </div>
  );
}
