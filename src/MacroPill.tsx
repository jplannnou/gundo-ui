import type { HTMLAttributes, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MacroKind = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'water' | 'sodium';

export interface MacroPillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  kind: MacroKind;
  /** Numeric value (rendered with tabular-nums). */
  value: number;
  /** Override the default unit (defaults: kcal/g/ml/mg). */
  unit?: string;
  /** Optional target — when provided, renders the value as `value / target`. */
  target?: number;
  /**
   * When `target` is set, switch to a "delta" rendering style with a
   * traffic-light hint (green: within ±10%, amber: ±10–20%, red: >20%).
   */
  showDelta?: boolean;
  /** Visual size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Override the icon (defaults to a colored dot). */
  icon?: ReactNode;
  /** Display label (default uses the kind's canonical label). */
  label?: string;
}

/* ─── Macro palette ──────────────────────────────────────────────────── */

const MACRO_COLORS: Record<MacroKind, string> = {
  kcal: 'var(--macro-kcal, var(--ui-text))',
  protein: 'var(--macro-protein, var(--ui-primary))',
  carbs: 'var(--macro-carbs, var(--ui-warning))',
  fat: 'var(--macro-fat, var(--ui-info))',
  fiber: 'var(--macro-fiber, var(--ui-success))',
  water: 'var(--macro-water, var(--ui-info))',
  sodium: 'var(--macro-sodium, var(--ui-text-secondary))',
};

const DEFAULT_LABELS: Record<MacroKind, string> = {
  kcal: 'kcal',
  protein: 'proteína',
  carbs: 'carbos',
  fat: 'grasas',
  fiber: 'fibra',
  water: 'agua',
  sodium: 'sodio',
};

const DEFAULT_UNITS: Record<MacroKind, string> = {
  kcal: '',
  protein: 'g',
  carbs: 'g',
  fat: 'g',
  fiber: 'g',
  water: 'ml',
  sodium: 'mg',
};

/* ─── Delta semaphore ────────────────────────────────────────────────── */

function deltaColor(value: number, target: number): string {
  if (target <= 0) return 'var(--ui-text-secondary)';
  const ratio = Math.abs(value - target) / target;
  if (ratio <= 0.1) return 'var(--adherence-good, var(--ui-success))';
  if (ratio <= 0.2) return 'var(--adherence-warn, var(--ui-warning))';
  return 'var(--adherence-low, var(--ui-error))';
}

/* ─── MacroPill ──────────────────────────────────────────────────────── */

/**
 * Compact single-macro display. Use throughout the plan UI for at-a-glance
 * macros (meal cards, day totals, recipe detail header).
 *
 * For a full multi-macro grid with bars/circles use the existing
 * `<MacrosDisplay>` component.
 *
 * When `target` is provided + `showDelta`, the pill renders a traffic-light
 * color matching the validation endpoint's status (±10% ok / ±20% warn / fail).
 */
export function MacroPill({
  kind,
  value,
  unit,
  target,
  showDelta = false,
  size = 'md',
  icon,
  label,
  className = '',
  ...rest
}: MacroPillProps) {
  const sizeCls =
    size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' :
    size === 'lg' ? 'px-3 py-1.5 text-base gap-2' :
    'px-2.5 py-1 text-sm gap-1.5';

  const resolvedUnit = unit ?? DEFAULT_UNITS[kind];
  const resolvedLabel = label ?? DEFAULT_LABELS[kind];
  const color = showDelta && typeof target === 'number'
    ? deltaColor(value, target)
    : MACRO_COLORS[kind];

  const valueText = Number.isFinite(value) ? formatNumber(value) : '—';
  const targetText = typeof target === 'number' && Number.isFinite(target) ? formatNumber(target) : null;

  const ariaLabel = targetText
    ? `${resolvedLabel}: ${valueText} de ${targetText} ${resolvedUnit}`
    : `${resolvedLabel}: ${valueText} ${resolvedUnit}`;

  return (
    <span
      role="text"
      aria-label={ariaLabel}
      className={`inline-flex items-center rounded-full font-medium tabular-nums ${sizeCls} ${className}`}
      style={{
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
      {...rest}
    >
      {icon ?? (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: color }}
        />
      )}
      <span className="whitespace-nowrap">
        {valueText}
        {targetText && (
          <span className="opacity-60">/{targetText}</span>
        )}
        {resolvedUnit && <span className="ml-0.5 opacity-70">{resolvedUnit}</span>}
      </span>
    </span>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value);
  }
  // 1 decimal for sub-100 values, 0 otherwise
  return Math.abs(value) < 100
    ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value)
    : new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value);
}
