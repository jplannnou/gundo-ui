import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ProductCardProps {
  id?: string;
  name: string;
  brand?: string;
  image?: string;
  imageAlt?: string;
  price?: number | string;
  originalPrice?: number | string;
  currency?: string;
  score?: number;
  tags?: string[];
  description?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 'full' shows description + tags; 'compact' is condensed */
  variant?: 'full' | 'compact';
  /** Custom action slot (overrides default CTA) */
  action?: ReactNode;
  onCardClick?: () => void;
  onAddToCart?: () => void;
  addToCartLabel?: string;
  isInCart?: boolean;
  disabled?: boolean;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const badgeColors: Record<string, string> = {
  primary: 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]',
  success: 'bg-[color-mix(in_srgb,var(--ui-success)_15%,transparent)] text-[var(--ui-success)]',
  warning: 'bg-[color-mix(in_srgb,var(--ui-warning)_15%,transparent)] text-[var(--ui-warning)]',
  danger: 'bg-[color-mix(in_srgb,var(--ui-error)_15%,transparent)] text-[var(--ui-error)]',
  info: 'bg-[color-mix(in_srgb,var(--ui-info)_15%,transparent)] text-[var(--ui-info)]',
};

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--ui-success)';
  if (score >= 50) return 'var(--ui-primary)';
  if (score >= 25) return 'var(--ui-warning)';
  return 'var(--ui-error)';
}

function formatPrice(price: number | string, currency?: string): string {
  if (typeof price === 'string') return price;
  const sym = currency ?? '€';
  return `${sym}${price.toFixed(2)}`;
}

/* ─── ProductCard ─────────────────────────────────────────────────────── */

export function ProductCard({
  name,
  brand,
  image,
  imageAlt,
  price,
  originalPrice,
  currency,
  score,
  tags = [],
  description,
  badge,
  badgeVariant = 'primary',
  variant = 'full',
  action,
  onCardClick,
  onAddToCart,
  addToCartLabel = 'Añadir',
  isInCart = false,
  disabled = false,
  className = '',
}: ProductCardProps) {
  const isCompact = variant === 'compact';

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] transition-shadow hover:shadow-[var(--ui-shadow-md)] ${
        onCardClick && !disabled ? 'cursor-pointer' : ''
      } ${disabled ? 'opacity-50' : ''} ${className}`}
      onClick={!disabled && onCardClick ? onCardClick : undefined}
      aria-label={name}
    >
      {/* Image */}
      {image ? (
        <div
          className={`relative overflow-hidden bg-[var(--ui-surface-raised)] ${isCompact ? 'h-32' : 'h-44'}`}
        >
          <img
            src={image}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
          {score !== undefined && (
            <span
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[var(--ui-surface)] text-xs font-bold tabular-nums"
              style={{ borderColor: scoreColor(score), color: scoreColor(score) }}
              aria-label={`Puntuación: ${score}`}
            >
              {score}
            </span>
          )}
        </div>
      ) : (
        <div
          className={`flex items-center justify-center bg-[var(--ui-surface-raised)] ${isCompact ? 'h-32' : 'h-44'}`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
            className="text-[var(--ui-text-muted)]"
          >
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="15" cy="15" r="2" fill="currentColor" />
            <path d="M8 26l8-8 5 5 4-4 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          {badge && (
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
          {score !== undefined && (
            <span
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[var(--ui-surface)] text-xs font-bold tabular-nums"
              style={{ borderColor: scoreColor(score), color: scoreColor(score) }}
              aria-label={`Puntuación: ${score}`}
            >
              {score}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-1 flex-col gap-2 ${isCompact ? 'p-3' : 'p-4'}`}>
        {brand && (
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">
            {brand}
          </p>
        )}
        <h3
          className={`font-semibold leading-snug text-[var(--ui-text)] ${isCompact ? 'text-sm' : 'text-base'} line-clamp-2`}
        >
          {name}
        </h3>

        {!isCompact && description && (
          <p className="line-clamp-2 text-xs text-[var(--ui-text-secondary)]">{description}</p>
        )}

        {!isCompact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--ui-surface-hover)] px-2 py-0.5 text-xs text-[var(--ui-text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: price + action */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div>
            {price !== undefined && (
              <span
                className={`font-bold tabular-nums text-[var(--ui-text)] ${isCompact ? 'text-sm' : 'text-base'}`}
              >
                {formatPrice(price, currency)}
              </span>
            )}
            {originalPrice !== undefined && price !== originalPrice && (
              <span className="ml-1.5 text-xs text-[var(--ui-text-muted)] line-through tabular-nums">
                {formatPrice(originalPrice, currency)}
              </span>
            )}
          </div>

          {action ??
            (onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onAddToCart();
                }}
                disabled={disabled}
                aria-label={isInCart ? 'En el carrito' : `${addToCartLabel} ${name}`}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInCart
                    ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
                    : 'bg-[var(--ui-primary)] text-[var(--ui-surface)] hover:bg-[var(--ui-primary-hover)]'
                }`}
              >
                {isInCart ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M6 2v8M2 6h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {isInCart ? 'Añadido' : addToCartLabel}
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}