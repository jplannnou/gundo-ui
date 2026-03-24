'use client';
import { useCallback, useState, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  color?: string;
  /** Full date+time (ISO string) for time-based events */
  startTime?: string;
  endTime?: string;
  data?: unknown;
}

export type CalendarView = 'week' | 'month';

export interface CalendarGridProps {
  /** Controlled date (YYYY-MM-DD) */
  date?: string;
  defaultDate?: string;
  view?: CalendarView;
  events?: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  /** Render extra content inside a day cell */
  renderDay?: (date: string, events: CalendarEvent[]) => ReactNode;
  /** Highlight today (default: true) */
  highlightToday?: boolean;
  /** First day of week: 0=Sunday, 1=Monday (default: 1) */
  firstDayOfWeek?: 0 | 1;
  className?: string;
}

/* ─── Date Utils ─────────────────────────────────────────────────────── */

const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date: Date, firstDay: 0 | 1 = 1): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getWeekDays(date: Date, firstDay: 0 | 1 = 1): Date[] {
  const start = startOfWeek(date, firstDay);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function getMonthGrid(date: Date, firstDay: 0 | 1 = 1): Date[] {
  const start = startOfMonth(date);
  const gridStart = startOfWeek(start, firstDay);
  // 6 rows × 7 cols
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/* ─── CalendarGrid ────────────────────────────────────────────────────── */

export function CalendarGrid({
  date: controlledDate,
  defaultDate,
  view = 'week',
  events = [],
  onDateClick,
  onEventClick,
  renderDay,
  highlightToday = true,
  firstDayOfWeek = 1,
  className = '',
}: CalendarGridProps) {
  const todayStr = toDateStr(new Date());
  const [internalDate, setInternalDate] = useState(defaultDate ?? todayStr);
  const currentDateStr = controlledDate ?? internalDate;
  const currentDate = parseDate(currentDateStr);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      const d = parseDate(controlledDate ?? internalDate);
      if (view === 'week') {
        setInternalDate(toDateStr(addDays(d, dir * 7)));
      } else {
        const next = new Date(d.getFullYear(), d.getMonth() + dir, 1);
        setInternalDate(toDateStr(next));
      }
    },
    [controlledDate, internalDate, view],
  );

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    acc[e.date] = acc[e.date] ?? [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const days =
    view === 'week'
      ? getWeekDays(currentDate, firstDayOfWeek)
      : getMonthGrid(currentDate, firstDayOfWeek);

  const currentMonth = currentDate.getMonth();

  // Header label
  const headerLabel =
    view === 'week'
      ? (() => {
          const weekDays = getWeekDays(currentDate, firstDayOfWeek);
          const start = weekDays[0];
          const end = weekDays[6];
          if (start.getMonth() === end.getMonth()) {
            return `${MONTH_NAMES_ES[start.getMonth()]} ${start.getFullYear()}`;
          }
          return `${MONTH_NAMES_ES[start.getMonth()]} – ${MONTH_NAMES_ES[end.getMonth()]} ${end.getFullYear()}`;
        })()
      : `${MONTH_NAMES_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Day name headers (reordered by firstDayOfWeek)
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    DAY_NAMES_ES[(firstDayOfWeek + i) % 7],
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Nav header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Semana/mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-[var(--ui-text)]">{headerLabel}</h3>
        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Semana/mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-7 overflow-hidden rounded-xl border border-[var(--ui-border)]"
        role="grid"
        aria-label={`Calendario — ${headerLabel}`}
      >
        {/* Day name headers */}
        {dayNames.map((name) => (
          <div
            key={name}
            role="columnheader"
            className="border-b border-[var(--ui-border)] bg-[var(--ui-surface-raised)] px-1 py-2 text-center text-xs font-medium uppercase tracking-wider text-[var(--ui-text-muted)]"
          >
            {name}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const isToday = highlightToday && dateStr === todayStr;
          const isSelected = dateStr === currentDateStr;
          const isOtherMonth = view === 'month' && day.getMonth() !== currentMonth;
          const dayEvents = eventsByDate[dateStr] ?? [];

          return (
            <div
              key={dateStr}
              role="gridcell"
              aria-label={`${day.getDate()} de ${MONTH_NAMES_ES[day.getMonth()]}${dayEvents.length > 0 ? `, ${dayEvents.length} eventos` : ''}`}
              className={`relative min-h-[60px] cursor-pointer border-b border-r border-[var(--ui-border)] p-1.5 last:border-r-0 transition-colors hover:bg-[var(--ui-surface-hover)] [&:nth-child(7n)]:border-r-0 ${
                isOtherMonth ? 'opacity-40' : ''
              } ${isSelected ? 'bg-[var(--ui-primary-soft)]' : ''}`}
              onClick={() => onDateClick?.(dateStr)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDateClick?.(dateStr);
                }
              }}
            >
              {/* Day number */}
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday
                    ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                    : isSelected
                      ? 'text-[var(--ui-primary)] font-semibold'
                      : 'text-[var(--ui-text-secondary)]'
                }`}
              >
                {day.getDate()}
              </span>

              {/* Events */}
              <div className="mt-0.5 flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(ev);
                    }}
                    aria-label={ev.title}
                    className="w-full truncate rounded px-1 text-left text-[10px] font-medium leading-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)]"
                    style={{
                      background: ev.color ?? 'var(--ui-primary-soft)',
                      color: ev.color ? 'white' : 'var(--ui-primary)',
                    }}
                  >
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-[var(--ui-text-muted)]">
                    +{dayEvents.length - 3} más
                  </span>
                )}
              </div>

              {renderDay?.(dateStr, dayEvents)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
