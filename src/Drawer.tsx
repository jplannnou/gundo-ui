import { useEffect, useRef, useId, type ReactNode } from 'react';

interface DrawerProps {
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

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    drawerRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
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

  if (!open) return null;

  const slideFrom = side === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--ui-overlay)] backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative ${slideFrom} ml-auto flex h-full w-full max-w-full ${width} flex-col border-l border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl outline-none ${
          side === 'left' ? 'mr-auto ml-0 border-l-0 border-r border-[var(--ui-border)]' : ''
        } ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--ui-border)] px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
