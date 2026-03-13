import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

const TIER_ORDER: SubscriptionTier[] = ['free', 'basic', 'premium', 'enterprise'];

export interface SubscriptionGateProps {
  /** Whether the current user has access */
  hasAccess?: boolean;
  /** Required minimum tier (used when hasAccess is not provided) */
  requiredTier?: SubscriptionTier;
  /** Current user tier (used with requiredTier) */
  currentTier?: SubscriptionTier;
  /** Content to show when access is granted */
  children: ReactNode;
  /** Custom fallback (overrides default lock UI) */
  fallback?: ReactNode;
  /** Whether to render fallback at all (false = render nothing) */
  showFallback?: boolean;
  /** Title in default fallback */
  lockTitle?: string;
  /** Description in default fallback */
  lockDescription?: string;
  /** CTA label in default fallback */
  ctaLabel?: string;
  /** CTA callback */
  onUpgrade?: () => void;
  /** Blur the children instead of hiding them */
  blurContent?: boolean;
  className?: string;
}

/* ─── SubscriptionGate ────────────────────────────────────────────────── */

export function SubscriptionGate({
  hasAccess,
  requiredTier,
  currentTier,
  children,
  fallback,
  showFallback = true,
  lockTitle = 'Contenido Premium',
  lockDescription = 'Actualiza tu plan para acceder a este contenido.',
  ctaLabel = 'Ver planes',
  onUpgrade,
  blurContent = false,
  className = '',
}: SubscriptionGateProps) {
  // Resolve access
  let canAccess = hasAccess;
  if (canAccess === undefined && requiredTier && currentTier) {
    canAccess =
      TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
  }
  canAccess = canAccess ?? false;

  if (canAccess) return <>{children}</>;

  if (!showFallback) return null;

  if (fallback) return <>{fallback}</>;

  if (blurContent) {
    return (
      <div className={`relative ${className}`}>
        <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <DefaultLockCard
            title={lockTitle}
            description={lockDescription}
            ctaLabel={ctaLabel}
            onUpgrade={onUpgrade}
          />
        </div>
      </div>
    );
  }

  return (
    <DefaultLockCard
      title={lockTitle}
      description={lockDescription}
      ctaLabel={ctaLabel}
      onUpgrade={onUpgrade}
      className={className}
    />
  );
}

/* ─── DefaultLockCard ─────────────────────────────────────────────────── */

interface DefaultLockCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onUpgrade?: () => void;
  className?: string;
}

function DefaultLockCard({
  title,
  description,
  ctaLabel,
  onUpgrade,
  className = '',
}: DefaultLockCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-8 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ui-primary-soft)]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
          className="text-[var(--ui-primary)]"
        >
          <rect
            x="4"
            y="10"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7 10V7a4 4 0 0 1 8 0v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="11" cy="15" r="1" fill="currentColor" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--ui-text)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--ui-text-muted)]">{description}</p>
      </div>
      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="rounded-lg bg-[var(--ui-primary)] px-5 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

/* ─── FreemiumBanner (inline upgrade prompt) ──────────────────────────── */

export interface FreemiumBannerProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function FreemiumBanner({
  title = '¿Quieres más?',
  description = 'Actualiza tu plan para desbloquear todas las funciones.',
  ctaLabel = 'Actualizar plan',
  onUpgrade,
  onDismiss,
  className = '',
}: FreemiumBannerProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] p-4 ${className}`}
      role="banner"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary)] text-[var(--ui-surface)]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 1.9.7-4L2.2 5.2l4-.6L8 1z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--ui-primary)]">{title}</p>
        <p className="text-xs text-[var(--ui-text-secondary)]">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="rounded-lg bg-[var(--ui-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
          >
            {ctaLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded text-[var(--ui-text-muted)] transition-colors hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M9 3L3 9M3 3l6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}