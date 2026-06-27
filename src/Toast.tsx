'use client';
import './animations.css';
import { useEffect, useState, type ReactNode } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { useReducedMotion } from './utils/useReducedMotion';

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
  success: <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />,
  error: <X className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />,
  warning: <AlertTriangle className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />,
  info: <Info className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />,
};

export function Toast({ type = 'info', children, onClose, duration = 4000, className = '' }: ToastProps) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!onClose || duration <= 0 || paused) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration, paused]);

  const s = typeStyles[type];
  const showProgress = !!onClose && duration > 0 && !reduced;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${className}`}
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
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      {showProgress && (
        <span
          aria-hidden="true"
          className="gu-toast-progress absolute bottom-0 left-0 h-0.5 w-full opacity-50"
          style={{
            backgroundColor: s.color,
            animationDuration: `${duration}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  );
}
