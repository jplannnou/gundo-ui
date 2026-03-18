import { useEffect, useRef, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from './utils/useFocusTrap';
import { useReducedMotion } from './utils/useReducedMotion';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  width?: string;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = 'max-w-md',
  className = '',
}: DrawerProps) {
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const raf = requestAnimationFrame(() => drawerRef.current?.focus());
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
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const slideX = side === 'right' ? '100%' : '-100%';
  const duration = reduced ? 0 : 0.25;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="presentation">
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="absolute inset-0 bg-[var(--ui-overlay)] backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
          />
          {/* Panel */}
          <motion.div
            ref={drawerRef}
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={reduced ? undefined : { x: slideX }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: slideX }}
            transition={{ duration, ease: [0.32, 0.72, 0, 1] }}
            className={`relative flex h-full w-full max-w-full ${width} flex-col border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl outline-none ${
              side === 'left' ? 'mr-auto border-r' : 'ml-auto border-l'
            } ${className}`}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-[var(--ui-border)] px-6 py-4">
                <h2 id={titleId} className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1 text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
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
