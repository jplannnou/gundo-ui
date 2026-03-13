import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MilestoneStatus = 'completed' | 'current' | 'upcoming' | 'blocked';

export interface Milestone {
  id: string;
  label: string;
  description?: string;
  status: MilestoneStatus;
  date?: string;
  icon?: ReactNode;
}

export interface MilestonesTrackerProps {
  milestones: Milestone[];
  /** Layout direction (default: 'vertical') */
  direction?: 'vertical' | 'horizontal';
  /** Show milestone dates */
  showDates?: boolean;
  /** Called when a milestone is clicked */
  onMilestoneClick?: (milestone: Milestone) => void;
  className?: string;
}

/* ─── Status config ──────────────────────────────────────────────────── */

const statusConfig: Record<
  MilestoneStatus,
  { ring: string; bg: string; text: string; iconColor: string; lineColor: string }
> = {
  completed: {
    ring: 'border-[var(--ui-success)]',
    bg: 'bg-[var(--ui-success)]',
    text: 'text-[var(--ui-success)]',
    iconColor: 'text-white',
    lineColor: 'bg-[var(--ui-success)]',
  },
  current: {
    ring: 'border-[var(--ui-primary)]',
    bg: 'bg-[var(--ui-primary)]',
    text: 'text-[var(--ui-primary)]',
    iconColor: 'text-[var(--ui-surface)]',
    lineColor: 'bg-[var(--ui-border)]',
  },
  upcoming: {
    ring: 'border-[var(--ui-border)]',
    bg: 'bg-transparent',
    text: 'text-[var(--ui-text-muted)]',
    iconColor: 'text-[var(--ui-text-muted)]',
    lineColor: 'bg-[var(--ui-border)]',
  },
  blocked: {
    ring: 'border-[var(--ui-error)]',
    bg: 'bg-[color-mix(in_srgb,var(--ui-error)_15%,transparent)]',
    text: 'text-[var(--ui-error)]',
    iconColor: 'text-[var(--ui-error)]',
    lineColor: 'bg-[var(--ui-border)]',
  },
};

/* ─── Default icons ──────────────────────────────────────────────────── */

function DefaultIcon({ status }: { status: MilestoneStatus }) {
  if (status === 'completed') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'blocked') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 4v4M6 9.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'current') {
    return <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />;
  }
  return <span className="h-2 w-2 rounded-full bg-[var(--ui-border)]" aria-hidden="true" />;
}

/* ─── MilestonesTracker ───────────────────────────────────────────────── */

export function MilestonesTracker({
  milestones,
  direction = 'vertical',
  showDates = true,
  onMilestoneClick,
  className = '',
}: MilestonesTrackerProps) {
  if (direction === 'horizontal') {
    return (
      <div
        role="list"
        aria-label="Hitos"
        className={`flex items-start justify-between overflow-x-auto ${className}`}
      >
        {milestones.map((m, i) => {
          const cfg = statusConfig[m.status];
          const isLast = i === milestones.length - 1;

          return (
            <div key={m.id} role="listitem" className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <button
                  type="button"
                  onClick={() => onMilestoneClick?.(m)}
                  disabled={!onMilestoneClick}
                  aria-label={`${m.label} — ${m.status}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${cfg.ring} ${cfg.bg} ${cfg.iconColor} transition-transform ${onMilestoneClick ? 'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2' : ''}`}
                >
                  {m.icon ?? <DefaultIcon status={m.status} />}
                </button>
                {!isLast && (
                  <div className={`h-0.5 flex-1 ${cfg.lineColor}`} aria-hidden="true" />
                )}
              </div>
              <div className="mt-2 max-w-[80px] text-center">
                <p className={`text-xs font-medium ${cfg.text}`}>{m.label}</p>
                {showDates && m.date && (
                  <p className="mt-0.5 text-[10px] text-[var(--ui-text-muted)]">{m.date}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical
  return (
    <ol role="list" aria-label="Hitos" className={`flex flex-col gap-0 ${className}`}>
      {milestones.map((m, i) => {
        const cfg = statusConfig[m.status];
        const isLast = i === milestones.length - 1;

        return (
          <li key={m.id} role="listitem" className="flex gap-3">
            {/* Track */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onMilestoneClick?.(m)}
                disabled={!onMilestoneClick}
                aria-label={`${m.label} — ${m.status}`}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${cfg.ring} ${cfg.bg} ${cfg.iconColor} transition-transform ${onMilestoneClick ? 'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]' : ''}`}
              >
                {m.icon ?? <DefaultIcon status={m.status} />}
              </button>
              {!isLast && (
                <div className={`mt-1 w-0.5 flex-1 ${cfg.lineColor} min-h-[1.5rem]`} aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 pt-0.5 ${isLast ? '' : 'mb-1'}`}>
              <div className="flex items-baseline gap-2">
                <p className={`text-sm font-semibold ${cfg.text}`}>{m.label}</p>
                {showDates && m.date && (
                  <time className="text-xs text-[var(--ui-text-muted)]">{m.date}</time>
                )}
              </div>
              {m.description && (
                <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">{m.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
