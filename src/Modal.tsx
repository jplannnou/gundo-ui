'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useRef, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useNativeDialog } from './utils/useNativeDialog';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * `center` — classic centered dialog (default).
 * `bottom-sheet` — anchored to the bottom edge on mobile (thumb-reach, slides
 * up) and centered on desktop (≥sm). Same focus-trap / ESC / scroll-lock.
 */
type ModalPlacement = 'center' | 'bottom-sheet';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  placement?: ModalPlacement;
  className?: string;
  /**
   * Accessible name of the X button. The design system has no i18n of its own,
   * so consumers pass a localized string (e.g. `closeLabel={t('common.close')}`).
   * Defaults to English.
   */
  closeLabel?: string;
}

/** Must match the dialog transition in native-overlays.css. */
const EXIT_MS = 200;

/**
 * A native `<dialog>` opened with `showModal()`: top layer, inert page behind it,
 * focus containment and Esc come from the platform (see `useNativeDialog`).
 */
export function Modal({ open, onClose, title, children, size = 'md', placement = 'center', className = '', closeLabel = 'Close' }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mounted, dialogProps } = useNativeDialog({ ref: dialogRef, open, onClose, exitMs: EXIT_MS });
  const isSheet = placement === 'bottom-sheet';

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      {...dialogProps}
      data-kind="modal"
      data-placement={placement}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      className={`gu-dialog ${sizeClasses[size]} border gu-border-border gu-bg-surface p-4 sm:p-6 shadow-2xl outline-none ${isSheet ? 'rounded-t-2xl sm:rounded-xl' : 'rounded-xl'} ${className}`}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold gu-text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            // 44x44 hit area (WCAG 2.5.5 / HIG). The negative margin keeps the
            // layout footprint at the previous 36px so the header doesn't grow
            // and the icon stays exactly where it was.
            className="-m-1 inline-flex h-11 w-11 items-center justify-center rounded-md gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
      {children}
    </dialog>
  );
}
