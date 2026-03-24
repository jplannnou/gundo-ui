'use client';
import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Optional wrapper for route-level page transitions.
 * Consumers wrap their page content: <PageTransition><MyPage /></PageTransition>
 * Provides a subtle fade + slide-up on mount.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
