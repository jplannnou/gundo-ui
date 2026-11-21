import './ui-classes.css';
import type { CSSProperties } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface StreakCalendarWeekday {
  /** Short visible label (already localized), e.g. "L". */
  label: string;
  /** Full name (already localized), e.g. "lunes". */
  ariaLabel: string;
}

export interface StreakCalendarProps {
  /** Month to draw, `YYYY-MM`. */
  month: string;
  /** Days with activity, `YYYY-MM-DD`. Days outside `month` are ignored. */
  marked: readonly string[];
  /**
   * Today, `YYYY-MM-DD`. It gets a ring, and later days read as "not yet"
   * instead of "missed". Omit to draw the month with no notion of today.
   */
  today?: string;
  /** Seven weekday headers in display order (already localized). */
  weekdays: readonly StreakCalendarWeekday[];
  /** First column: 0 = Sunday, 1 = Monday (default). Must match `weekdays`. */
  firstDayOfWeek?: 0 | 1;
  /** Accessible name of the calendar (already localized), e.g. "Noviembre de 2026". */
  ariaLabel: string;
  /**
   * Accessible name of one day (already localized), e.g.
   * `(date, state) => "12 de noviembre, entreno completado"`.
   */
  dayLabel: (date: string, state: StreakCalendarDayState) => string;
  className?: string;
}

/** `marked` — activity that day. `empty` — a past day (or today) without it. `upcoming` — after `today`. */
export type StreakCalendarDayState = 'marked' | 'empty' | 'upcoming';

/* ─── Helpers ────────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, '0');

/** Weeks of the month as rows of seven cells; `null` pads the first and last week. */
function monthWeeks(month: string, firstDayOfWeek: 0 | 1): (string | null)[][] {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return [];
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return [];
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const lead = (new Date(year, monthIndex, 1).getDay() - firstDayOfWeek + 7) % 7;
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(`${match[1]}-${match[2]}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ─── StreakCalendar ─────────────────────────────────────────────────── */

const DAY: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 'var(--ui-radius-full)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

/**
 * Read-only month of consistency: one circle per day, filled where there was
 * activity. It is a real table, so a screen reader walks it by week and
 * weekday, and each day carries its own accessible name. A marked day is
 * filled and bold, today has a ring, and days after `today` are quieter but
 * never read as missed. State does not rely on color alone. Seven 36 px
 * circles fit a 320 px phone. All text arrives pre-translated through props.
 */
export function StreakCalendar({
  month,
  marked,
  today,
  weekdays,
  firstDayOfWeek = 1,
  ariaLabel,
  dayLabel,
  className = '',
}: StreakCalendarProps) {
  const weeks = monthWeeks(month, firstDayOfWeek);
  if (weeks.length === 0) return null;
  const done = new Set(marked);

  return (
    <table
      aria-label={ariaLabel}
      className={`w-full text-sm tabular-nums ${className}`}
      style={{ borderCollapse: 'separate', borderSpacing: '0 4px', tableLayout: 'fixed' }}
    >
      <thead>
        <tr>
          {weekdays.map(day => (
            <th
              key={day.ariaLabel}
              scope="col"
              abbr={day.ariaLabel}
              className="gu-text-text-secondary text-xs font-medium"
              style={{ paddingBottom: 4, textAlign: 'center' }}
            >
              <span aria-hidden="true">{day.label}</span>
              <span className="sr-only">{day.ariaLabel}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, row) => (
          <tr key={week.find(Boolean) ?? row}>
            {week.map((date, col) => {
              if (!date) return <td key={`pad-${col}`} aria-hidden="true" />;
              const state: StreakCalendarDayState = done.has(date)
                ? 'marked'
                : today !== undefined && date > today
                  ? 'upcoming'
                  : 'empty';
              const isToday = date === today;
              const style: CSSProperties = {
                ...DAY,
                fontWeight: state === 'marked' ? 700 : 500,
                ...(state === 'marked'
                  ? {
                      backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
                      color: 'var(--ui-primary-ink, var(--ui-surface))',
                    }
                  : {
                      color: state === 'upcoming' ? 'var(--ui-text-secondary)' : 'var(--ui-text)',
                    }),
                ...(isToday
                  ? { outline: '2px solid var(--ui-text)', outlineOffset: 2 }
                  : state === 'empty'
                    ? { border: '1px solid var(--ui-border)' }
                    : null),
              };
              return (
                <td
                  key={date}
                  data-state={state}
                  aria-current={isToday ? 'date' : undefined}
                  style={{ textAlign: 'center', padding: 0 }}
                >
                  <span style={style}>
                    <span aria-hidden="true">{Number(date.slice(8))}</span>
                    <span className="sr-only">{dayLabel(date, state)}</span>
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
