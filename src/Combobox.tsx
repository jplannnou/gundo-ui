import { useState, useRef, useEffect, useId, useCallback, type KeyboardEvent } from 'react';

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  emptyMessage = 'No results found',
  className = '',
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const filtered = onSearch
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onSearch?.(val);
    if (!open) setOpen(true);
  };

  const selectOption = useCallback((opt: ComboboxOption) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setHighlightIndex(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && filtered[highlightIndex]) selectOption(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [highlightIndex, open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[highlightIndex] ? `${listboxId}-${highlightIndex}` : undefined}
          disabled={disabled}
          value={open ? query : selectedOption?.label ?? query}
          placeholder={placeholder}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { setOpen(true); setQuery(''); }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] px-3 py-2 text-sm text-[var(--ui-text)] outline-none focus:border-[var(--ui-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] transition-colors placeholder:text-[var(--ui-text-muted)] disabled:opacity-50"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ui-text-muted)] pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] py-1 shadow-xl"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--ui-text-muted)]">{emptyMessage}</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                onClick={() => selectOption(opt)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  opt.disabled
                    ? 'text-[var(--ui-text-muted)] opacity-50 cursor-not-allowed'
                    : i === highlightIndex
                      ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-text)]'
                      : opt.value === value
                        ? 'text-[var(--ui-primary)]'
                        : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
