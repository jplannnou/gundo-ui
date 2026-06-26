import './ui-classes.css';
import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MetricStatus = 'ok' | 'warn' | 'bad';

export interface MetricRange {
  /** Lower bound of the optimal band. */
  low: number;
  /** Upper bound of the optimal band. */
  high: number;
  /** Current measured value. */
  current: number;
  /** Scale minimum. */
  min: number;
  /** Scale maximum. */
  max: number;
  /** Localized caption for the optimal band (e.g. "Óptimo"). Omit to show only numbers. */
  optimalLabel?: string;
}

export interface MetricRowProps {
  /** Optional leading icon/emoji (decorative). */
  icon?: ReactNode;
  /** Metric name (already localized). */
  name: string;
  /** Optional secondary line (already localized). */
  sub?: string;
  /** Formatted value, e.g. "13.5 g/dL". */
  value: string;
  /** Health status of the value. */
  status: MetricStatus;
  /** Localized status badge text (e.g. "Óptimo" / "Atención" / "Fuera de rango"). */
  statusLabel: string;
  /** Optional range bar config. */
  range?: MetricRange;
  className?: string;
}

/* ─── Status → range tokens ──────────────────────────────────────────── */

const statusTokens: Record<MetricStatus, { color: string; soft: string }> = {
  ok: { color: 'var(--ui-range-optimal)', soft: 'var(--ui-range-optimal-soft)' },
  warn: { color: 'var(--ui-range-attention)', soft: 'var(--ui-range-attention-soft)' },
  bad: { color: 'var(--ui-range-critical)', soft: 'var(--ui-range-critical-soft)' },
};

/** Bounds arrive as raw floats (e.g. 0.9924999999999998) — round to 2 decimals, trim trailing zeros. */
const fmtBound = (n: number): string =>
  Number.isFinite(n) ? String(Number(n.toFixed(2))) : String(n);

const pct = (v: number, min: number, max: number): number =>
  max === min ? 0 : Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));

/* ─── MetricRow ──────────────────────────────────────────────────────── */

/**
 * Metric row for health result screens (blood, urine, microbiota): value + status
 * badge + optional range bar. Theme-aware via `--ui-*` tokens; i18n-agnostic —
 * `name`, `sub`, `statusLabel` and `range.optimalLabel` must be pre-translated.
 */
export function MetricRow({
  icon,
  name,
  sub,
  value,
  status,
  statusLabel,
  range,
  className = '',
}: MetricRowProps) {
  const t = statusTokens[status];

  return (
    <div className={`border-b gu-border-border py-3 last:border-b-0 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="shrink-0 text-xl" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold gu-text-text">{name}</div>
            {sub && <div className="truncate text-xs gu-text-text-muted">{sub}</div>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-bold gu-text-text">{value}</span>
          <span
            className="mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide"
            style={{ background: t.soft, color: t.color }}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      {range && (
        <div className="ml-8 mt-3">
          <div
            className="relative h-2 rounded-full"
            style={{ background: 'var(--ui-surface-raised)' }}
            role="img"
            aria-label={`${value}${range.optimalLabel ? ` — ${range.optimalLabel} ${fmtBound(range.low)}–${fmtBound(range.high)}` : ''}`}
          >
            <div
              className="absolute inset-y-0 rounded-full"
              style={{
                background: 'var(--ui-range-optimal-soft)',
                left: `${pct(range.low, range.min, range.max)}%`,
                width: `${pct(range.high, range.min, range.max) - pct(range.low, range.min, range.max)}%`,
              }}
            />
            <div
              className="absolute -top-1 h-4 w-0.5 rounded"
              style={{ background: 'var(--ui-text)', left: `${pct(range.current, range.min, range.max)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] gu-text-text-muted">
            <span>{fmtBound(range.min)}</span>
            {range.optimalLabel && (
              <span style={{ color: 'var(--ui-range-optimal)' }}>
                {range.optimalLabel} {fmtBound(range.low)}–{fmtBound(range.high)}
              </span>
            )}
            <span>{fmtBound(range.max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
