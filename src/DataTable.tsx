import type { ReactNode, KeyboardEvent } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/* ── Column definition ──────────────────────────────────────────────────── */

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/* ── Sort state ─────────────────────────────────────────────────────────── */

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

/* ── Props ──────────────────────────────────────────────────────────────── */

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  sort?: SortState;
  onSort?: (sort: SortState) => void;
  selectedKeys?: Set<string | number>;
  onSelectChange?: (keys: Set<string | number>) => void;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

/* ── Sort icon ──────────────────────────────────────────────────────────── */

function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  return (
    <span className={`inline-flex flex-col items-center ml-1 -space-y-1.5 ${active ? 'text-[var(--ui-primary)]' : 'text-[var(--ui-text-muted)]'}`} aria-hidden="true">
      <ChevronUp className="w-3.5 h-3.5" style={{ opacity: !active || direction === 'asc' ? 1 : 0.3 }} />
      <ChevronDown className="w-3.5 h-3.5" style={{ opacity: !active || direction === 'desc' ? 1 : 0.3 }} />
    </span>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function DataTable<T>({
  columns,
  data,
  rowKey,
  sort,
  onSort,
  selectedKeys,
  onSelectChange,
  emptyMessage = 'No data',
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  const selectable = !!onSelectChange && !!selectedKeys;
  const allKeys = data.map(rowKey);
  const allSelected = allKeys.length > 0 && allKeys.every(k => selectedKeys?.has(k));
  const someSelected = !allSelected && allKeys.some(k => selectedKeys?.has(k));

  function handleSelectAll() {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(allKeys));
    }
  }

  function handleSelectRow(key: string | number) {
    if (!onSelectChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectChange(next);
  }

  function handleSort(col: Column<T>) {
    if (!onSort || !col.sortable) return;
    const direction: 'asc' | 'desc' =
      sort?.key === col.key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort({ key: col.key, direction });
  }

  function handleHeaderKeyDown(e: KeyboardEvent<HTMLTableCellElement>, col: Column<T>) {
    if (!col.sortable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(col);
    }
  }

  function getAriaSortValue(col: Column<T>): 'ascending' | 'descending' | 'none' | undefined {
    if (!col.sortable) return undefined;
    if (sort?.key !== col.key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={`overflow-x-auto rounded-lg border border-[var(--ui-border)] ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--ui-border)]">
            {selectable && (
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                  className="accent-[var(--ui-primary)]"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-2.5 font-medium text-[var(--ui-text-muted)] ${alignClass[col.align || 'left']} ${
                  col.sortable ? 'cursor-pointer select-none hover:text-[var(--ui-text)]' : ''
                }`}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => handleSort(col) : undefined}
                onKeyDown={e => handleHeaderKeyDown(e, col)}
                tabIndex={col.sortable ? 0 : undefined}
                aria-sort={getAriaSortValue(col)}
              >
                {col.header}
                {col.sortable && (
                  <SortIcon active={sort?.key === col.key} direction={sort?.key === col.key ? sort.direction : undefined} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-[var(--ui-text-muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => {
              const key = rowKey(row);
              const selected = selectedKeys?.has(key);
              return (
                <tr
                  key={key}
                  className={`border-b border-[var(--ui-border)]/50 transition-colors ${
                    selected ? 'bg-[var(--ui-primary-soft)]' : ''
                  } ${onRowClick ? 'cursor-pointer hover:bg-[var(--ui-surface-hover)]' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && (
                    <td className="w-10 px-3 py-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSelectRow(key)}
                        aria-label="Select row"
                        className="accent-[var(--ui-primary)]"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-2 text-[var(--ui-text)] ${alignClass[col.align || 'left']}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
