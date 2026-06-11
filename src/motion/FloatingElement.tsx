'use client';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

export interface FloatingElementProps {
  children: ReactNode;
  /** Vertical float distance in px (default 8) */
  amplitude?: number;
  /** Full float cycle duration in seconds (default 3) */
  duration?: number;
  /** Delay in seconds before the float starts */
  delay?: number;
  className?: string;
}

/**
 * Gentle infinite float (bob + micro-rotation) for decorative elements like
 * illustrations or icons. Ported from Gundo Vida landing animations.
 *
 * Decorative only — never wrap interactive controls or reading text in it.
 * With `prefers-reduced-motion` the children render statically.
 */
export function FloatingElement({
  children,
  amplitude = 8,
  duration = 3,
  delay = 0,
  className = '',
}: FloatingElementProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
        rotate: [0, 1.5, -1.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
