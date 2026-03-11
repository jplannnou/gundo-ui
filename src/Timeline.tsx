import type { ReactNode } from 'react';

type TimelineStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon?: ReactNode;
  status?: TimelineStatus;
}

interface TimelineProps {
  items: TimelineItem[];
  size?: 'sm' | 'md';
  className?: string;
}

const statusColors: Record<TimelineStatus, string> = {
  success: 'bg-[var(--ui-success)]',
  warning: 'bg-[var(--ui-warning)]',
  error: 'bg-[var(--ui-error)]',
  info: 'bg-[var(--ui-info)]',
  neutral: 'bg-[var(--ui-text-muted)]',
};

const dotSize: Record<string, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
};

const iconSize: Record<string, string> = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
};

export function Timeline({ items, size = 'md', className = '' }: TimelineProps) {
  return (
    <div className={`relative ${className}`} role="list" aria-label="Timeline">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const color = statusColors[item.status || 'neutral'];

        return (
          <div key={item.id} className="relative flex gap-3 pb-6 last:pb-0" role="listitem">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              {item.icon ? (
                <div className={`${iconSize[size]} rounded-full ${color} flex items-center justify-center text-white shrink-0`}>
                  {item.icon}
                </div>
              ) : (
                <div className={`${dotSize[size]} rounded-full ${color} shrink-0 mt-1.5`} />
              )}
              {!isLast && (
                <div className="w-px flex-1 bg-[var(--ui-border)] mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--ui-text)] truncate">{item.title}</p>
                {item.time && (
                  <time className="text-xs text-[var(--ui-text-muted)] shrink-0 whitespace-nowrap">{item.time}</time>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-sm text-[var(--ui-text-secondary)]">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
