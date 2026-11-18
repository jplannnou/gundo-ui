'use client';
import './ui-classes.css';
import './native-overlays.css';
import { useState, useEffect, useRef, useCallback, useId, type ReactNode, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useNativeDialog } from './utils/useNativeDialog';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  group?: string;
  keywords?: string[];
  onSelect: () => void;
  disabled?: boolean;
}

interface CommandPaletteProps {
  commands: Command[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  hotkey?: string;
  className?: string;
}

function matchesQuery(cmd: Command, query: string): boolean {
  const q = query.toLowerCase();
  if (cmd.label.toLowerCase().includes(q)) return true;
  if (cmd.description?.toLowerCase().includes(q)) return true;
  if (cmd.keywords?.some(k => k.toLowerCase().includes(q))) return true;
  return false;
}

function groupCommands(commands: Command[]): Map<string, Command[]> {
  const groups = new Map<string, Command[]>();
  for (const cmd of commands) {
    const group = cmd.group || '';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(cmd);
  }
  return groups;
}

/** Must match the dialog transition in native-overlays.css. */
const EXIT_MS = 200;

/**
 * A native `<dialog>` opened with `showModal()`: top layer, inert page behind it,
 * focus containment, focus restore and Esc come from the platform (see
 * `useNativeDialog`). The panel hangs from the top of the viewport.
 */
export function CommandPalette({
  commands,
  open,
  onOpenChange,
  placeholder = 'Type a command...',
  hotkey = 'k',
  className = '',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const listId = useId();

  // Declared before the "focus input" effect below: the hook parks focus on the
  // dialog in a rAF, and the input's rAF has to run after it.
  const { mounted, dialogProps } = useNativeDialog({
    ref: dialogRef,
    open,
    onClose: () => onOpenChange(false),
    exitMs: EXIT_MS,
  });

  const filtered = query ? commands.filter(c => matchesQuery(c, query)) : commands;
  const enabledFiltered = filtered.filter(c => !c.disabled);

  // Global hotkey
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === hotkey) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange, hotkey]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setFocusedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Reset focused index when query changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  // Scroll focused item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    (items[focusedIndex] as HTMLElement)?.scrollIntoView?.({ block: 'nearest' });
  }, [focusedIndex]);

  const selectCommand = useCallback((cmd: Command) => {
    if (cmd.disabled) return;
    cmd.onSelect();
    onOpenChange(false);
  }, [onOpenChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => (i + 1) % enabledFiltered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => (i - 1 + enabledFiltered.length) % enabledFiltered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (enabledFiltered[focusedIndex]) selectCommand(enabledFiltered[focusedIndex]);
        break;
      // Escape is the dialog's native `cancel` event. Preventing the keydown here
      // would suppress it.
    }
  };

  const grouped = groupCommands(filtered);

  // Build flat list to track indexes
  let flatIndex = 0;

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      {...dialogProps}
      data-kind="palette"
      // Redundant for a <dialog>, on purpose: consumers select on `[role="dialog"]`.
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      tabIndex={-1}
      className={`gu-dialog w-full max-w-lg gu-rounded-radius-xl border gu-border-border gu-bg-surface shadow-2xl overflow-hidden outline-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Search input */}
      <div className="flex items-center gap-2 border-b gu-border-border px-4">
        <Search className="w-5 h-5 gu-text-text-muted shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={true}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3 text-sm gu-text-text placeholder:text-[var(--ui-text-muted)] outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border gu-border-border gu-text-2xs gu-text-text-muted font-mono">
          ESC
        </kbd>
      </div>

      {/* Results */}
      <div ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm gu-text-text-muted">No results found</div>
        )}
        {Array.from(grouped.entries()).map(([group, cmds]) => (
          <div key={group}>
            {group && (
              <div className="px-2 py-1.5 text-xs font-medium gu-text-text-secondary">{group}</div>
            )}
            {cmds.map(cmd => {
              const isEnabled = !cmd.disabled;
              const enabledIdx = isEnabled ? enabledFiltered.indexOf(cmd) : -1;
              const isFocused = enabledIdx === focusedIndex;
              flatIndex++;

              return (
                <div
                  key={cmd.id}
                  role="option"
                  aria-selected={isFocused}
                  aria-disabled={cmd.disabled || undefined}
                  onClick={() => isEnabled && selectCommand(cmd)}
                  className={`flex items-center gap-3 px-3 py-2 gu-rounded-radius-md cursor-pointer text-sm transition-colors ${
                    isFocused ? 'gu-bg-primary-soft gu-text-text' : 'gu-text-text-secondary gu-h-bg-surface-hover'
                  } ${cmd.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {cmd.icon && <span className="w-5 h-5 shrink-0 flex items-center justify-center">{cmd.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{cmd.label}</div>
                    {cmd.description && <div className="text-xs gu-text-text-muted truncate">{cmd.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </dialog>
  );
}
