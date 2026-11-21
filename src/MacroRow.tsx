import './ui-classes.css';
import type { CSSProperties } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MacroKind = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber';

export interface MacroCell {
  /** Localized label, e.g. "Proteína". */
  label: string;
  /** Numeric value. */
  value: number;
  /** Unit suffix, e.g. "g" or "kcal". Omit for none. */
  unit?: string;
  /** Macro identity → `--ui-macro-*` token color. Or pass a raw CSS color. */
  kind?: MacroKind | string;
  /**
   * Goal in the same unit as `value`. Only `variant="progress"` reads it: with
   * a target the row draws a bar, without one it shows just the value.
   */
  target?: number;
}

/** Per-macro goals for the shorthand props. Only `variant="progress"` reads them. */
export interface MacroTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MacroRowProps {
  /**
   * Explicit cells (full control + ordering). If omitted, cells are built from
   * the shorthand `calories/protein/carbs/fat/fiber` props in that order.
   */
  items?: MacroCell[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  /**
   * `cells` — boxed grid (the hero macro summary).
   * `strip` — compact borderless row (the meal-card footer strip).
   * `progress` — one row per macro: label, "consumed / goal" and an 8 px bar.
   */
  variant?: 'cells' | 'strip' | 'progress';
  /** Use the editorial serif for the numbers (premium B2C surfaces). */
  serif?: boolean;
  /** `progress` only. Goals for the shorthand props (explicit `items` carry their own `target`). */
  targets?: MacroTargets;
  /**
   * `progress` only. `consumed` shows "62 / 120 g"; `remaining` shows "58 g" plus
   * `remainingLabel`. The consumer owns the toggle. The bar always fills with
   * what was consumed. Default `consumed`.
   */
  progressMode?: 'consumed' | 'remaining';
  /** `progress` only. Text after the remaining amount (already localized), e.g. "restante". */
  remainingLabel?: string;
  /**
   * `progress` only. Text after the excess over the goal (already localized),
   * e.g. "de más". Over the goal, both modes show the difference plus this label.
   */
  overLabel?: string;
  className?: string;
}

/* ─── Macro kind → token ─────────────────────────────────────────────── */

const KIND_TOKEN: Record<MacroKind, string> = {
  kcal: 'var(--ui-macro-kcal)',
  protein: 'var(--ui-macro-protein)',
  carbs: 'var(--ui-macro-carbs)',
  fat: 'var(--ui-macro-fat)',
  fiber: 'var(--ui-macro-fiber)',
};

const KIND_LABEL: Record<MacroKind, string> = {
  kcal: 'kcal',
  protein: 'Proteína',
  carbs: 'Carbos',
  fat: 'Grasas',
  fiber: 'Fibra',
};

const macroColor = (kind: MacroCell['kind']): string =>
  kind && kind in KIND_TOKEN ? KIND_TOKEN[kind as MacroKind] : (kind as string) ?? 'var(--ui-text)';

/* ─── Progress figure ────────────────────────────────────────────────── */

interface ProgressFigure {
  /** The visible figure; also the `aria-valuetext` of the bar. */
  text: string;
  /** Consumed share of the goal, clamped to 0..1. `null` → no goal, no bar. */
  fraction: number | null;
  /** `aria-valuenow`, clamped to 0..target so it never exceeds `aria-valuemax`. */
  valueNow: number;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;
const withUnit = (n: number, unit?: string): string => (unit ? `${n} ${unit}` : `${n}`);

function progressFigure(
  cell: MacroCell,
  mode: 'consumed' | 'remaining',
  remainingLabel: string | undefined,
  overLabel: string | undefined,
): ProgressFigure {
  const { value, target, unit } = cell;
  if (target === undefined || !(target > 0)) {
    return { text: withUnit(value, unit), fraction: null, valueNow: value };
  }

  const fraction = Math.max(0, Math.min(1, value / target));
  const valueNow = Math.max(0, Math.min(target, value));
  const excess = round1(value - target);

  // Over the goal both modes say the same thing: how far over.
  if (excess > 0) {
    const diff = withUnit(excess, unit);
    return { text: overLabel ? `${diff} ${overLabel}` : `+${diff}`, fraction, valueNow };
  }
  if (mode === 'remaining') {
    const left = withUnit(round1(target - value), unit);
    return { text: remainingLabel ? `${left} ${remainingLabel}` : left, fraction, valueNow };
  }
  return { text: `${value} / ${withUnit(target, unit)}`, fraction, valueNow };
}

/* ─── MacroRow ───────────────────────────────────────────────────────── */

/**
 * Macronutrient summary — the boxed 4-up cells of a hero/plan card, or the
 * compact strip inside a MealCard. Numbers carry macro-identity color via the
 * dedicated `--ui-macro-*` tokens (protein/carbs/fat no longer borrow semantic
 * colors). Presentational only; `label`/`unit` must be pre-translated.
 *
 * `variant="progress"` turns each macro into a "consumed / goal" row with an
 * 8 px bar (macro color on the bar only; label and figure stay neutral). A cell
 * without `target` shows just its value and no bar.
 */
export function MacroRow({
  items,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  variant = 'cells',
  serif = false,
  targets,
  progressMode = 'consumed',
  remainingLabel,
  overLabel,
  className = '',
}: MacroRowProps) {
  const cells: MacroCell[] = items ?? [];
  if (!items) {
    if (calories !== undefined) cells.push({ label: KIND_LABEL.kcal, value: calories, unit: '', kind: 'kcal', target: targets?.calories });
    if (protein !== undefined) cells.push({ label: KIND_LABEL.protein, value: protein, unit: 'g', kind: 'protein', target: targets?.protein });
    if (carbs !== undefined) cells.push({ label: KIND_LABEL.carbs, value: carbs, unit: 'g', kind: 'carbs', target: targets?.carbs });
    if (fat !== undefined) cells.push({ label: KIND_LABEL.fat, value: fat, unit: 'g', kind: 'fat', target: targets?.fat });
    if (fiber !== undefined) cells.push({ label: KIND_LABEL.fiber, value: fiber, unit: 'g', kind: 'fiber', target: targets?.fiber });
  }

  if (cells.length === 0) return null;

  const numberStyle = (color: string): CSSProperties =>
    serif ? { color, fontFamily: 'var(--ui-font-serif)' } : { color };

  if (variant === 'progress') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {cells.map((c, i) => {
          const figure = progressFigure(c, progressMode, remainingLabel, overLabel);
          return (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium gu-text-text-secondary">{c.label}</span>
                <span className="text-sm font-bold tabular-nums" style={numberStyle('var(--ui-text)')}>
                  {figure.text}
                </span>
              </div>
              {figure.fraction !== null && (
                <div
                  role="progressbar"
                  aria-label={c.label}
                  aria-valuenow={figure.valueNow}
                  aria-valuemin={0}
                  aria-valuemax={c.target}
                  aria-valuetext={figure.text}
                  className="mt-1.5 h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--ui-surface-hover)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${figure.fraction * 100}%`, backgroundColor: macroColor(c.kind) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'strip') {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        {cells.map((c, i) => (
          <div key={i} className="flex-1 rounded-lg px-1 py-1.5 text-center gu-bg-surface-raised">
            <span className="block text-base font-bold leading-none tabular-nums" style={numberStyle(macroColor(c.kind))}>
              {c.value}
              {c.unit}
            </span>
            <span className="mt-1 block gu-text-2xs font-semibold uppercase tracking-wide gu-text-text-secondary">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // cells (default)
  return (
    <div
      className={`grid gap-2.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((c, i) => (
        <div key={i} className="rounded-xl px-1.5 py-3 text-center gu-bg-surface-raised">
          <span className="block text-xl font-bold leading-none tabular-nums" style={numberStyle(macroColor(c.kind))}>
            {c.value}
            {c.unit && <span className="text-[0.6em] font-semibold">{c.unit}</span>}
          </span>
          <span className="mt-1.5 block gu-text-2xs font-semibold uppercase tracking-wide gu-text-text-muted">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
