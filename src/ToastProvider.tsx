import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toast } from './Toast';

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

let counter = 0;

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((message: ReactNode, opts?: { type?: ToastType; duration?: number }) => {
    const id = `toast-${++counter}`;
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

  const positionClass = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }[position];

  // Determine slide direction based on position
  const isTop = position.startsWith('top');
  const slideY = isTop ? -20 : 20;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={`fixed z-[100] flex flex-col gap-2 ${positionClass}`}
        style={{ maxWidth: '420px', width: '100%', pointerEvents: 'none' }}
      >
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: slideY, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
              style={{ pointerEvents: 'auto' }}
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
