import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
      className={`fixed inset-0 bg-[var(--ui-overlay)] backdrop-blur-sm ${className}`}
      onClick={onClick}
      role="presentation"
    >
      {children}
    </motion.div>
  );
}
