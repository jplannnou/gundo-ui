'use client';
import '../ui-classes.css';
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

  const cornerClass = placement === 'top-left' ? 'left-0 top-0' : 'right-0 top-0';

  return (
    <span className={`relative inline-grid min-h-11 min-w-11 ${className}`}>
      {children}
      <span className={`z-10 col-start-1 row-start-1 ${cornerClass}`}>
        {/* The 44 px hit target stays within the anchored element. Only the
            decorative pulse is clipped, so focus indication remains intact. */}
        <button
          type="button"
          onClick={onSeen}
          aria-label={dismissLabel}
          className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
        >
          {!reduced && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <motion.span
                className="absolute inset-0 rounded-full gu-bg-primary"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: 1,
                  repeatDelay: 0.3,
                  ease: 'easeOut',
                }}
              />
            </span>
          )}
          <span className="relative inline-flex max-w-full overflow-hidden rounded-full">
            <motion.span
              initial={false}
              animate={reduced ? { scale: 1 } : { scale: [1, 1.12, 1, 1.12, 1] }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="inline-flex items-center rounded-full gu-bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide gu-text-surface gu-shadow-shadow-sm"
            >
              {badge}
            </motion.span>
          </span>
        </button>
      </span>
    </span>
  );
}
