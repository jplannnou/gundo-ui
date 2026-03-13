import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  name: string;
  avatar?: string;
  initials?: string;
  subtitle?: string;
  score: number;
  maxScore?: number;
  delta?: number;
  badge?: string;
  meta?: ReactNode;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  /** Show progress bars (default: true) */
  showBars?: boolean;
  /** Highlight top N entries (default: 3) */
  highlightTop?: number;
  /** Column label for score (default: 'Puntuación') */
  scoreLabel?: string;
  onEntryClick?: (entry: LeaderboardEntry) => void;
  /** Empty state */
  emptyMessage?: string;
  className?: string;
}

/* ─── Medal colors ───────────────────────────────────────────────────── */

const MEDAL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-[color-mix(in_srgb,#f59e0b_15%,transparent)]', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]' },
  2: { bg: 'bg-[color-mix(in_srgb,#9ca3af_15%,transparent)]', text: 'text-[#9ca3af]', border: 'border-[#9ca3af]' },
  3: { bg: 'bg-[color-mix(in_srgb,#b45309_15%,transparent)]', text: 'text-[#b45309]', border: 'border-[#b45309]' },
};

/* ─── LeaderboardTable ────────────────────────────────────────────────── */

export function LeaderboardTable({
  entries,
  showBars = true,
  highlightTop = 3,
  scoreLabel = 'Puntuación',
  onEntryClick,
  emptyMessage = 'No hay datos disponibles.',
  className = '',
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className={`text-sm text-[var(--ui-text-muted)] ${className}`}>{emptyMessage}</p>;
  }

  const maxScore = Math.max(...entries.map((e) => e.maxScore ?? e.score));

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] ${className}`}
      role="region"
      aria-label="Tabla de clasificación"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--ui-border)] px-4 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">Participante</span>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]">{scoreLabel}</span>
      </div>

      {/* Entries */}
      <ol>
        {entries.map((entry, i) => {
          const rank = entry.rank ?? i + 1;
          const isTop = rank <= highlightTop;
          const medal = MEDAL_COLORS[rank];
          const pct = (entry.score / maxScore) * 100;

          const initials =
            entry.initials ??
            entry.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase();

          return (
            <li
              key={entry.id}
              onClick={() => onEntryClick?.(entry)}
              className={`flex items-center gap-3 border-b border-[var(--ui-border)] px-4 py-3 last:border-b-0 transition-colors ${onEntryClick ? 'cursor-pointer hover:bg-[var(--ui-surface-hover)]' : ''} ${isTop ? 'bg-[var(--ui-surface-raised)]' : ''}`}
              aria-label={`${rank}. ${entry.name}: ${entry.score} puntos`}
            >
              {/* Rank */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${
                  medal
                    ? `${medal.bg} ${medal.text} ${medal.border}`
                    : 'border-[var(--ui-border)] text-[var(--ui-text-muted)]'
                }`}
              >
                {rank}
              </span>

              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-primary-soft)] text-xs font-semibold text-[var(--ui-primary)]">
                {entry.avatar ? (
                  <img src={entry.avatar} alt={entry.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-[var(--ui-text)]">{entry.name}</p>
                  {entry.badge && (
                    <span className="rounded-full bg-[var(--ui-primary-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ui-primary)]">
                      {entry.badge}
                    </span>
                  )}
                </div>
                {entry.subtitle && (
                  <p className="truncate text-xs text-[var(--ui-text-muted)]">{entry.subtitle}</p>
                )}
                {showBars && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]">
                    <div
                      className="h-full rounded-full bg-[var(--ui-primary)] transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={entry.score}
                      aria-valuemax={maxScore}
                      aria-label={`${entry.name}: ${entry.score}`}
                    />
                  </div>
                )}
              </div>

              {/* Score + delta */}
              <div className="shrink-0 flex flex-col items-end">
                <span className="text-sm font-bold tabular-nums text-[var(--ui-text)]">
                  {entry.score.toLocaleString('es')}
                </span>
                {entry.delta !== undefined && entry.delta !== 0 && (
                  <span
                    className={`text-[10px] font-medium tabular-nums ${entry.delta > 0 ? 'text-[var(--ui-success)]' : 'text-[var(--ui-error)]'}`}
                  >
                    {entry.delta > 0 ? '↑' : '↓'} {Math.abs(entry.delta)}
                  </span>
                )}
                {entry.meta}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
