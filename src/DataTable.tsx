import type { ReactNode } from 'react';

/* ── Column definition ──────────────────────────────────────────────────── */

interface Column<T> {
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

interface DataTableProps<T> {
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
    <svg className={`w-3.5 h-3.5 inline-block ml-1 ${active ? 'text-[var(--ui-primary)]' : 'text-[var(--ui-text-muted)]'}`} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 3l4 5H4z" opacity={!active || direction === 'asc' ? 1 : 0.3} />
      <path d="M8 13l-4-5h8z" opacity={!active || direction === 'desc' ? 1 : 0.3} />
    </svg>
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
