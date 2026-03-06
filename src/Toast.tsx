import { useEffect, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  children: ReactNode;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const typeStyles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: 'var(--ui-success-soft)', border: 'var(--ui-success)', color: 'var(--ui-success)', icon: '✓' },
  error:   { bg: 'var(--ui-error-soft)',   border: 'var(--ui-error)',   color: 'var(--ui-error)',   icon: '✕' },
  warning: { bg: 'var(--ui-warning-soft)', border: 'var(--ui-warning)', color: 'var(--ui-warning)', icon: '!' },
  info:    { bg: 'var(--ui-info-soft)',    border: 'var(--ui-info)',    color: 'var(--ui-info)',    icon: 'i' },
};

export function Toast({ type = 'info', children, onClose, duration = 4000, className = '' }: ToastProps) {
  useEffect(() => {
    if (!onClose || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const s = typeStyles[type];

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out] ${className}`}
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color, border: '1px solid' }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ border: '1px solid currentColor' }}
      >
        {s.icon}
      </span>
      <span className="flex-1" style={{ color: 'var(--ui-text)' }}>{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
