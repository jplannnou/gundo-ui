'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useState, useRef, useEffect, useId, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { useNativePopover } from './utils/useNativePopover';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

/** Must match the transition duration in native-overlays.css. */
const EXIT_MS = 150;

/**
 * A `popover="manual"` menu: top layer (never clipped by an `overflow` ancestor
 * or a scrolling Modal), anchored to the trigger with CSS anchor positioning.
 * Roving focus, Esc and outside-press stay here (see `useNativePopover`).
 */
export function DropdownMenu({ trigger, items, align = 'right', className = '' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const { mounted, popRef, popoverProps, anchorStyle } = useNativePopover<HTMLDivElement>({
    open,
    id: menuId,
    triggerRef,
    side: 'bottom',
    // `right` = the menu's right edge lines up with the trigger's, growing leftwards.
    align: align === 'right' ? 'end' : 'start',
    exitMs: EXIT_MS,
  });

  const enabledIndices = items.reduce<number[]>((acc, item, i) => {
    if (!item.disabled) acc.push(i);
    return acc;
  }, []);

  // Close and hand focus back to the trigger (menu-button pattern), for the
  // paths where the user stays in the page: Esc and choosing an item.
  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeAndRestoreFocus();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeAndRestoreFocus]);

  // Auto-focus first enabled item when menu opens
  useEffect(() => {
    if (open) {
      const firstEnabled = enabledIndices[0] ?? 0;
      setFocusedIndex(firstEnabled);
      // Delay focus to ensure DOM is rendered
      requestAnimationFrame(() => {
        itemRefs.current[firstEnabled]?.focus();
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusItem = useCallback((index: number) => {
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    const currentEnabledPos = enabledIndices.indexOf(focusedIndex);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextPos = (currentEnabledPos + 1) % enabledIndices.length;
        focusItem(enabledIndices[nextPos]);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevPos = (currentEnabledPos - 1 + enabledIndices.length) % enabledIndices.length;
        focusItem(enabledIndices[prevPos]);
        break;
      }
      case 'Home': {
        e.preventDefault();
        focusItem(enabledIndices[0]);
        break;
      }
      case 'End': {
        e.preventDefault();
        focusItem(enabledIndices[enabledIndices.length - 1]);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item && !item.disabled) {
          item.onClick();
          closeAndRestoreFocus();
        }
        break;
      }
      case 'Tab': {
        setOpen(false);
        break;
      }
    }
  };

  return (
    <div ref={ref} className={`relative inline-block ${className}`} style={anchorStyle}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="gu-popover-anchor focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface rounded-md"
      >
        {trigger}
      </div>
      {mounted && (
        <div
          ref={popRef}
          id={menuId}
          {...popoverProps}
          className="gu-menu rounded-lg border gu-border-border gu-bg-surface shadow-xl py-1"
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={el => { itemRefs.current[i] = el; }}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              tabIndex={i === focusedIndex ? 0 : -1}
              onClick={() => {
                item.onClick();
                closeAndRestoreFocus();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors disabled:opacity-40 ${
                item.danger
                  ? 'gu-text-error gu-h-bg-error-soft'
                  : 'gu-text-text gu-h-bg-surface-hover'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset gu-fv-ring-focus-ring-color`}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
