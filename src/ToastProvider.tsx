'use client';
import './native-overlays.css';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toast } from './Toast';
import { transitions } from './motion/tokens';
import { OVERLAY_OPEN_EVENT } from './utils/useNativeDialog';

/* ─── Types ────────────────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: ReactNode;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: ReactNode, opts?: { type?: ToastType; duration?: number }) => void;
  success: (message: ReactNode, duration?: number) => void;
  error: (message: ReactNode, duration?: number) => void;
  warning: (message: ReactNode, duration?: number) => void;
  info: (message: ReactNode, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

/* ─── Provider ─────────────────────────────────────────────────────── */

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Per-instance counter avoids cross-instance ID collisions and SSR pitfalls
  // that the previous module-scoped `let counter` would have hit.
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((message: ReactNode, opts?: { type?: ToastType; duration?: number }) => {
    const id = `toast-${++counterRef.current}`;
    const item: ToastItem = {
      id,
      type: opts?.type ?? 'info',
      message,
      duration: opts?.duration ?? 4000,
    };
    setToasts(prev => [...prev.slice(-(maxToasts - 1)), item]);
  }, [maxToasts]);

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg, dur) => addToast(msg, { type: 'success', duration: dur }),
    error: (msg, dur) => addToast(msg, { type: 'error', duration: dur }),
    warning: (msg, dur) => addToast(msg, { type: 'warning', duration: dur }),
    info: (msg, dur) => addToast(msg, { type: 'info', duration: dur }),
    dismiss,
    dismissAll,
  };

  // Inline, not utility classes: a [popover] gets UA `inset: 0`, and only inline
  // style reliably beats it regardless of how the consumer layers its CSS.
  // All four edges are set: the UA's `inset: 0` would otherwise keep the two
  // we leave out pinned to 0.
  const edgeY: CSSProperties = position.startsWith('top')
    ? { top: '1rem', bottom: 'auto' }
    : { top: 'auto', bottom: '1rem' };
  const edgeX: CSSProperties = position.endsWith('right')
    ? { left: 'auto', right: '1rem' }
    : position.endsWith('left')
      ? { left: '1rem', right: 'auto' }
      : { left: '50%', right: 'auto', transform: 'translateX(-50%)' };

  // Determine slide direction based on position
  const isTop = position.startsWith('top');
  const slideY = isTop ? -20 : 20;

  // The toast stack lives in the top layer so a showModal() <dialog> never hides
  // it. Shown while there are toasts; hidden a beat after the last one leaves
  // so its exit animation can finish.
  const layerRef = useRef<HTMLDivElement>(null);
  const hasToasts = toasts.length > 0;
  useLayoutEffect(() => {
    const el = layerRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    const shown = el.matches(':popover-open');
    if (hasToasts) {
      // Top-layer order is open order: a toast added while a modal is open must
      // re-enter above it. (Re-entering restarts the countdown bar, so only do
      // it when there is actually a modal to get above.)
      if (!shown) el.showPopover();
      else if (document.querySelector('dialog:modal')) {
        el.hidePopover();
        el.showPopover();
      }
    }
  }, [hasToasts, toasts]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof el.showPopover !== 'function' || hasToasts) return;
    const t = setTimeout(() => {
      if (el.matches(':popover-open')) el.hidePopover();
    }, 250);
    return () => clearTimeout(t);
  }, [hasToasts]);
  useEffect(() => {
    // A modal that opens AFTER the toasts would cover them.
    const lift = () => {
      const el = layerRef.current;
      if (el && typeof el.showPopover === 'function' && el.matches(':popover-open')) {
        el.hidePopover();
        el.showPopover();
      }
    };
    window.addEventListener(OVERLAY_OPEN_EVENT, lift);
    return () => window.removeEventListener(OVERLAY_OPEN_EVENT, lift);
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        ref={layerRef}
        popover={typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function' ? 'manual' : undefined}
        suppressHydrationWarning
        className="gu-toast-layer fixed flex flex-col gap-2"
        style={{ ...edgeY, ...edgeX, maxWidth: '420px', width: '100%', pointerEvents: 'none', zIndex: 'var(--ui-z-toast)' }}
      >
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: slideY, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={transitions.content}
              drag="x"
              dragSnapToOrigin
              dragElastic={0.6}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) {
                  dismiss(t.id);
                }
              }}
              style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
            >
              <Toast
                type={t.type}
                duration={t.duration}
                onClose={() => dismiss(t.id)}
              >
                {t.message}
              </Toast>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
