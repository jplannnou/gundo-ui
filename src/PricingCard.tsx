import './ui-classes.css';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

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
  /**
   * Use the display font (Quicksand) for the price. Recommended for B2C/marketing
   * pricing surfaces; dashboards keep default Montserrat for data-density.
   */
  display?: boolean;
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
  display = false,
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
          ? 'gu-border-primary gu-bg-primary-soft shadow-[0_0_0_4px_var(--ui-primary-soft)]'
          : 'gu-border-border gu-bg-surface'
      } ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full gu-bg-primary px-3 py-1 text-xs font-semibold gu-text-surface">
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold gu-text-text-secondary">
          {name}
        </h3>
        <div className="mt-2 flex items-end gap-1">
          <span
            className={`text-4xl font-bold tabular-nums gu-text-text ${display ? 'gu-font-font-display' : ''}`}
          >
            {priceStr}
          </span>
          {typeof price === 'number' && price > 0 && (
            <span className="mb-1 text-sm gu-text-text-secondary">{period}</span>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm gu-text-text-secondary">{description}</p>
        )}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onSelect}
        disabled={ctaDisabled || ctaLoading}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary focus-visible:ring-offset-2 gu-fv-ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 ${
          highlighted
            ? 'gu-bg-primary gu-text-surface gu-h-bg-primary-hover'
            : 'border gu-border-border bg-transparent gu-text-text gu-h-bg-surface-hover'
        }`}
      >
        {ctaLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
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
                  className="mt-0.5 h-4 w-4 shrink-0 gu-text-success"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 gu-text-text-muted"
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
                  feat.included ? 'gu-text-text-secondary' : 'gu-text-text-secondary line-through opacity-60'
                }`}
                title={feat.tooltip}
              >
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {footer && <div className="mt-4 border-t gu-border-border pt-4">{footer}</div>}
    </article>
  );
}
