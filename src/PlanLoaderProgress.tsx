import type { ReactNode } from 'react';
import { PlanLoaderStep } from './PlanLoaderStep';
import {
  PLAN_COMPONENT_NAMES,
  PLAN_COMPONENT_LABELS_ES,
  PLAN_COMPONENT_LABELS_EN,
  computeProgress,
  type PlanComponentName,
  type PlanComponentStatus,
  type PlanComponentStatusMap,
} from './PlanTypes';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PlanLoaderProgressProps {
  /**
   * Subset of plan doc fields the backend writes during generation.
   * Pass `plan.componentStatus`, `plan.progress`, `plan.componentErrors`.
   */
  componentStatus?: PlanComponentStatusMap;
  componentErrors?: Partial<Record<PlanComponentName, string>>;
  /** 0..1. If omitted, computed from componentStatus. */
  progress?: number;
  /** Locale for default labels. Override with `customLabels` for full control. */
  locale?: 'es' | 'en';
  /** Custom labels per component, overrides locale defaults. */
  customLabels?: Partial<Record<PlanComponentName, string>>;
  /**
   * Custom data preview per completed step. Use this to render the actual
   * data the backend produced (e.g. "12 factores detectados" once the medical
   * profile step completes). Honest UX hinges on this.
   */
  dataPreviews?: Partial<Record<PlanComponentName, ReactNode>>;
  /** Hide steps with status='pending'. Default false (show all so user sees full plan). */
  hidePending?: boolean;
  /** Skip rendering specific steps (intermediate phases without UI value). */
  excludeSteps?: PlanComponentName[];
  /** Title shown above the step list. */
  title?: ReactNode;
  /** Subtitle / description below the title. */
  subtitle?: ReactNode;
  /** Footer slot (e.g. CTA "Te avisamos por email", or estimated time). */
  footer?: ReactNode;
  /** Animate the in-flight step indicator. Default true. */
  animate?: boolean;
  className?: string;
}

/* ─── Progress bar ───────────────────────────────────────────────────── */

function ProgressBar({ value, animate }: { value: number; animate: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso de generación del plan"
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]"
    >
      <div
        className={`h-full rounded-full bg-[var(--ui-primary)] ${animate ? 'transition-[width] duration-700 ease-out' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ─── PlanLoaderProgress ─────────────────────────────────────────────── */

/**
 * Orchestrates the live-construction loader for nutritional plan generation.
 *
 * Reads `componentStatus` from the plan doc (written incrementally by the
 * Mastra workflow checkpoint steps) and renders one row per step, with the
 * actual data the backend produced once each step completes.
 *
 * Designed to replace the "fake-progress" modal that just spins for 40min.
 * Honest UX is the point: every step shown is a real workflow phase, and
 * once completed, the data preview slot shows the real result.
 *
 * Mobile-first: stack vertical, hides intermediate phases by default if
 * `excludeSteps` is passed.
 */
export function PlanLoaderProgress({
  componentStatus,
  componentErrors,
  progress,
  locale = 'es',
  customLabels,
  dataPreviews,
  hidePending = false,
  excludeSteps,
  title,
  subtitle,
  footer,
  animate = true,
  className = '',
}: PlanLoaderProgressProps) {
  const defaultLabels = locale === 'en' ? PLAN_COMPONENT_LABELS_EN : PLAN_COMPONENT_LABELS_ES;
  const computedProgress = progress ?? computeProgress(componentStatus);
  const exclude = new Set(excludeSteps ?? []);

  const visibleSteps = PLAN_COMPONENT_NAMES.filter((name) => !exclude.has(name)).filter((name) => {
    if (!hidePending) return true;
    const s = componentStatus?.[name];
    return s !== undefined && s !== 'pending';
  });

  return (
    <section
      className={`flex flex-col gap-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 sm:p-6 ${className}`}
      aria-busy={computedProgress < 1}
    >
      {(title || subtitle) && (
        <header className="flex flex-col gap-1">
          {title && (
            <h2 className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--ui-text-secondary)]">{subtitle}</p>
          )}
        </header>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={computedProgress} animate={animate} />
        </div>
        <span
          className="shrink-0 text-xs font-semibold tabular-nums text-[var(--ui-text-secondary)]"
          aria-hidden="true"
        >
          {Math.round(computedProgress * 100)}%
        </span>
      </div>

      <ol className="flex flex-col gap-0 divide-y divide-[var(--ui-border)]/40">
        {visibleSteps.map((name) => {
          const status: PlanComponentStatus = componentStatus?.[name] ?? 'pending';
          const label = customLabels?.[name] ?? defaultLabels[name];
          return (
            <PlanLoaderStep
              key={name}
              id={name}
              title={label}
              status={status}
              dataPreview={dataPreviews?.[name]}
              errorMessage={componentErrors?.[name]}
              animate={animate}
            />
          );
        })}
      </ol>

      {footer && (
        <footer className="pt-2 border-t border-[var(--ui-border)]/40">
          {footer}
        </footer>
      )}
    </section>
  );
}
