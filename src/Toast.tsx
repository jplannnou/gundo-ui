import { useEffect, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  children: ReactNode;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const typeStyles: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'var(--ui-success-soft)', border: 'var(--ui-success)', color: 'var(--ui-success)' },
  error:   { bg: 'var(--ui-error-soft)',   border: 'var(--ui-error)',   color: 'var(--ui-error)' },
  warning: { bg: 'var(--ui-warning-soft)', border: 'var(--ui-warning)', color: 'var(--ui-warning)' },
  info:    { bg: 'var(--ui-info-soft)',    border: 'var(--ui-info)',    color: 'var(--ui-info)' },
};

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /><line x1="12" y1="12" x2="12" y2="17" />
    </svg>
  ),
};

export function Toast({ type = 'info', children, onClose, duration = 4000, className = '' }: ToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!onClose || duration <= 0 || paused) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration, paused]);

  const s = typeStyles[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out] ${className}`}
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color, border: '1px solid' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ border: '1px solid currentColor' }}
      >
        {typeIcons[type]}
      </span>
      <span className="flex-1" style={{ color: 'var(--ui-text)' }}>{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
