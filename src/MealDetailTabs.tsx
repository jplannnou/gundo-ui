import { useState, type ReactNode } from 'react';
import { PaywallUnified, type PaywallPricing } from './PaywallUnified';
import { RecipeReasoningPills, type RecipeReasoningData } from './RecipeReasoningPills';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MealDetailTabId =
  | 'recipe'
  | 'reasoning'
  | 'alternatives'
  | 'hydration'
  | 'timing'
  | 'learn'
  | 'safety';

export interface MealRecipeIngredient {
  name: string;
  amount?: string;
}

export interface MealRecipeStep {
  order: number;
  text: string;
  durationMin?: number;
}

export interface MealRecipe {
  servings?: number;
  prepTimeMin?: number;
  cookTimeMin?: number;
  ingredients: MealRecipeIngredient[];
  steps: MealRecipeStep[];
  notes?: string;
}

export interface MealAlternative {
  id: string;
  name: string;
  matchScore?: number;
  reason?: string;
  image?: string;
  onSwap?: (id: string) => void;
}

export interface MealHydrationHint {
  label: string;
  detail: string;
  volumeMl?: number;
}

export interface MealTimingHint {
  label: string;
  detail: string;
}

export interface MealEducation {
  title: string;
  body: string;
  readMoreHref?: string;
}

export interface MealSafetyNote {
  type: 'allergen' | 'interaction' | 'condition';
  label: string;
  detail: string;
}

export interface MealDetail {
  recipe: MealRecipe;
  reasoning: RecipeReasoningData;
  alternatives: MealAlternative[];
  hydration?: MealHydrationHint[];
  timing?: MealTimingHint[];
  education: MealEducation[];
  safety: MealSafetyNote[];
}

export interface MealDetailTabsProps {
  meal: MealDetail;
  /** Premium gating for tabs 4 (hydration) & 5 (timing) */
  isPremium: boolean;
  /** Pricing used inside paywall fallback (required when `isPremium` is false) */
  paywallPricing?: PaywallPricing;
  /** Called when user upgrades from a locked tab */
  onUpgrade?: () => void;
  /** Default active tab */
  defaultTab?: MealDetailTabId;
  className?: string;
}

/* ─── Tabs catalog ───────────────────────────────────────────────────── */

const tabCatalog: Array<{
  id: MealDetailTabId;
  label: string;
  icon: string;
  premium?: boolean;
}> = [
  { id: 'recipe', label: 'Receta', icon: '🍳' },
  { id: 'reasoning', label: 'Por qué', icon: '✨' },
  { id: 'alternatives', label: 'Alternativas', icon: '🔁' },
  { id: 'hydration', label: 'Hidratación', icon: '💧', premium: true },
  { id: 'timing', label: 'Timing', icon: '⏰', premium: true },
  { id: 'learn', label: 'Aprende', icon: '📚' },
  { id: 'safety', label: 'Seguridad', icon: '🛡️' },
];

/* ─── Panels ─────────────────────────────────────────────────────────── */

