'use client';
import { useEffect, useRef, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from './utils/useFocusTrap';
import { useReducedMotion } from './utils/useReducedMotion';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
}

export function Modal({ open, onClose, title, children, size = 'md', className = '' }: ModalProps) {
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Small delay to let AnimatePresence mount before focusing
    const raf = requestAnimationFrame(() => modalRef.current?.focus());
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

  const duration = reduced ? 0 : 0.2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ui-overlay)] backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="presentation"
        >
          <motion.div
            ref={modalRef}
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={reduced ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration, ease: [0, 0, 0.2, 1] }}
            className={`w-full ${sizeClasses[size]} mx-4 max-h-[90dvh] overflow-y-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 sm:p-6 shadow-2xl outline-none ${className}`}
            style={{ maxHeight: '90dvh' }}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 id={titleId} className="text-lg font-semibold text-[var(--ui-text)]">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-2 text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
