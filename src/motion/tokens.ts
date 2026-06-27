/**
 * Motion tokens — the single source of animation vocabulary for @gundo/ui.
 *
 * Every animated component references these instead of inlining magic numbers,
 * so the whole system shares one feel and can be re-tuned from this one file.
 * Components must still gate motion behind `useReducedMotion()` — these tokens
 * describe *how* things move, not *whether* they should.
 */

/** Cubic-bezier control points (`p1x, p1y, p2x, p2y`) for Motion's `ease`. */
type Bezier = [number, number, number, number];

/** Named easing curves — the shared feel across the system. */
export const easing = {
  /** Standard decelerate — entrances, content settling into place. */
  out: [0, 0, 0.2, 1] as Bezier,
  /** Expressive decelerate — scroll reveals, hero moments. */
  reveal: [0.22, 1, 0.36, 1] as Bezier,
  /** Symmetric — looping/decorative motion (bob, glow). */
  inOut: [0.4, 0, 0.2, 1] as Bezier,
};

/** Durations in seconds. Plural to avoid shadowing the common `duration` prop. */
export const durations = {
  instant: 0,
  /** Overlays, micro-feedback. */
  fast: 0.2,
  /** Default enter/exit. */
  base: 0.3,
  /** Scroll reveals. */
  reveal: 0.4,
  slow: 0.6,
  /** Number count-up. */
  count: 1.5,
  /** Decorative infinite loops. */
  float: 3,
} as const;

/** Spring presets for physics-based motion. */
export const spring = {
  /** Smooth, non-bouncy — count-ups, value changes. */
  count: { stiffness: 50, damping: 30 },
  /** Bouncy — celebratory pops (success, unlock, scan complete). */
  celebrate: { stiffness: 320, damping: 18, mass: 0.9 },
} as const;

/** Composed transition presets — spread straight into `transition={...}`. */
export const transitions = {
  /** Default entrance (fade + slide). */
  enter: { duration: durations.base, ease: easing.out },
  /** Quick content / micro transitions. */
  content: { duration: durations.fast, ease: easing.out },
  /** Scroll reveal. */
  reveal: { duration: durations.reveal, ease: easing.reveal },
  /** Backdrop / overlay fade. */
  overlay: { duration: durations.fast, ease: easing.out },
} as const;

/** Reusable Motion `variants` for the most common enter/exit patterns. */
export const variants = {
  /** Fade + slide up; pass the slide distance in px (default 12). */
  fadeInUp: (y: number = 12) => ({
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0 },
  }),
  /** Opacity-only backdrop with exit (for AnimatePresence). */
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
};
