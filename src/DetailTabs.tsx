import { useState, useEffect, type ReactNode } from 'react';

/**
 * Generic tabbed detail viewer with optional premium gating.
 * Domain-agnostic: each tab provides its own `content` ReactNode.
 *
 * For nutrition-specific tabs (recipe, hydration, timing, etc.)
 * see `MealDetailTabs` which wraps `DetailTabs` with a fixed catalog.
 */

export interface DetailTabDefinition<TId extends string = string> {
  /** Unique identifier — used in URLs, ARIA, and state */
  id: TId;
  /** Visible label */
  label: string;
  /** Optional icon (emoji or React node) rendered before label */
  icon?: ReactNode;
  /** When true, tab content is gated behind premium */
  premium?: boolean;
  /** Panel content rendered when this tab is active and unlocked */
  content: ReactNode;
}

export interface DetailTabsProps<TId extends string = string> {
  /** Tab definitions (order respected) */
  tabs: DetailTabDefinition<TId>[];
  /** Default active tab id (uncontrolled mode) — first tab if omitted */
  defaultTab?: TId;
  /** Controlled active tab id (overrides internal state) */
  activeTab?: TId;
  /** Notified when user switches tabs */
  onTabChange?: (id: TId) => void;
  /** Premium status — when false, tabs marked `premium: true` show `lockedContent` */
  isPremium?: boolean;
  /**
   * Content shown for premium tabs when `isPremium=false`.
   * - ReactNode: same content for every locked tab
   * - Function: receives the locked tab definition and returns a custom node
   */
  lockedContent?: ReactNode | ((tab: DetailTabDefinition<TId>) => ReactNode);
  /** ARIA label for the tablist (defaults to "Detalle") */
  ariaLabel?: string;
  /** Optional id prefix for ARIA wiring (defaults to "detail") */
  idPrefix?: string;
  className?: string;
}

export function DetailTabs<TId extends string = string>({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  isPremium = true,
  lockedContent,
  ariaLabel = 'Detalle',
  idPrefix = 'detail',
  className = '',
}: DetailTabsProps<TId>) {
  const initialTab = defaultTab ?? tabs[0]?.id;
  const [internalActive, setInternalActive] = useState<TId | undefined>(initialTab);
  const active = activeTab ?? internalActive;

  // If controlled `activeTab` changes externally, no internal sync needed
  // (we just read `active`). If uncontrolled and `defaultTab` changes, follow it.
  useEffect(() => {
    if (activeTab === undefined && defaultTab !== undefined) {
      setInternalActive(defaultTab);
    }
  }, [defaultTab, activeTab]);

  if (!active || tabs.length === 0) {
    return null;
  }

  function selectTab(id: TId) {
    if (activeTab === undefined) {
      setInternalActive(id);
    }
    onTabChange?.(id);
  }

  const activeTabDef = tabs.find((t) => t.id === active);

  function renderPanel(): ReactNode {
    if (!activeTabDef) return null;
    const locked = activeTabDef.premium === true && !isPremium;
    if (!locked) {
      return activeTabDef.content;
    }
    if (typeof lockedContent === 'function') {
      return lockedContent(activeTabDef);
    }
    if (lockedContent !== undefined) {
      return lockedContent;
    }
    return (
      <p className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-6 text-center text-sm text-[var(--ui-text-secondary)]">
        Esta sección es Premium.
      </p>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-1"
      >
        {tabs.map((t) => {
          const selected = active === t.id;
          const gated = t.premium === true && !isPremium;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${t.id}`}
              id={`${idPrefix}-tab-${t.id}`}
              type="button"
              onClick={() => selectTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                selected
                  ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                  : 'text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]'
              }`}
            >
              {t.icon && <span aria-hidden="true">{t.icon}</span>}
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

      <div
        role="tabpanel"
        id={`${idPrefix}-panel-${active}`}
        aria-labelledby={`${idPrefix}-tab-${active}`}
        className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 md:p-5"
      >
        {renderPanel()}
      </div>
    </div>
  );
}
