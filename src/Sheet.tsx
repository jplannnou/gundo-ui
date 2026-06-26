'use client';
import './ui-classes.css';
import { useEffect, useRef, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from './utils/useFocusTrap';
import { useReducedMotion } from './utils/useReducedMotion';

type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  size?: SheetSize;
  className?: string;
}

const sizeStyles: Record<SheetSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  className = '',
}: SheetProps) {
  const titleId = useId();
  const descId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useFocusTrap(sheetRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const raf = requestAnimationFrame(() => sheetRef.current?.focus());
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handler);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isLeft = side === 'left';
  const slideX = isLeft ? '-100%' : '100%';
  const duration = reduced ? 0 : 0.25;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 gu-z-z-modal flex" role="presentation">
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="absolute inset-0 gu-bg-overlay backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
          />
          <motion.div
            ref={sheetRef}
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={reduced ? undefined : { x: slideX }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: slideX }}
            transition={{ duration, ease: [0.32, 0.72, 0, 1] }}
            className={`relative flex h-full w-full ${sizeStyles[size]} flex-col gu-border-border gu-bg-surface shadow-2xl outline-none ${
              isLeft ? 'mr-auto border-r' : 'ml-auto border-l'
            } ${className}`}
          >
            {(title || description) && (
              <div className="shrink-0 border-b gu-border-border px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    {title && <h2 id={titleId} className="text-lg font-semibold gu-text-text">{title}</h2>}
                    {description && <p id={descId} className="mt-1 text-sm gu-text-text-secondary">{description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-md p-1 gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
