import type { HTMLAttributes, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ExplainabilityTag = 'analytic' | 'microbiota' | 'gene' | 'allergen';
export type ExplainabilityTone = 'success' | 'warning' | 'info';

export interface ExplainabilityBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Human-readable reason, e.g. "Alto en fibra · mejora microbiota" */
  reason: string;
  /** Tags that drove the match (drives icons) */
  tags?: ExplainabilityTag[];
  /** Visual tone. Defaults to `success` */
  tone?: ExplainabilityTone;
  /** Optional score (0-100) to display next to the reason */
  score?: number;
  /** Optional icon override */
  icon?: ReactNode;
  /** Compact variant drops the tag chips */
  compact?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const toneClassName: Record<ExplainabilityTone, string> = {
  success:
    'bg-[var(--ui-success-soft)] text-[var(--ui-success)] border-[color-mix(in_srgb,var(--ui-success)_30%,transparent)]',
  warning:
    'bg-[var(--ui-warning-soft)] text-[var(--ui-warning)] border-[color-mix(in_srgb,var(--ui-warning)_30%,transparent)]',
  info:
    'bg-[var(--ui-info-soft)] text-[var(--ui-info)] border-[color-mix(in_srgb,var(--ui-info)_30%,transparent)]',
};

const tagMeta: Record<ExplainabilityTag, { label: string; emoji: string }> = {
  analytic: { label: 'Analítica', emoji: '🧪' },
  microbiota: { label: 'Microbiota', emoji: '🦠' },
  gene: { label: 'Genética', emoji: '🧬' },
  allergen: { label: 'Alérgenos', emoji: '⚠️' },
};

/* ─── ExplainabilityBadge ─────────────────────────────────────────────── */

export function ExplainabilityBadge({
  reason,
  tags = [],
  tone = 'success',
  score,
  icon,
  compact = false,
  className = '',
  ...rest
}: ExplainabilityBadgeProps) {
  return (
    <div
      role="note"
      aria-label={`Motivo de match: ${reason}`}
      className={`inline-flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-medium leading-snug ${toneClassName[tone]} ${className}`}
      {...rest}
    >
      {icon ? (
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          ✨
        </span>
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{reason}</span>
          {typeof score === 'number' && (
            <span className="rounded-full bg-[var(--ui-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums opacity-90">
              {Math.max(0, Math.min(100, Math.round(score)))}%
            </span>
          )}
        </div>
        {!compact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--ui-surface)] px-2 py-0.5 text-[10px] font-medium"
                title={tagMeta[tag].label}
              >
                <span aria-hidden="true">{tagMeta[tag].emoji}</span>
                {tagMeta[tag].label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
