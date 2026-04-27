import type { HTMLAttributes } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type DataChipStatus = 'activo' | 'procesando' | 'pendiente' | 'listo';

export interface DataChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: DataChipStatus;
  label: string;
  /** Optional count badge */
  count?: number;
  /** Density */
  size?: 'sm' | 'md';
}

/* ─── Status styles ──────────────────────────────────────────────────── */

const statusStyles: Record<
  DataChipStatus,
  { color: string; soft: string; dot: string; ariaLabel: string; animate?: boolean }
> = {
  activo: {
    color: 'var(--ui-success)',
    soft: 'var(--ui-success-soft)',
    dot: 'var(--ui-success)',
    ariaLabel: 'Activo',
  },
  procesando: {
    color: 'var(--ui-info)',
    soft: 'var(--ui-info-soft)',
    dot: 'var(--ui-info)',
    ariaLabel: 'Procesando',
    animate: true,
  },
  pendiente: {
    color: 'var(--ui-warning)',
    soft: 'var(--ui-warning-soft)',
    dot: 'var(--ui-warning)',
    ariaLabel: 'Pendiente',
  },
  listo: {
    color: 'var(--ui-primary)',
    soft: 'var(--ui-primary-soft)',
    dot: 'var(--ui-primary)',
    ariaLabel: 'Listo',
  },
};

/* ─── DataChip ───────────────────────────────────────────────────────── */

export function DataChip({
  status,
  label,
  count,
  size = 'sm',
  className = '',
  ...rest
}: DataChipProps) {
  const s = statusStyles[status];
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${className}`}
      style={{ background: s.soft, color: s.color }}
      aria-label={`${s.ariaLabel}: ${label}${count !== undefined ? ` (${count})` : ''}`}
      {...rest}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s.animate ? 'animate-pulse' : ''}`}
        style={{ background: s.dot }}
        aria-hidden="true"
      />
      {label}
      {count !== undefined && (
        <span
          className="ml-0.5 rounded-full px-1.5 text-[10px] font-bold tabular-nums"
          style={{ background: 'var(--ui-surface)', color: s.color }}
        >
          {count}
        </span>
      )}
    </span>
  );
}
