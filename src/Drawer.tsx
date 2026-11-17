'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useRef, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useNativeDialog } from './utils/useNativeDialog';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  width?: string;
  className?: string;
  /**
   * Accessible name of the X button. The design system has no i18n of its own,
   * so consumers pass a localized string (e.g. `closeLabel={t('common.close')}`).
   * Defaults to English.
   */
  closeLabel?: string;
}

/** Must match the drawer transition in native-overlays.css. */
const EXIT_MS = 250;

/** A native `<dialog>` opened with `showModal()`, pinned to one side. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = 'max-w-md',
  className = '',
  closeLabel = 'Close',
}: DrawerProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mounted, dialogProps } = useNativeDialog({ ref: dialogRef, open, onClose, exitMs: EXIT_MS });

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      {...dialogProps}
      data-kind="drawer"
      data-side={side}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      className={`gu-dialog flex max-w-full ${width} flex-col gu-border-border gu-bg-surface shadow-2xl outline-none ${
        side === 'left' ? 'border-r' : 'border-l'
      } ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b gu-border-border px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold gu-text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            // 44x44 hit area (WCAG 2.5.5); -m-2 keeps the previous 28px layout footprint.
            className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-md gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </dialog>
  );
}
