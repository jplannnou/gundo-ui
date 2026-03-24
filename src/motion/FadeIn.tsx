'use client';
import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

interface FadeInProps {
  children: ReactNode;
  /** Delay in seconds before this item starts animating */
  delay?: number;
  /** Duration in seconds (default 0.3) */
  duration?: number;
  /** Vertical offset in px to slide from (default 12) */
  y?: number;
  className?: string;
}

/**
 * Utility wrapper for staggered list item animations.
 * Usage:
 *   {items.map((item, i) => (
 *     <FadeIn key={item.id} delay={i * 0.05}>
 *       <ItemCard {...item} />
 *     </FadeIn>
 *   ))}
 */
export function FadeIn({ children, delay = 0, duration = 0.3, y = 12, className = '' }: FadeInProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
