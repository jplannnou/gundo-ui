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
   */
  variant?: 'cells' | 'strip';
  /** Use the editorial serif for the numbers (premium B2C surfaces). */
  serif?: boolean;
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

/* ─── MacroRow ───────────────────────────────────────────────────────── */

/**
 * Macronutrient summary — the boxed 4-up cells of a hero/plan card, or the
 * compact strip inside a MealCard. Numbers carry macro-identity color via the
 * dedicated `--ui-macro-*` tokens (protein/carbs/fat no longer borrow semantic
 * colors). Presentational only; `label`/`unit` must be pre-translated.
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
  className = '',
}: MacroRowProps) {
  const cells: MacroCell[] = items ?? [];
  if (!items) {
    if (calories !== undefined) cells.push({ label: KIND_LABEL.kcal, value: calories, unit: '', kind: 'kcal' });
    if (protein !== undefined) cells.push({ label: KIND_LABEL.protein, value: protein, unit: 'g', kind: 'protein' });
    if (carbs !== undefined) cells.push({ label: KIND_LABEL.carbs, value: carbs, unit: 'g', kind: 'carbs' });
    if (fat !== undefined) cells.push({ label: KIND_LABEL.fat, value: fat, unit: 'g', kind: 'fat' });
    if (fiber !== undefined) cells.push({ label: KIND_LABEL.fiber, value: fiber, unit: 'g', kind: 'fiber' });
  }

  if (cells.length === 0) return null;

  const numberStyle = (color: string): CSSProperties =>
    serif ? { color, fontFamily: 'var(--ui-font-serif)' } : { color };

  if (variant === 'strip') {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        {cells.map((c, i) => (
          <div key={i} className="flex-1 rounded-lg px-1 py-1.5 text-center gu-bg-surface-raised">
            <span className="block text-base font-bold leading-none tabular-nums" style={numberStyle(macroColor(c.kind))}>
              {c.value}
              {c.unit}
            </span>
            <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-wide gu-text-text-muted">
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
          <span className="mt-1.5 block text-[10.5px] font-semibold uppercase tracking-wide gu-text-text-muted">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
