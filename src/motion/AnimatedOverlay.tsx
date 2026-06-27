'use client';
import '../ui-classes.css';
import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';
import { transitions, variants, durations } from './tokens';

interface AnimatedOverlayProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Animated backdrop overlay for Modal, Drawer, Sheet.
 * Fades in/out with blur. Used inside AnimatePresence.
 */
export function AnimatedOverlay({ children, onClick, className = '' }: AnimatedOverlayProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={variants.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={reduced ? { duration: durations.instant } : transitions.overlay}
      className={`fixed inset-0 gu-bg-overlay backdrop-blur-sm ${className}`}
      onClick={onClick}
      role="presentation"
    >
      {children}
    </motion.div>
  );
}
