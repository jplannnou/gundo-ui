import { useEffect, useRef, useId, type ReactNode } from 'react';
import { useFocusTrap } from './utils/useFocusTrap';

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

  useFocusTrap(sheetRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    sheetRef.current?.focus();
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
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const isLeft = side === 'left';

  return (
    <div className="fixed inset-0 z-[var(--ui-z-modal)] flex" role="presentation">
      <div
        className="absolute inset-0 bg-[var(--ui-overlay)] backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative flex h-full w-full ${sizeStyles[size]} flex-col border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl outline-none ${
          isLeft ? 'mr-auto border-r' : 'ml-auto border-l'
        } ${className}`}
      >
        {(title || description) && (
          <div className="shrink-0 border-b border-[var(--ui-border)] px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                {title && <h2 id={titleId} className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>}
                {description && <p id={descId} className="mt-1 text-sm text-[var(--ui-text-secondary)]">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
