import { useState, useRef, useEffect, useId, type ReactNode } from 'react';

type PopoverAlign = 'start' | 'center' | 'end';
type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverSide;
  align?: PopoverAlign;
  className?: string;
}

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

  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

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
  }, [isOpen]);

  const positionClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[side];

  const alignClass = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  }[align];

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <div
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          id={contentId}
          role="dialog"
          className={`absolute z-50 ${positionClass} ${alignClass} min-w-[200px] rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-xl animate-[fadeIn_0.15s_ease-out]`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
