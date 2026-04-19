import type { ReactNode } from 'react';
import { MatchScoreRing } from './MatchScoreRing';
import { ExplainabilityBadge, type ExplainabilityTag, type ExplainabilityTone } from './ExplainabilityBadge';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ExplainabilityProductReason {
  reason: string;
  tags?: ExplainabilityTag[];
  tone?: ExplainabilityTone;
  score?: number;
}

export interface ExplainabilityProduct {
  ean: string;
  name: string;
  brand?: string;
  price: number | string;
  currency?: string;
  image?: string;
  imageAlt?: string;
  /** Match score 0-100 */
  matchScore?: number;
  /** Array of reasons (1-3 shown) */
  reasons?: ExplainabilityProductReason[];
  /** Optional tags chip list */
  tags?: string[];
}

export type ExplainabilityProductState =
  | 'match'
  | 'low-match'
  | 'incompatible'
  | 'neutral';

export interface ProductCardWithExplainabilityProps {
  product: ExplainabilityProduct;
  /** Explicit state override. Auto-derived from matchScore if omitted. */
  state?: ExplainabilityProductState;
  /** Replaces default cart button */
  action?: ReactNode;
  onAddToCart?: (ean: string) => void;
  onOpen?: (ean: string) => void;
  /** Label for the cart button */
  addToCartLabel?: string;
  isInCart?: boolean;
  /** Extra slot rendered below the main reason */
  footer?: ReactNode;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function deriveState(score?: number): ExplainabilityProductState {
  if (score === undefined) return 'neutral';
  if (score < 25) return 'incompatible';
  if (score < 55) return 'low-match';
  return 'match';
}

function formatPrice(price: number | string, currency = '€'): string {
  if (typeof price === 'string') return price;
  return `${currency}${price.toFixed(2)}`;
}

const stateStyles: Record<
  ExplainabilityProductState,
  { ring: string; badge: string; border: string; label?: string }
> = {
  match: {
    ring: 'var(--ui-success)',
    badge: 'bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
    border: 'border-[var(--ui-border)]',
    label: 'Compatible con vos',
  },
  'low-match': {
    ring: 'var(--ui-warning)',
    badge: 'bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
    border: 'border-[var(--ui-border)]',
    label: 'Match medio',
  },
  incompatible: {
    ring: 'var(--ui-error)',
    badge: 'bg-[var(--ui-error-soft)] text-[var(--ui-error)]',
    border: 'border-[color-mix(in_srgb,var(--ui-error)_30%,transparent)]',
    label: 'No recomendado',
  },
  neutral: {
    ring: 'var(--ui-primary)',
    badge: 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]',
    border: 'border-[var(--ui-border)]',
  },
};

/* ─── ProductCardWithExplainability ──────────────────────────────────── */

export function ProductCardWithExplainability({
  product,
  state,
  action,
  onAddToCart,
  onOpen,
  addToCartLabel = 'Añadir',
  isInCart = false,
  footer,
  className = '',
}: ProductCardWithExplainabilityProps) {
  const resolvedState = state ?? deriveState(product.matchScore);
  const styles = stateStyles[resolvedState];
  const mainReason = product.reasons?.[0];
  const isIncompatible = resolvedState === 'incompatible';

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-[var(--ui-surface)] transition-shadow hover:shadow-[var(--ui-shadow-md)] ${styles.border} ${
        onOpen ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onOpen ? () => onOpen(product.ean) : undefined}
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-[var(--ui-surface-raised)]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt ?? product.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isIncompatible ? 'opacity-60 grayscale' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--ui-text-muted)]" aria-hidden="true">
            🛒
          </div>
        )}
        {/* State label */}
        {styles.label && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}
          >
            {styles.label}
          </span>
        )}
        {/* Match ring */}
        {typeof product.matchScore === 'number' && (
          <div className="absolute right-2 top-2 rounded-full bg-[var(--ui-surface)] p-1 shadow-[var(--ui-shadow-sm)]">
            <MatchScoreRing
              score={product.matchScore}
              size="sm"
              color={styles.ring}
              hideValue={false}
              disableAnimation={false}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">
            {product.brand}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ui-text)]">
          {product.name}
        </h3>

        {mainReason && (
          <ExplainabilityBadge
            reason={mainReason.reason}
            tags={mainReason.tags}
            tone={mainReason.tone ?? (resolvedState === 'incompatible' ? 'warning' : 'success')}
            score={mainReason.score}
            compact
          />
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--ui-surface-hover)] px-2 py-0.5 text-[10px] text-[var(--ui-text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {footer}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-bold tabular-nums text-[var(--ui-text)]">
            {formatPrice(product.price, product.currency)}
          </span>
          {action ?? (
            <button
              type="button"
              disabled={isIncompatible && !isInCart}
              onClick={(e) => {
                e.stopPropagation();
                if (!isIncompatible) onAddToCart?.(product.ean);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                isInCart
                  ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
                  : isIncompatible
                    ? 'cursor-not-allowed bg-[var(--ui-surface-hover)] text-[var(--ui-text-muted)]'
                    : 'bg-[var(--ui-primary)] text-[var(--ui-surface)] hover:bg-[var(--ui-primary-hover)]'
              }`}
              aria-label={
                isIncompatible
                  ? `${product.name} no recomendado`
                  : isInCart
                    ? 'En el carrito'
                    : `${addToCartLabel} ${product.name}`
              }
            >
              {isIncompatible ? 'No recomendado' : isInCart ? 'Añadido' : addToCartLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