function RecipePanel({ recipe }: { recipe: MealRecipe }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-xs text-[var(--ui-text-secondary)]">
        {recipe.servings && <Stat label="Porciones" value={`${recipe.servings}`} />}
        {recipe.prepTimeMin && <Stat label="Prep" value={`${recipe.prepTimeMin} min`} />}
        {recipe.cookTimeMin && <Stat label="Cocción" value={`${recipe.cookTimeMin} min`} />}
      </div>
      <section>
        <h4 className="mb-2 text-sm font-bold text-[var(--ui-text)]">Ingredientes</h4>
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {recipe.ingredients.map((i, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-[var(--ui-text)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ui-primary)]" aria-hidden="true" />
              <span className="flex-1">{i.name}</span>
              {i.amount && (
                <span className="text-xs text-[var(--ui-text-muted)]">{i.amount}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="mb-2 text-sm font-bold text-[var(--ui-text)]">Pasos</h4>
        <ol className="flex flex-col gap-2">
          {recipe.steps.map((s) => (
            <li key={s.order} className="flex gap-3 rounded-lg bg-[var(--ui-surface-raised)] p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary)] text-xs font-bold text-[var(--ui-surface)]">
                {s.order}
              </span>
              <div className="flex-1 text-sm text-[var(--ui-text)]">
                <p>{s.text}</p>
                {s.durationMin && (
                  <p className="mt-1 text-xs text-[var(--ui-text-muted)]">≈ {s.durationMin} min</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      {recipe.notes && (
        <p className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3 text-xs text-[var(--ui-text-secondary)]">
          💡 {recipe.notes}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] px-3 py-1">
      <span className="text-[var(--ui-text-muted)]">{label}: </span>
      <span className="font-semibold text-[var(--ui-text)]">{value}</span>
    </span>
  );
}

function AlternativesPanel({ alternatives }: { alternatives: MealAlternative[] }) {
  if (alternatives.length === 0) {
    return <p className="text-sm text-[var(--ui-text-secondary)]">No hay alternativas sugeridas.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {alternatives.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3"
        >
          {a.image && (
            <img src={a.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--ui-text)]">{a.name}</p>
            {a.reason && (
              <p className="text-xs text-[var(--ui-text-secondary)]">{a.reason}</p>
            )}
          </div>
          {typeof a.matchScore === 'number' && (
            <span className="rounded-full bg-[var(--ui-primary-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--ui-primary)]">
              {a.matchScore}%
            </span>
          )}
          {a.onSwap && (
            <button
              type="button"
              onClick={() => a.onSwap?.(a.id)}
              className="rounded-lg bg-[var(--ui-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--ui-surface)] hover:bg-[var(--ui-primary-hover)]"
            >
              Intercambiar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function HintsPanel({
  items,
  emoji,
}: {
  items: Array<{ label: string; detail: string; volumeMl?: number }>;
  emoji: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--ui-text-secondary)]">Sin recomendaciones específicas.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((h, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3"
        >
          <span className="text-xl" aria-hidden="true">{emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--ui-text)]">{h.label}</p>
            <p className="text-xs text-[var(--ui-text-secondary)]">{h.detail}</p>
          </div>
          {h.volumeMl && (
            <span className="rounded-full bg-[var(--ui-info-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--ui-info)]">
              {h.volumeMl} ml
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function EducationPanel({ items }: { items: MealEducation[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((e, idx) => (
        <li key={idx} className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-4">
          <h4 className="mb-1 text-sm font-bold text-[var(--ui-text)]">{e.title}</h4>
          <p className="text-sm text-[var(--ui-text-secondary)]">{e.body}</p>
          {e.readMoreHref && (
            <a
              href={e.readMoreHref}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ui-primary)] hover:underline"
            >
              Leer más →
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function SafetyPanel({ items }: { items: MealSafetyNote[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--ui-success-soft)] p-4 text-sm text-[var(--ui-success)]">
        ✅ Sin alertas conocidas para tu perfil.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((s, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3 rounded-xl border p-3 text-sm"
          style={{
            borderColor: 'color-mix(in srgb, var(--ui-warning) 30%, transparent)',
            background: 'var(--ui-warning-soft)',
          }}
        >
          <span aria-hidden="true">⚠️</span>
          <div>
            <p className="font-semibold text-[var(--ui-warning)]">{s.label}</p>
            <p className="text-xs text-[var(--ui-text-secondary)]">{s.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─── MealDetailTabs ─────────────────────────────────────────────────── */

export function MealDetailTabs({
  meal,
  isPremium,
  paywallPricing,
  onUpgrade,
  defaultTab = 'recipe',
  className = '',
}: MealDetailTabsProps) {
  const [active, setActive] = useState<MealDetailTabId>(defaultTab);

  function renderPanel(): ReactNode {
    const locked = !isPremium && (active === 'hydration' || active === 'timing');
    if (locked) {
      if (!paywallPricing) {
        return (
          <p className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-6 text-center text-sm text-[var(--ui-text-secondary)]">
            Esta sección es Premium. Hacete Premium para verla.
          </p>
        );
      }
      return (
        <PaywallUnified
          trigger={active === 'hydration' ? 'plan' : 'plan'}
          pricing={paywallPricing}
          onUpgrade={() => onUpgrade?.()}
          title={
            active === 'hydration'
              ? 'Hidratación personalizada — Premium'
              : 'Timing de comidas — Premium'
          }
          subtitle={
            active === 'hydration'
              ? 'Ml exactos por comida, alertas y adaptación según entrenamiento.'
              : 'Cuándo comer cada macro según tu cronotipo y objetivo.'
          }
        />
      );
    }

    switch (active) {
      case 'recipe':
        return <RecipePanel recipe={meal.recipe} />;
      case 'reasoning':
        return <RecipeReasoningPills reasons={meal.reasoning} />;
      case 'alternatives':
        return <AlternativesPanel alternatives={meal.alternatives} />;
      case 'hydration':
        return <HintsPanel items={meal.hydration ?? []} emoji="💧" />;
      case 'timing':
        return <HintsPanel items={meal.timing ?? []} emoji="⏰" />;
      case 'learn':
        return <EducationPanel items={meal.education} />;
      case 'safety':
        return <SafetyPanel items={meal.safety} />;
      default:
        return null;
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Tab list — horizontal scroll on mobile */}
      <div
        role="tablist"
        aria-label="Detalle de la comida"
        className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-1"
      >
        {tabCatalog.map((t) => {
          const selected = active === t.id;
          const gated = !isPremium && t.premium;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`meal-panel-${t.id}`}
              id={`meal-tab-${t.id}`}
              type="button"
              onClick={() => setActive(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                selected
                  ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                  : 'text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]'
              }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
              {gated && (
                <span className="ml-0.5 text-[10px]" aria-label="Premium" title="Premium">
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id={`meal-panel-${active}`}
        aria-labelledby={`meal-tab-${active}`}
        className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 md:p-5"
      >
        {renderPanel()}
      </div>
    </div>
  );
}
