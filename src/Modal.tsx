'use client';
import './ui-classes.css';
import { useEffect, useRef, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from './utils/useFocusTrap';
import { useReducedMotion } from './utils/useReducedMotion';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * `center` — classic centered dialog (default).
 * `bottom-sheet` — anchored to the bottom edge on mobile (thumb-reach, slides
 * up) and centered on desktop (≥sm). Same focus-trap / ESC / scroll-lock.
 */
type ModalPlacement = 'center' | 'bottom-sheet';

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
  placement?: ModalPlacement;
  className?: string;
}

export function Modal({ open, onClose, title, children, size = 'md', placement = 'center', className = '' }: ModalProps) {
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Lock body scroll while the modal is open. Preserves any inline value
    // already set so we don't overwrite host-page customizations.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Small delay to let AnimatePresence mount before focusing
    const raf = requestAnimationFrame(() => modalRef.current?.focus());
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const duration = reduced ? 0 : 0.2;
  const isSheet = placement === 'bottom-sheet';

  // On mobile a bottom-sheet rises from the bottom edge; on desktop it falls
  // back to the centered scale+fade. `center` keeps the original behavior.
  const panelInitial = reduced
    ? undefined
    : isSheet
      ? { opacity: 0, y: 32 }
      : { opacity: 0, scale: 0.95, y: 10 };
  const panelExit = panelInitial;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className={`fixed inset-0 flex justify-center gu-bg-overlay backdrop-blur-sm ${isSheet ? 'items-end sm:items-center' : 'items-center'}`}
          style={{ zIndex: 'var(--ui-z-modal)' }}
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
            initial={panelInitial}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={panelExit}
            transition={{ duration, ease: [0, 0, 0.2, 1] }}
            className={`w-full ${sizeClasses[size]} max-h-[90dvh] overflow-y-auto border gu-border-border gu-bg-surface p-4 sm:p-6 shadow-2xl outline-none ${isSheet ? 'rounded-t-2xl sm:mx-4 sm:rounded-xl' : 'mx-4 rounded-xl'} ${className}`}
            style={{ maxHeight: '90dvh' }}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 id={titleId} className="text-lg font-semibold gu-text-text">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-2 gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
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
