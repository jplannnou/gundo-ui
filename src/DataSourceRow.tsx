import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type DataSourceStatus = 'ok' | 'warn' | 'locked' | 'new';

export interface DataSourceRowProps {
  /** Leading icon/emoji (decorative). */
  icon: ReactNode;
  /** Source name (already localized), e.g. "Análisis de sangre". */
  name: string;
  /** Secondary line (already localized), e.g. "Actualizado hace 2 días". */
  sub: string;
  /** Optional pill text (already localized), e.g. "Nuevo" / "Premium". */
  tag?: string;
  /** Visual + semantic status of the source. */
  status?: DataSourceStatus;
  onClick?: () => void;
  className?: string;
}

/* ─── Status styles ──────────────────────────────────────────────────── */

const containerStyles: Record<DataSourceStatus, { background: string; borderColor: string; opacity?: number }> = {
  ok: { background: 'var(--ui-surface)', borderColor: 'var(--ui-border)' },
  warn: { background: 'var(--ui-warning-soft)', borderColor: 'var(--ui-warning)' },
  locked: { background: 'var(--ui-surface-raised)', borderColor: 'var(--ui-border)', opacity: 0.7 },
  new: { background: 'var(--ui-success-soft)', borderColor: 'var(--ui-success)' },
};

const tagStyles: Record<DataSourceStatus, { background: string; color: string }> = {
  ok: { background: 'var(--ui-success-soft)', color: 'var(--ui-success)' },
  warn: { background: 'var(--ui-warning-soft)', color: 'var(--ui-warning)' },
  locked: { background: 'var(--ui-surface-raised)', color: 'var(--ui-text-muted)' },
  new: { background: 'var(--ui-info-soft)', color: 'var(--ui-info)' },
};

/* ─── DataSourceRow ──────────────────────────────────────────────────── */

/**
 * Tappable row summarising a health data source (blood, urine, microbiota…):
 * icon + name + sub + optional status pill + chevron. Used in the unified home /
 * "Mi salud" surfaces. Theme-aware via `--ui-*`; i18n-agnostic (pass localized text).
 *
 * Distinct from `DataChip` (an inline status badge) — this is a navigation row.
 */
export function DataSourceRow({
  icon,
  name,
  sub,
  tag,
  status = 'ok',
  onClick,
  className = '',
}: DataSourceRowProps) {
  const c = containerStyles[status];
  const isLocked = status === 'locked';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      aria-disabled={isLocked}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] disabled:cursor-not-allowed ${className}`}
      style={{ background: c.background, borderColor: c.borderColor, opacity: c.opacity }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: 'var(--ui-surface-raised)' }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--ui-text)]">{name}</span>
        <span className="block truncate text-xs text-[var(--ui-text-muted)]">{sub}</span>
      </span>
      {tag && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={tagStyles[status]}
        >
          {tag}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--ui-text-muted)]" aria-hidden="true" />
    </button>
  );
}
