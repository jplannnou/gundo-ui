interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange, total, pageSize, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);
  const from = total ? (page - 1) * (pageSize || 1) + 1 : undefined;
  const to = total ? Math.min(page * (pageSize || 1), total) : undefined;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {total !== undefined && from !== undefined && to !== undefined ? (
        <p className="text-sm text-[var(--ui-text-muted)]">
          <span className="text-[var(--ui-text)]">{from}</span>–<span className="text-[var(--ui-text)]">{to}</span> of {total}
        </p>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 text-sm rounded-md border border-[var(--ui-border)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 transition-colors"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[var(--ui-text-muted)]">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] py-1.5 text-sm rounded-md transition-colors ${
                p === page
                  ? 'bg-[var(--ui-primary)] text-white font-medium'
                  : 'text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)]'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 text-sm rounded-md border border-[var(--ui-border)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
