'use client';
import { useState, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from './utils/useReducedMotion';

export interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--ui-surface)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--ui-surface)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--ui-surface)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--ui-surface)] border-y-transparent border-l-transparent',
  };

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: reducedMotion ? 0 : 0.15,
              ease: 'easeOut',
            }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none whitespace-nowrap max-w-xs`}
          >
            <span className="block bg-[var(--ui-surface)] text-[var(--ui-text)] text-xs rounded-lg px-3 py-2 shadow-lg border border-[var(--ui-border)] whitespace-normal">
              {text}
            </span>
            <span className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
