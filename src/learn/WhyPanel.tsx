'use client';
import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Where a personalization signal comes from — GUNDO's data sources. */
export type WhySignalSource =
  | 'blood'
  | 'urine'
  | 'nutrigenetic'
  | 'microbiota'
  | 'profile'
  | 'goal'
  | 'checkin';

export type WhySignalImpact = 'positive' | 'caution' | 'negative';

export interface WhySignalAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * One reason behind a recommendation. The unified "why" contract used
 * across every GUNDO product: each result explains where it comes from
 * (`source` + `evidence`) and leads to an action (`action`).
 */
export interface WhySignal {
  source: WhySignalSource;
  /** One-line human reason (host-provided, REAL data only) */
  label: string;
  /** Expanded detail, e.g. "Ferritina 28 ng/mL (rango óptimo 50-150)" */
  evidence?: string;
  impact?: WhySignalImpact;
  /** Next step the signal leads to */
  action?: WhySignalAction;
}

export interface WhyPanelProps {
  signals: WhySignal[];
  /** `stack` = vertical list (default); `inline` = wrapping pills */
  layout?: 'stack' | 'inline';
  /** Override default per-source icons */
  renderSourceIcon?: (source: WhySignalSource) => ReactNode;
  /** Accessible name for the signals list (host copy) */
  ariaLabel?: string;
  className?: string;
}

/* ─── Defaults ───────────────────────────────────────────────────────── */

const defaultIcons: Record<WhySignalSource, string> = {
  blood: '🩸',
  urine: '💧',
  nutrigenetic: '🧬',
  microbiota: '🦠',
  profile: '👤',
  goal: '🎯',
  checkin: '📝',
};

const impactStyles: Record<
  WhySignalImpact | 'neutral',
  { color: string; soft: string }
> = {
  positive: { color: 'var(--ui-success)', soft: 'var(--ui-success-soft)' },
  caution: { color: 'var(--ui-warning)', soft: 'var(--ui-warning-soft)' },
  negative: { color: 'var(--ui-error)', soft: 'var(--ui-error-soft)' },
  neutral: { color: 'var(--ui-info)', soft: 'var(--ui-info-soft)' },
};

/* ─── Signal row ─────────────────────────────────────────────────────── */

function WhySignalRow({
  signal,
  renderSourceIcon,
}: {
  signal: WhySignal;
  renderSourceIcon?: (source: WhySignalSource) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const detailId = useId();
  const expandable = Boolean(signal.evidence || signal.action);
  const tone = impactStyles[signal.impact ?? 'neutral'];

  const icon = renderSourceIcon ? (
    renderSourceIcon(signal.source)
  ) : (
    <span aria-hidden="true">{defaultIcons[signal.source]}</span>
  );

  const pillInner = (
    <>
      <span className="shrink-0 text-base leading-none">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-[var(--ui-text)]">
        {signal.label}
      </span>
      {expandable && (
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-[var(--ui-text-secondary)] transition-transform ${
            reduced ? '' : 'duration-[var(--ui-duration-normal)]'
          } ${expanded ? 'rotate-180' : ''}`}
        />
      )}
    </>
  );

  const pillClass =
    'flex w-full min-h-[44px] items-center gap-2.5 rounded-full border px-4 py-2';

  return (
    <li className="flex flex-col">
      {expandable ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={detailId}
          className={`${pillClass} transition-colors hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]`}
          /* color inline too: native <button> doesn't inherit text color, and
             the -soft backgrounds are alpha over the page surface — this keeps
             contrast correct even where Tailwind isn't processed */
          style={{ background: tone.soft, borderColor: tone.color, color: 'var(--ui-text)' }}
        >
          {pillInner}
        </button>
      ) : (
        <span
          className={pillClass}
          style={{ background: tone.soft, borderColor: tone.color, color: 'var(--ui-text)' }}
        >
          {pillInner}
        </span>
      )}

      {expandable && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={detailId}
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: [0, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mx-3 mt-1.5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3"
                style={{ borderLeftColor: tone.color, borderLeftWidth: 3 }}
              >
                {signal.evidence && (
                  <p className="text-sm leading-relaxed text-[var(--ui-text)]">
                    {signal.evidence}
                  </p>
                )}
                {signal.action &&
                  (signal.action.href ? (
                    <a
                      href={signal.action.href}
                      onClick={signal.action.onClick}
                      className="mt-2 inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ui-primary)] underline-offset-2 transition-colors hover:bg-[var(--ui-surface-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
                    >
                      {signal.action.label} →
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={signal.action.onClick}
                      className="mt-2 inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ui-primary)] underline-offset-2 transition-colors hover:bg-[var(--ui-surface-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
                    >
                      {signal.action.label} →
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

/* ─── WhyPanel ───────────────────────────────────────────────────────── */

/**
 * The unified cross-product "why" panel. Renders one pill per signal
 * (source icon + one-line reason); pills with `evidence`/`action` expand
 * to show the underlying data and a CTA.
 *
 * Philosophy: every recommendation must explain where it comes from and
 * lead to an action — no black boxes, no invented data.
 *
 * Supersedes `RecipeReasoningPills` (kept as-is for recipes; new surfaces
 * should use WhyPanel).
 */
export function WhyPanel({
  signals,
  layout = 'stack',
  renderSourceIcon,
  ariaLabel,
  className = '',
}: WhyPanelProps) {
  if (signals.length === 0) return null;

  return (
    <ul
      aria-label={ariaLabel}
      className={`flex gap-2 ${
        layout === 'inline' ? 'flex-row flex-wrap items-start' : 'flex-col'
      } ${className}`}
    >
      {signals.map((signal, i) => (
        <WhySignalRow
          key={`${signal.source}-${i}`}
          signal={signal}
          renderSourceIcon={renderSourceIcon}
        />
      ))}
    </ul>
  );
}
