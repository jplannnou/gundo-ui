'use client';
import './ui-classes.css';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { Button } from './Button';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface NextStepBannerProgress {
  /** Current step, 1-based. Clamped to `0..total`. */
  current: number;
  /** Total number of steps. */
  total: number;
  /** Visible, already translated text, e.g. "Paso 2 de 4". The bars next to it are decorative. */
  label: string;
}

export interface NextStepBannerProps {
  /** The invitation, as the card heading (already localized). */
  title: string;
  /** One supporting line under the title (already localized). */
  description?: string;
  /** Small kicker above the title, e.g. "Siguiente paso" (already localized). */
  eyebrow?: string;
  /** Leading icon (decorative, hidden from assistive tech). */
  icon?: ReactNode;
  /** Label of the primary action (already localized). */
  actionLabel: string;
  /** Called when the primary action is pressed. */
  onAction: () => void;
  /** Label of the secondary "not now" button (already localized). Needs `onDismiss` too. */
  dismissLabel?: string;
  /** Called when the user dismisses the invitation. The button shows only with `dismissLabel` as well. */
  onDismiss?: () => void;
  /** Step indicator. Only the `label` is announced; the segments are `aria-hidden`. */
  progress?: NextStepBannerProgress;
  /** Level of the title heading, so the banner fits the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Up to this many steps the indicator is one segment per step; beyond it, a continuous bar. */
const MAX_SEGMENTS = 12;

const TRACK = 'var(--ui-surface-hover)';
const FILL = 'var(--ui-primary-fill)';

function ProgressBars({ current, total }: Pick<NextStepBannerProgress, 'current' | 'total'>) {
  if (!(total > 0)) return null;
  const done = Math.max(0, Math.min(total, current));

  if (total <= MAX_SEGMENTS) {
    return (
      <span aria-hidden="true" className="flex w-24 shrink-0 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ backgroundColor: i < done ? FILL : TRACK }}
          />
        ))}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className="block h-1 w-24 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: TRACK }}>
      <span className="block h-full rounded-full" style={{ width: `${(done / total) * 100}%`, backgroundColor: FILL }} />
    </span>
  );
}

/* ─── NextStepBanner ─────────────────────────────────────────────────── */

/**
 * One invitation with a primary action and an optional "not now". Raised card
 * that stacks on mobile (full-width actions) and puts the actions in a row from
 * `sm`. A `<section>` named by its own heading; the buttons are the DS `Button`
 * (primary + ghost). All copy arrives pre-translated through props, and nothing
 * moves, so there is no motion to reduce.
 */
export function NextStepBanner({
  title,
  description,
  eyebrow,
  icon,
  actionLabel,
  onAction,
  dismissLabel,
  onDismiss,
  progress,
  headingLevel = 3,
  className = '',
}: NextStepBannerProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const showDismiss = Boolean(dismissLabel && onDismiss);

  const cardStyle: CSSProperties = {
    border: '1px solid var(--ui-border)',
    borderRadius: 'var(--ui-radius-xl)',
  };

  return (
    <section aria-labelledby={titleId} className={`gu-bg-surface-raised p-4 sm:p-5 ${className}`} style={cardStyle}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center text-xl"
              style={{
                backgroundColor: 'var(--ui-primary-soft)',
                color: 'var(--ui-primary-text)',
                borderRadius: 'var(--ui-radius-full)',
              }}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ui-primary-text)' }}>
                {eyebrow}
              </p>
            )}
            <Heading id={titleId} className="text-base font-semibold leading-snug" style={{ color: 'var(--ui-text)' }}>
              {title}
            </Heading>
            {description && <p className="mt-1 text-sm gu-text-text-secondary">{description}</p>}
          </div>
        </div>

        {progress && (
          <div className="flex items-center gap-3">
            <ProgressBars current={progress.current} total={progress.total} />
            <span className="text-xs font-medium tabular-nums gu-text-text-secondary">{progress.label}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="primary"
            onClick={onAction}
            className="w-full sm:w-auto"
            style={{ minHeight: 44 }}
          >
            {actionLabel}
          </Button>
          {showDismiss && (
            <Button
              type="button"
              variant="ghost"
              onClick={onDismiss}
              className="w-full sm:w-auto"
              style={{ minHeight: 44 }}
            >
              {dismissLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
