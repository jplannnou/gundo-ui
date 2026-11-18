'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useState, useId, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { useNativePopover } from './utils/useNativePopover';

export interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/** Must match the transition duration in native-overlays.css. */
const EXIT_MS = 150;

const arrowClasses: Record<string, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 gu-border-t-tooltip-bg border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 gu-border-b-tooltip-bg border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 gu-border-l-tooltip-bg border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 gu-border-r-tooltip-bg border-y-transparent border-l-transparent',
};

/**
 * A `popover="manual"` bubble in the top layer: never clipped by an `overflow`
 * ancestor, drawn above any dialog, anchored to the wrapper with CSS anchor
 * positioning. Shown on hover and keyboard focus; Esc dismisses it (WCAG 1.4.13).
 */
export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const { mounted, popRef, popoverProps, anchorStyle } = useNativePopover<HTMLSpanElement>({
    open: visible,
    id: tooltipId,
    triggerRef,
    side: position,
    align: 'center',
    exitMs: EXIT_MS,
  });

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible]);

  return (
    <span
      ref={triggerRef}
      className="gu-popover-anchor relative inline-flex"
      style={anchorStyle as CSSProperties}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {mounted && (
        <span
          ref={popRef}
          id={tooltipId}
          role="tooltip"
          {...popoverProps}
          className="gu-tooltip"
        >
          <span className="block gu-bg-tooltip-bg gu-text-tooltip-text text-xs rounded-lg px-3 py-2 shadow-lg whitespace-normal">
            {text}
          </span>
          <span className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </span>
      )}
    </span>
  );
}
