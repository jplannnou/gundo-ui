'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useRef, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useNativeDialog } from './utils/useNativeDialog';

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
  /**
   * Accessible name of the X button. The design system has no i18n of its own,
   * so consumers pass a localized string (e.g. `closeLabel={t('common.close')}`).
   * Defaults to English.
   */
  closeLabel?: string;
}

const sizeStyles: Record<SheetSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

/** Must match the drawer transition in native-overlays.css. */
const EXIT_MS = 250;

/**
 * A native `<dialog>` opened with `showModal()`, pinned to one side. Shares its
 * geometry and lifecycle with Drawer; Sheet adds a size scale and a description.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  className = '',
  closeLabel = 'Close',
}: SheetProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mounted, dialogProps } = useNativeDialog({ ref: dialogRef, open, onClose, exitMs: EXIT_MS });

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      {...dialogProps}
      data-kind="drawer"
      data-side={side}
      // Redundant for a <dialog>, on purpose: see Modal.
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      tabIndex={-1}
      className={`gu-dialog flex max-w-full ${sizeStyles[size]} flex-col gu-border-border gu-bg-surface shadow-2xl outline-none ${
        side === 'left' ? 'border-r' : 'border-l'
      } ${className}`}
    >
      {(title || description) && (
        <div className="shrink-0 border-b gu-border-border px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && <h2 id={titleId} className="text-lg font-semibold gu-text-text">{title}</h2>}
              {description && <p id={descId} className="mt-1 text-sm gu-text-text-secondary">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              // 44x44 hit area (WCAG 2.5.5); -m-2 keeps the previous 28px layout footprint.
              className="-m-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </dialog>
  );
}
