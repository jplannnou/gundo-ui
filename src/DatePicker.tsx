import { useState, useRef, useEffect, useId, useCallback, type KeyboardEvent } from 'react';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  disabled?: boolean;
  locale?: string;
  className?: string;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function formatDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select date',
  disabled = false,
  locale = 'en-US',
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? now.getMonth());
  const [focusedDay, setFocusedDay] = useState(value?.getDate() ?? now.getDate());
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Update view when value changes
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      setFocusedDay(value.getDate());
    }
  }, [value]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth));

  const isDisabled = useCallback((day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
    if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
    return false;
  }, [viewYear, viewMonth, min, max]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setFocusedDay(1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setFocusedDay(1);
  };

  const selectDay = (day: number) => {
    if (isDisabled(day)) return;
    onChange(new Date(viewYear, viewMonth, day));
    setOpen(false);
  };

  const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = focusedDay;
    switch (e.key) {
      case 'ArrowRight': next = focusedDay + 1; break;
      case 'ArrowLeft': next = focusedDay - 1; break;
      case 'ArrowDown': next = focusedDay + 7; break;
      case 'ArrowUp': next = focusedDay - 7; break;
      case 'Enter': case ' ': e.preventDefault(); selectDay(focusedDay); return;
      case 'Escape': setOpen(false); return;
      case 'PageDown': e.preventDefault(); nextMonth(); return;
      case 'PageUp': e.preventDefault(); prevMonth(); return;
      default: return;
    }
    e.preventDefault();
    if (next < 1) { prevMonth(); return; }
    if (next > daysInMonth) { nextMonth(); return; }
    setFocusedDay(next);
  };

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        id={inputId}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 h-10 px-3 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] text-sm text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] transition-colors"
      >
        <svg className="w-4 h-4 text-[var(--ui-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={value ? '' : 'text-[var(--ui-text-muted)]'}>
          {value ? formatDate(value, locale) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-[var(--ui-z-dropdown)] mt-1 w-72 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-lg p-3" role="dialog" aria-label="Date picker">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} aria-label="Previous month" className="p-1 rounded hover:bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-medium text-[var(--ui-text)]">{monthLabel}</span>
            <button type="button" onClick={nextMonth} aria-label="Next month" className="p-1 rounded hover:bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1" role="row">
            {weekdays.map(d => (
              <div key={d} className="text-center text-xs text-[var(--ui-text-muted)] py-1" role="columnheader">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div ref={gridRef} className="grid grid-cols-7" role="grid" aria-label={monthLabel} onKeyDown={handleGridKeyDown} tabIndex={0}>
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const d = new Date(viewYear, viewMonth, day);
              const selected = value && isSameDay(d, value);
              const today = isToday(d);
              const dis = isDisabled(day);
              const focused = day === focusedDay;

              return (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  aria-selected={selected || undefined}
                  aria-disabled={dis || undefined}
                  tabIndex={focused ? 0 : -1}
                  onClick={() => selectDay(day)}
                  disabled={dis}
                  className={`h-8 w-8 mx-auto rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                    selected
                      ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)] font-semibold'
                      : today
                        ? 'border border-[var(--ui-primary)] text-[var(--ui-primary)] font-medium'
                        : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
                  } ${dis ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
