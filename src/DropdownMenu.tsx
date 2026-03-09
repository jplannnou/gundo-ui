import { useState, useRef, useEffect, useId, useCallback, type ReactNode, type KeyboardEvent } from 'react';

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

export function DropdownMenu({ trigger, items, align = 'right', className = '' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const enabledIndices = items.reduce<number[]>((acc, item, i) => {
    if (!item.disabled) acc.push(i);
    return acc;
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
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

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
          setOpen(false);
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
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div
        onClick={() => setOpen(!open)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] rounded-md"
      >
        {trigger}
      </div>
      {open && (
        <div
          id={menuId}
          className={`absolute z-50 mt-1 min-w-[160px] rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xl py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
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
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors disabled:opacity-40 ${
                item.danger
                  ? 'text-[var(--ui-error)] hover:bg-[var(--ui-error-soft)]'
                  : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ui-focus-ring-color)]`}
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
