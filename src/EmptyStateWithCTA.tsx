import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface EmptyStateCTA {
  label: string;
  onClick: () => void;
}

export interface EmptyStateWithCTAProps {
  /** Optional illustration / emoji / icon */
  illustration?: ReactNode;
  /** Headline */
  title: string;
  /** Description guiding next action */
  description?: string;
  /** Primary CTA (required — every empty state must propose a next action) */
  primaryCta: EmptyStateCTA;
  /** Optional secondary CTA */
  secondaryCta?: EmptyStateCTA;
  /** Variant — `plain` (default), `card` (bordered box), or `fullscreen` */
  variant?: 'plain' | 'card' | 'fullscreen';
  /** Optional tone affects accent color */
  tone?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const toneAccent: Record<NonNullable<EmptyStateWithCTAProps['tone']>, string> = {
  default: 'var(--ui-primary)',
  success: 'var(--ui-success)',
  warning: 'var(--ui-warning)',
  info: 'var(--ui-info)',
};

/* ─── EmptyStateWithCTA ──────────────────────────────────────────────── */

export function EmptyStateWithCTA({
  illustration,
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = 'plain',
  tone = 'default',
  className = '',
}: EmptyStateWithCTAProps) {
  const containerClass =
    variant === 'card'
      ? 'rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-8'
      : variant === 'fullscreen'
        ? 'min-h-[60vh]'
        : '';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${containerClass} ${className}`}
    >
      {illustration && (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{
            background: `color-mix(in srgb, ${toneAccent[tone]} 15%, transparent)`,
            color: toneAccent[tone],
          }}
          aria-hidden="true"
        >
          {illustration}
        </div>
      )}
      <h3 className="max-w-md text-lg font-bold text-[var(--ui-text)]">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-[var(--ui-text-secondary)]">{description}</p>
      )}
      <div className="mt-3 flex flex-col-reverse items-center gap-2 sm:flex-row">
        {secondaryCta && (
          <button
            type="button"
            onClick={secondaryCta.onClick}
            className="rounded-xl border border-[var(--ui-border)] px-4 py-2 text-sm font-medium text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
          >
            {secondaryCta.label}
          </button>
        )}
        <button
          type="button"
          onClick={primaryCta.onClick}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
          style={{ background: toneAccent[tone] }}
        >
          {primaryCta.label}
        </button>
      </div>
    </div>
  );
}
