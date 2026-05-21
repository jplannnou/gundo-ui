import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type PlanStatusVariant =
  | 'generating'
  | 'preview'
  | 'active'
  | 'completed'
  | 'failed'
  | 'draft';

export interface PlanStatusBadgeProps {
  status: PlanStatusVariant;
  /** Override the default label (e.g. localization). */
  label?: ReactNode;
  /** Force show animated dot when generating. Default: true for 'generating'. */
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/* ─── Default config per status ──────────────────────────────────────── */

interface StatusConfig {
  defaultLabel: string;
  bg: string;
  fg: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<PlanStatusVariant, StatusConfig> = {
  generating: {
    defaultLabel: 'Generando',
    bg: 'bg-[var(--ui-primary-soft)]',
    fg: 'text-[var(--ui-primary)]',
    dotColor: 'bg-[var(--ui-primary)]',
  },
  preview: {
    defaultLabel: 'Vista previa',
    bg: 'bg-[var(--ui-info-soft)]',
    fg: 'text-[var(--ui-info)]',
    dotColor: 'bg-[var(--ui-info)]',
  },
  active: {
    defaultLabel: 'Activo',
    bg: 'bg-[var(--ui-success-soft)]',
    fg: 'text-[var(--ui-success)]',
    dotColor: 'bg-[var(--ui-success)]',
  },
  completed: {
    defaultLabel: 'Completado',
    bg: 'bg-[var(--ui-success-soft)]',
    fg: 'text-[var(--ui-success)]',
    dotColor: 'bg-[var(--ui-success)]',
  },
  failed: {
    defaultLabel: 'Falló',
    bg: 'bg-[var(--ui-error-soft)]',
    fg: 'text-[var(--ui-error)]',
    dotColor: 'bg-[var(--ui-error)]',
  },
  draft: {
    defaultLabel: 'Borrador',
    bg: 'bg-[var(--ui-surface-hover)]',
    fg: 'text-[var(--ui-text-secondary)]',
    dotColor: 'bg-[var(--ui-text-muted)]',
  },
};

/* ─── PlanStatusBadge ────────────────────────────────────────────────── */

/**
 * Status pill for nutritional plans. Maps backend plan.status values to
 * design-system colors and provides an animated dot for in-progress states.
 *
 * `preview` is the Camino B intermediate state — first 3 days ready while
 * the rest of the plan continues to generate in background.
 */
export function PlanStatusBadge({
  status,
  label,
  pulse,
  size = 'sm',
  className = '',
}: PlanStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const sizeCls = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  const showPulse = pulse ?? status === 'generating';
  const displayLabel = label ?? cfg.defaultLabel;

  return (
    <span
      role="status"
      aria-label={typeof displayLabel === 'string' ? `Estado del plan: ${displayLabel}` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.fg} ${sizeCls} ${className}`}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        {showPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${cfg.dotColor} opacity-75 motion-safe:animate-ping`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
      </span>
      {displayLabel}
    </span>
  );
}
