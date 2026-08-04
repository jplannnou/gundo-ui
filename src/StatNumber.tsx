import './ui-classes.css';
import type { CSSProperties, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type StatNumberSize = 'sm' | 'md' | 'lg' | 'xl';

export interface StatNumberProps {
  /** The number (or pre-formatted string, e.g. "2,1" / "1.980"). */
  value: ReactNode;
  /** Small unit suffix rendered inline after the value, e.g. "g" or "L". */
  unit?: string;
  /** Caption under the number (already localized). */
  label?: string;
  /** Optional leading icon/emoji (decorative). */
  icon?: ReactNode;
  /** Editorial serif for the number (premium B2C). Default sans (data-density). */
  serif?: boolean;
  /** Raw CSS color / token for the number. Defaults to `--ui-text`. */
  tone?: string;
  size?: StatNumberSize;
  align?: 'start' | 'center';
  className?: string;
}

/* ─── Size scale ─────────────────────────────────────────────────────── */

const sizeClass: Record<StatNumberSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

/* ─── StatNumber ─────────────────────────────────────────────────────── */

/**
 * A single headline statistic: big tabular number + optional unit, label and
 * icon. The editorial building block of stat ribbons and hero cards. Theme-aware
 * via `--ui-*`; `label` must be pre-translated. Set `serif` for the premium
 * editorial look, leave it off for dashboard data-density.
 */
export function StatNumber({
  value,
  unit,
  label,
  icon,
  serif = false,
  tone = 'var(--ui-text)',
  size = 'lg',
  align = 'center',
  className = '',
}: StatNumberProps) {
  const numberStyle: CSSProperties = serif
    ? { color: tone, fontFamily: 'var(--ui-font-serif)' }
    : { color: tone };

  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start'} ${className}`}>
      {icon && (
        <span className="mb-1 text-lg" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={`font-bold leading-none tabular-nums ${sizeClass[size]}`} style={numberStyle}>
        {value}
        {unit && <span className="text-[0.5em] font-semibold opacity-80">{unit}</span>}
      </span>
      {label && <span className="mt-1.5 text-xs font-medium gu-text-text-muted">{label}</span>}
    </div>
  );
}
