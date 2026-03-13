import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingCardProps {
  name: string;
  price: number | string;
  currency?: string;
  period?: string;
  description?: string;
  features?: PricingFeature[];
  badge?: string;
  highlighted?: boolean;
  ctaLabel?: string;
  ctaLoading?: boolean;
  ctaDisabled?: boolean;
  onSelect?: () => void;
  /** Custom content below the CTA */
  footer?: ReactNode;
  className?: string;
}

/* ─── PricingCard ─────────────────────────────────────────────────────── */

export function PricingCard({
  name,
  price,
  currency = '€',
  period = '/mes',
  description,
  features = [],
  badge,
  highlighted = false,
  ctaLabel = 'Empezar',
  ctaLoading = false,
  ctaDisabled = false,
  onSelect,
  footer,
  className = '',
}: PricingCardProps) {
  const priceStr =
    typeof price === 'number'
      ? price === 0
        ? 'Gratis'
        : `${currency}${price}`
      : price;

  return (
    <article
      aria-label={`Plan ${name}`}
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] shadow-[0_0_0_4px_var(--ui-primary-soft)]'
          : 'border-[var(--ui-border)] bg-[var(--ui-surface)]'
      } ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[var(--ui-primary)] px-3 py-1 text-xs font-semibold text-[var(--ui-surface)]">
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
          {name}
        </h3>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-4xl font-bold tabular-nums text-[var(--ui-text)]">{priceStr}</span>
          {typeof price === 'number' && price > 0 && (
            <span className="mb-1 text-sm text-[var(--ui-text-muted)]">{period}</span>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-[var(--ui-text-secondary)]">{description}</p>
        )}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onSelect}
        disabled={ctaDisabled || ctaLoading}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-50 ${
          highlighted
            ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)] hover:bg-[var(--ui-primary-hover)]'
            : 'border border-[var(--ui-border)] bg-transparent text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
        }`}
      >
        {ctaLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {ctaLabel}
      </button>

      {/* Features */}
      {features.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2" aria-label={`Características del plan ${name}`}>
          {features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2.5">
              {feat.included ? (
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ui-success)]"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ui-text-muted)]"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 6L6 10M6 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              <span
                className={`text-sm ${
                  feat.included ? 'text-[var(--ui-text-secondary)]' : 'text-[var(--ui-text-muted)] line-through'
                }`}
                title={feat.tooltip}
              >
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {footer && <div className="mt-4 border-t border-[var(--ui-border)] pt-4">{footer}</div>}
    </article>
  );
}
