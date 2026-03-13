import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Macros {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  fiber?: number;    // g
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom';

export interface MealCardProps {
  name: string;
  mealType?: MealType;
  image?: string;
  imageAlt?: string;
  macros?: Macros;
  ingredients?: string[];
  portion?: string;
  /** Score 0-100 */
  healthScore?: number;
  /** Extra slot (e.g. tags, allergens) */
  footer?: ReactNode;
  onCardClick?: () => void;
  onAddToCart?: () => void;
  addToCartLabel?: string;
  variant?: 'full' | 'compact' | 'horizontal';
  className?: string;
}

/* ─── Meal type config ───────────────────────────────────────────────── */

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  custom: 'Comida',
};

/* ─── Macro bar ──────────────────────────────────────────────────────── */

function MacroBar({
  label,
  value,
  unit = 'g',
  color,
  pct,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
  pct: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] text-[var(--ui-text-muted)]">{label}</span>
        <span className="text-[10px] font-semibold tabular-nums text-[var(--ui-text-secondary)]">
          {value}{unit}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-label={label}
        />
      </div>
    </div>
  );
}

/* ─── MealCard ────────────────────────────────────────────────────────── */

export function MealCard({
  name,
  mealType,
  image,
  imageAlt,
  macros,
  ingredients,
  portion,
  healthScore,
  footer,
  onCardClick,
  onAddToCart,
  addToCartLabel = 'Añadir',
  variant = 'full',
  className = '',
}: MealCardProps) {
  const isHorizontal = variant === 'horizontal';
  const isCompact = variant === 'compact';

  // Compute macro percentages relative to rough daily targets
  const proteinPct = macros ? (macros.protein / 50) * 100 : 0;
  const carbsPct = macros ? (macros.carbs / 250) * 100 : 0;
  const fatPct = macros ? (macros.fat / 65) * 100 : 0;

  const scoreColor = healthScore !== undefined
    ? healthScore >= 75 ? 'var(--ui-success)'
      : healthScore >= 50 ? 'var(--ui-primary)'
      : healthScore >= 25 ? 'var(--ui-warning)'
      : 'var(--ui-error)'
    : undefined;

  return (
    <article
      aria-label={name}
      onClick={onCardClick}
      className={`overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] transition-shadow hover:shadow-[var(--ui-shadow-md)] ${onCardClick ? 'cursor-pointer' : ''} ${isHorizontal ? 'flex' : 'flex flex-col'} ${className}`}
    >
      {/* Image */}
      {image && (
        <div className={`shrink-0 overflow-hidden bg-[var(--ui-surface-raised)] ${isHorizontal ? 'w-28' : isCompact ? 'h-28' : 'h-40'}`}>
          <img
            src={image}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className={`flex flex-1 flex-col gap-2 ${isCompact ? 'p-3' : 'p-4'}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            {mealType && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">
                {MEAL_LABELS[mealType]}
              </span>
            )}
            <h3 className="text-sm font-semibold leading-snug text-[var(--ui-text)] line-clamp-2">
              {name}
            </h3>
            {portion && (
              <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">{portion}</p>
            )}
          </div>
          {healthScore !== undefined && (
            <span
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums"
              style={{ borderColor: scoreColor, color: scoreColor }}
              aria-label={`Puntuación: ${healthScore}`}
            >
              {healthScore}
            </span>
          )}
        </div>

        {/* Macros */}
        {macros && !isCompact && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--ui-text-muted)]">Calorías</span>
              <span className="text-xs font-bold tabular-nums text-[var(--ui-text)]">
                {macros.calories} kcal
              </span>
            </div>
            <MacroBar label="Proteína" value={macros.protein} color="var(--ui-primary)" pct={proteinPct} />
            <MacroBar label="Carbos" value={macros.carbs} color="var(--ui-warning)" pct={carbsPct} />
            <MacroBar label="Grasa" value={macros.fat} color="var(--ui-info)" pct={fatPct} />
          </div>
        )}

        {/* Compact macros (inline) */}
        {macros && isCompact && (
          <div className="flex gap-3 text-[10px] tabular-nums text-[var(--ui-text-muted)]">
            <span><strong className="text-[var(--ui-text)]">{macros.calories}</strong> kcal</span>
            <span><strong className="text-[var(--ui-primary)]">{macros.protein}g</strong> prot</span>
            <span><strong className="text-[var(--ui-warning)]">{macros.carbs}g</strong> carbs</span>
            <span><strong className="text-[var(--ui-info)]">{macros.fat}g</strong> grasa</span>
          </div>
        )}

        {/* Ingredients */}
        {ingredients && ingredients.length > 0 && !isCompact && (
          <p className="text-xs text-[var(--ui-text-muted)] line-clamp-2">
            {ingredients.slice(0, 5).join(', ')}
            {ingredients.length > 5 && ` +${ingredients.length - 5} más`}
          </p>
        )}

        {footer}

        {/* CTA */}
        {onAddToCart && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            aria-label={`${addToCartLabel} ${name}`}
            className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[var(--ui-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {addToCartLabel}
          </button>
        )}
      </div>
    </article>
  );
}
