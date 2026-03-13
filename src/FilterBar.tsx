import { useCallback, useId, useState, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  /** 'single' allows one selection; 'multi' allows many (default) */
  mode?: 'single' | 'multi';
}

export interface FilterBarProps {
  filters: FilterGroup[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (groupId: string, values: string[]) => void;
  onClearAll?: () => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Slot for extra content (e.g. sort dropdown) */
  trailing?: ReactNode;
  className?: string;
}

/* ─── FilterBar ───────────────────────────────────────────────────────── */

export function FilterBar({
  filters,
  activeFilters = {},
  onFilterChange,
  onClearAll,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  trailing,
  className = '',
}: FilterBarProps) {
  const searchId = useId();
  const totalActive = Object.values(activeFilters).reduce((acc, v) => acc + v.length, 0);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="search"
      aria-label="Filtros"
    >
      {searchable && (
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-48 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] pl-8 pr-3 text-sm text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] outline-none transition-colors focus-visible:border-[var(--ui-primary)] focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)]"
          />
        </div>
      )}

      {filters.map((group) => (
        <FilterDropdown
          key={group.id}
          group={group}
          active={activeFilters[group.id] ?? []}
          onChange={(values) => onFilterChange?.(group.id, values)}
        />
      ))}

      {/* Active filter pills */}
      {Object.entries(activeFilters).flatMap(([groupId, values]) => {
        const group = filters.find((f) => f.id === groupId);
        return values.map((val) => {
          const opt = group?.options.find((o) => o.value === val);
          return (
            <FilterPill
              key={`${groupId}:${val}`}
              label={opt?.label ?? val}
              onRemove={() => {
                const next = (activeFilters[groupId] ?? []).filter((v) => v !== val);
                onFilterChange?.(groupId, next);
              }}
            />
          );
        });
      })}

      {totalActive > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[var(--ui-text-muted)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] rounded"
        >
          Limpiar todo
        </button>
      )}

      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  );
}

/* ─── FilterDropdown ─────────────────────────────────────────────────── */

interface FilterDropdownProps {
  group: FilterGroup;
  active: string[];
  onChange: (values: string[]) => void;
}

function FilterDropdown({ group, active, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  const toggle = useCallback(
    (value: string) => {
      if (group.mode === 'single') {
        onChange(active[0] === value ? [] : [value]);
        setOpen(false);
      } else {
        onChange(active.includes(value) ? active.filter((v) => v !== value) : [...active, value]);
      }
    },
    [active, group.mode, onChange],
  );

  const hasActive = active.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] ${
          hasActive
            ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
            : 'border-[var(--ui-border)] bg-[var(--ui-surface-hover)] text-[var(--ui-text)]'
        }`}
      >
        {group.label}
        {hasActive && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ui-primary)] text-[10px] font-bold text-[var(--ui-surface)]">
            {active.length}
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable={group.mode !== 'single'}
            aria-label={group.label}
            className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] py-1 shadow-[var(--ui-shadow-md)]"
          >
            {group.options.map((opt) => {
              const isSelected = active.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(opt.value)}
                  className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--ui-surface-hover)] ${
                    isSelected ? 'text-[var(--ui-primary)]' : 'text-[var(--ui-text)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)]'
                          : 'border-[var(--ui-border)]'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l2 2 3-3" stroke="var(--ui-surface)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span className="text-xs text-[var(--ui-text-muted)]">{opt.count}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ─── FilterPill ─────────────────────────────────────────────────────── */

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[var(--ui-primary-soft)] pl-2.5 pr-1 py-0.5 text-xs font-medium text-[var(--ui-primary)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro: ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-[var(--ui-primary)] hover:text-[var(--ui-surface)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)]"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M6 2L2 6M2 2l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}
