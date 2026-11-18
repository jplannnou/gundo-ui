'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { useNativePopover, type PopoverAlign, type PopoverSide } from './utils/useNativePopover';

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverSide;
  align?: PopoverAlign;
  className?: string;
}

/** Must match the transition duration in native-overlays.css. */
const EXIT_MS = 150;

export function Popover({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  className = '',
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const contentId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { mounted, popRef, popoverProps, anchorStyle } = useNativePopover<HTMLDivElement>({
    open: isOpen,
    id: contentId,
    triggerRef,
    side,
    align,
    exitMs: EXIT_MS,
  });

  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  // `popover="manual"` so the trigger click and outside-click never race the
  // browser's own light dismiss; Esc and outside-press are handled here.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`} style={anchorStyle}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!isOpen); } }}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="gu-popover-anchor focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface rounded-md"
      >
        {trigger}
      </div>
      {mounted && (
        <div
          ref={popRef}
          id={contentId}
          role="dialog"
          {...popoverProps}
          className="gu-popover"
        >
          {children}
        </div>
      )}
    </div>
  );
}
