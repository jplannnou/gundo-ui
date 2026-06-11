'use client';
import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

export interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Direction the content slides in from (default `up` = slides upward into place) */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Delay in seconds before the reveal starts once in view */
  delay?: number;
  /** Duration in seconds (default 0.4 — matches --ui-duration-reveal) */
  duration?: number;
}

const offsets = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

/**
 * Reveals content with a fade + slide + subtle scale when it enters the
 * viewport (once). Ported from Gundo Vida landing animations.
 *
 * The `animate` object always resolves — never `undefined` — so content can
 * never get stuck invisible if the intersection observer misses (deep-link
 * scroll, lazy mount, etc.). With `prefers-reduced-motion` the children render
 * statically without any wrapper animation.
 */
export function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.4,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.96, ...offset }}
      animate={{
        opacity: isInView ? 1 : 0,
        scale: isInView ? 1 : 0.96,
        x: isInView ? 0 : offset.x,
        y: isInView ? 0 : offset.y,
      }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
