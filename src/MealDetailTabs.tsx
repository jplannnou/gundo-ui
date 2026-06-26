import './ui-classes.css';
import { type ReactNode } from 'react';
import { DetailTabs, type DetailTabDefinition } from './DetailTabs';
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

/* ─── Panels (domain-specific renderers) ─────────────────────────────── */

function RecipePanel({ recipe }: { recipe: MealRecipe }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-xs gu-text-text-secondary">
        {recipe.servings && <Stat label="Porciones" value={`${recipe.servings}`} />}
        {recipe.prepTimeMin && <Stat label="Prep" value={`${recipe.prepTimeMin} min`} />}
        {recipe.cookTimeMin && <Stat label="Cocción" value={`${recipe.cookTimeMin} min`} />}
      </div>
      <section>
        <h4 className="mb-2 text-sm font-bold gu-text-text">Ingredientes</h4>
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {recipe.ingredients.map((i, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm gu-text-text">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full gu-bg-primary" aria-hidden="true" />
              <span className="flex-1">{i.name}</span>
              {i.amount && (
                <span className="text-xs gu-text-text-muted">{i.amount}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="mb-2 text-sm font-bold gu-text-text">Pasos</h4>
        <ol className="flex flex-col gap-2">
          {recipe.steps.map((s) => (
            <li key={s.order} className="flex gap-3 rounded-lg gu-bg-surface-raised p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gu-bg-primary text-xs font-bold gu-text-surface">
                {s.order}
              </span>
              <div className="flex-1 text-sm gu-text-text">
                <p>{s.text}</p>
                {s.durationMin && (
                  <p className="mt-1 text-xs gu-text-text-muted">≈ {s.durationMin} min</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      {recipe.notes && (
        <p className="rounded-lg border gu-border-border gu-bg-surface-raised p-3 text-xs gu-text-text-secondary">
          💡 {recipe.notes}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border gu-border-border gu-bg-surface-raised px-3 py-1">
      <span className="gu-text-text-muted">{label}: </span>
      <span className="font-semibold gu-text-text">{value}</span>
    </span>
  );
}

function AlternativesPanel({ alternatives }: { alternatives: MealAlternative[] }) {
  if (alternatives.length === 0) {
    return <p className="text-sm gu-text-text-secondary">No hay alternativas sugeridas.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {alternatives.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 rounded-xl border gu-border-border gu-bg-surface-raised p-3"
        >
          {a.image && (
            <img src={a.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold gu-text-text">{a.name}</p>
            {a.reason && (
              <p className="text-xs gu-text-text-secondary">{a.reason}</p>
            )}
          </div>
          {typeof a.matchScore === 'number' && (
            <span className="rounded-full gu-bg-primary-soft px-2 py-0.5 text-[11px] font-bold gu-text-primary">
              {a.matchScore}%
            </span>
          )}
          {a.onSwap && (
            <button
              type="button"
              onClick={() => a.onSwap?.(a.id)}
              className="rounded-lg gu-bg-primary px-3 py-1.5 text-xs font-semibold gu-text-surface gu-h-bg-primary-hover"
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
    return <p className="text-sm gu-text-text-secondary">Sin recomendaciones específicas.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((h, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3 rounded-xl border gu-border-border gu-bg-surface-raised p-3"
        >
          <span className="text-xl" aria-hidden="true">{emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold gu-text-text">{h.label}</p>
            <p className="text-xs gu-text-text-secondary">{h.detail}</p>
          </div>
          {h.volumeMl && (
            <span className="rounded-full gu-bg-info-soft px-2 py-0.5 text-[11px] font-bold gu-text-info">
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
        <li key={idx} className="rounded-xl border gu-border-border gu-bg-surface-raised p-4">
          <h4 className="mb-1 text-sm font-bold gu-text-text">{e.title}</h4>
          <p className="text-sm gu-text-text-secondary">{e.body}</p>
          {e.readMoreHref && (
            <a
              href={e.readMoreHref}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold gu-text-primary hover:underline"
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
      <p className="rounded-xl gu-bg-success-soft p-4 text-sm gu-text-success">
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
            <p className="font-semibold gu-text-warning">{s.label}</p>
            <p className="text-xs gu-text-text-secondary">{s.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─── MealDetailTabs (wraps DetailTabs with nutrition catalog) ──────── */

export function MealDetailTabs({
  meal,
  isPremium,
  paywallPricing,
  onUpgrade,
  defaultTab = 'recipe',
  className = '',
}: MealDetailTabsProps) {
  const tabs: DetailTabDefinition<MealDetailTabId>[] = [
    {
      id: 'recipe',
      label: 'Receta',
      icon: '🍳',
      content: <RecipePanel recipe={meal.recipe} />,
    },
    {
      id: 'reasoning',
      label: 'Por qué',
      icon: '✨',
      content: <RecipeReasoningPills reasons={meal.reasoning} />,
    },
    {
      id: 'alternatives',
      label: 'Alternativas',
      icon: '🔁',
      content: <AlternativesPanel alternatives={meal.alternatives} />,
    },
    {
      id: 'hydration',
      label: 'Hidratación',
      icon: '💧',
      premium: true,
      content: <HintsPanel items={meal.hydration ?? []} emoji="💧" />,
    },
    {
      id: 'timing',
      label: 'Timing',
      icon: '⏰',
      premium: true,
      content: <HintsPanel items={meal.timing ?? []} emoji="⏰" />,
    },
    {
      id: 'learn',
      label: 'Aprende',
      icon: '📚',
      content: <EducationPanel items={meal.education} />,
    },
    {
      id: 'safety',
      label: 'Seguridad',
      icon: '🛡️',
      content: <SafetyPanel items={meal.safety} />,
    },
  ];

  function lockedContent(tab: DetailTabDefinition<MealDetailTabId>): ReactNode {
    if (!paywallPricing) {
      return (
        <p className="rounded-xl border gu-border-border gu-bg-surface-raised p-6 text-center text-sm gu-text-text-secondary">
          Esta sección es Premium. Hacete Premium para verla.
        </p>
      );
    }
    return (
      <PaywallUnified
        trigger="plan"
        pricing={paywallPricing}
        onUpgrade={() => onUpgrade?.()}
        title={
          tab.id === 'hydration'
            ? 'Hidratación personalizada — Premium'
            : 'Timing de comidas — Premium'
        }
        subtitle={
          tab.id === 'hydration'
            ? 'Ml exactos por comida, alertas y adaptación según entrenamiento.'
            : 'Cuándo comer cada macro según tu cronotipo y objetivo.'
        }
      />
    );
  }

  return (
    <DetailTabs
      tabs={tabs}
      defaultTab={defaultTab}
      isPremium={isPremium}
      lockedContent={lockedContent}
      ariaLabel="Detalle de la comida"
      idPrefix="meal"
      className={className}
    />
  );
}
