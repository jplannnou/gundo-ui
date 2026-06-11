'use client';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface FeatureHighlightProps {
  /** The feature being highlighted */
  children: ReactNode;
  /** Badge copy, e.g. "Nuevo" / "Tip" (host-provided — no baked strings) */
  badge: ReactNode;
  /**
   * Persistence is delegated: the host owns the dismiss key (localStorage,
   * user-context...). When `seen` is true only `children` render.
   */
  seen: boolean;
  /** Fired when the user dismisses the badge (click) */
  onSeen: () => void;
  /** Accessible label for the dismiss button (host copy, e.g. "Entendido") */
  dismissLabel: string;
  /** Badge corner (default `top-right`) */
  placement?: 'top-right' | 'top-left';
  className?: string;
}

/* ─── FeatureHighlight ───────────────────────────────────────────────── */

/**
 * Marks an element with a pulsing "Nuevo"/"Tip" badge. The pulse runs
 * exactly 2 cycles and stops — attention is borrowed, not hijacked.
 * Clicking the badge marks it as seen (host persists via `onSeen`).
 *
 * `prefers-reduced-motion`: static badge, no pulse.
 */
export function FeatureHighlight({
  children,
  badge,
  seen,
  onSeen,
  dismissLabel,
  placement = 'top-right',
  className = '',
}: FeatureHighlightProps) {
  const reduced = useReducedMotion();

  if (seen) {
    return <>{children}</>;
  }

  const cornerClass = placement === 'top-left' ? '-left-2 -top-2' : '-right-2 -top-2';

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <span className={`absolute z-10 ${cornerClass}`}>
        {/* Pulse ring — 2 cycles, then stops (decorative) */}
        {!reduced && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[var(--ui-primary)]"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{
              duration: 1,
              repeat: 1,
              repeatDelay: 0.3,
              ease: 'easeOut',
            }}
          />
        )}
        {/* Visual badge stays small; padding + negative margin extend the
            touch target to >=44px without inflating the visual */}
        <button
          type="button"
          onClick={onSeen}
          aria-label={dismissLabel}
          className="relative -m-[12px] inline-flex cursor-pointer rounded-full border-0 bg-transparent p-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
        >
          <motion.span
            initial={false}
            animate={reduced ? { scale: 1 } : { scale: [1, 1.12, 1, 1.12, 1] }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="inline-flex items-center rounded-full bg-[var(--ui-primary)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--ui-surface)] shadow-[var(--ui-shadow-sm)]"
          >
            {badge}
          </motion.span>
        </button>
      </span>
    </span>
  );
}
