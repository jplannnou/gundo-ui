import { useState } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type RecipeReasonCategory = 'test' | 'gene' | 'microbiota' | 'goal';

export interface RecipeReasoningData {
  test?: string[];
  gene?: string[];
  microbiota?: string[];
  goal?: string[];
}

export interface RecipeReasoningPillsProps {
  reasons: RecipeReasoningData;
  /** Default open pill (defaults to first non-empty) */
  defaultOpen?: RecipeReasonCategory;
  /** Layout: `stack` shows expanded content below, `inline` side-by-side on md+ */
  layout?: 'stack' | 'inline';
  className?: string;
}

/* ─── Catalog ────────────────────────────────────────────────────────── */

const catalog: Record<
  RecipeReasonCategory,
  { label: string; emoji: string; color: string; soft: string }
> = {
  test: {
    label: 'Analítica',
    emoji: '🩸',
    color: 'var(--ui-error)',
    soft: 'var(--ui-error-soft)',
  },
  gene: {
    label: 'Genética',
    emoji: '🧬',
    color: 'var(--ui-info)',
    soft: 'var(--ui-info-soft)',
  },
  microbiota: {
    label: 'Microbiota',
    emoji: '🦠',
    color: 'var(--ui-warning)',
    soft: 'var(--ui-warning-soft)',
  },
  goal: {
    label: 'Objetivo',
    emoji: '🎯',
    color: 'var(--ui-success)',
    soft: 'var(--ui-success-soft)',
  },
};

const order: RecipeReasonCategory[] = ['test', 'gene', 'microbiota', 'goal'];

/* ─── RecipeReasoningPills ───────────────────────────────────────────── */

export function RecipeReasoningPills({
  reasons,
  defaultOpen,
  layout = 'stack',
  className = '',
}: RecipeReasoningPillsProps) {
  const availableCategories = order.filter(
    (c) => reasons[c] && (reasons[c] as string[]).length > 0,
  );
  const initialOpen = defaultOpen ?? availableCategories[0] ?? 'goal';
  const [active, setActive] = useState<RecipeReasonCategory>(initialOpen);

  if (availableCategories.length === 0) return null;
  const activeList = reasons[active] ?? [];

  return (
    <div
      className={`flex flex-col gap-3 ${layout === 'inline' ? 'md:flex-row md:items-start' : ''} ${className}`}
    >
      {/* Pills */}
      <div className={`flex flex-wrap gap-2 ${layout === 'inline' ? 'md:max-w-xs md:flex-col' : ''}`}>
        {availableCategories.map((cat) => {
          const meta = catalog[cat];
          const selected = cat === active;
          const count = reasons[cat]?.length ?? 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              aria-pressed={selected}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                selected
                  ? 'text-[var(--ui-surface)] shadow-[var(--ui-shadow-sm)]'
                  : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
              }`}
              style={{
                background: selected ? meta.color : meta.soft,
                borderColor: selected ? meta.color : 'transparent',
                color: selected ? 'var(--ui-surface)' : meta.color,
              }}
            >
              <span aria-hidden="true">{meta.emoji}</span>
              {meta.label}
              <span
                className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] tabular-nums ${
                  selected ? 'bg-white/30' : ''
                }`}
                style={{
                  background: selected ? 'rgba(255,255,255,0.3)' : 'var(--ui-surface)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Breakdown */}
      <div
        className={`flex-1 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-4`}
        style={{ borderLeftColor: catalog[active].color, borderLeftWidth: 4 }}
      >
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ui-text-secondary)]">
          <span aria-hidden="true">{catalog[active].emoji}</span>
          Por qué según {catalog[active].label.toLowerCase()}
        </p>
        <ul className="flex flex-col gap-1.5">
          {activeList.map((item, idx) => (
            <li key={`${active}-${idx}`} className="flex items-start gap-2 text-sm text-[var(--ui-text)]">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: catalog[active].color }}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
