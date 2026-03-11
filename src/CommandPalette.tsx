import { useState, useEffect, useRef, useCallback, useId, type ReactNode, type KeyboardEvent } from 'react';
import { useFocusTrap } from './utils/useFocusTrap';

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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();

  useFocusTrap(panelRef, open);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  if (!open) return null;

  const grouped = groupCommands(filtered);

  // Build flat list to track indexes
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[550] flex items-start justify-center pt-[15vh]" role="presentation">
      <div className="absolute inset-0 bg-[var(--ui-overlay)] backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Command palette"
        className={`relative w-full max-w-lg rounded-[var(--ui-radius-xl)] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl overflow-hidden ${className}`}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-[var(--ui-border)] px-4">
          <svg className="w-5 h-5 text-[var(--ui-text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
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
            className="flex-1 bg-transparent py-3 text-sm text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--ui-border)] text-[10px] text-[var(--ui-text-muted)] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-[var(--ui-text-muted)]">No results found</div>
          )}
          {Array.from(grouped.entries()).map(([group, cmds]) => (
            <div key={group}>
              {group && (
                <div className="px-2 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">{group}</div>
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-[var(--ui-radius-md)] cursor-pointer text-sm transition-colors ${
                      isFocused ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-text)]' : 'text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)]'
                    } ${cmd.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {cmd.icon && <span className="w-5 h-5 shrink-0 flex items-center justify-center">{cmd.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{cmd.label}</div>
                      {cmd.description && <div className="text-xs text-[var(--ui-text-muted)] truncate">{cmd.description}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
