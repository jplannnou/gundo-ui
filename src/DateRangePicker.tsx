import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface Preset {
  label: string;
  range: DateRange;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: Preset[];
  min?: Date;
  max?: Date;
  placeholder?: string;
  disabled?: boolean;
  locale?: string;
  className?: string;
}

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfWeek(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isToday(d: Date) { return isSameDay(d, new Date()); }
function isBetween(d: Date, from: Date, to: Date) { return d >= from && d <= to; }

function formatShort(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(d);
}

const defaultPresets: Preset[] = [
  { label: 'Last 7 days', range: { from: new Date(Date.now() - 7 * 86400000), to: new Date() } },
  { label: 'Last 30 days', range: { from: new Date(Date.now() - 30 * 86400000), to: new Date() } },
  { label: 'This month', range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() } },
  { label: 'Last 3 months', range: { from: new Date(Date.now() - 90 * 86400000), to: new Date() } },
];

function CalendarGrid({ year, month, locale, selecting, value, onSelect, onHover, hoverDate, min, max }: {
  year: number; month: number; locale: string;
  selecting: 'from' | 'to'; value: DateRange;
  onSelect: (d: Date) => void; onHover: (d: Date | null) => void; hoverDate: Date | null;
  min?: Date; max?: Date;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month));
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isDisabled = useCallback((day: number) => {
    const d = new Date(year, month, day);
    if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
    if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
    return false;
  }, [year, month, min, max]);

  return (
    <div>
      <div className="text-center text-sm font-medium text-[var(--ui-text)] mb-2">{monthLabel}</div>
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map(d => <div key={d} className="text-center text-xs text-[var(--ui-text-muted)] py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7" role="grid" aria-label={monthLabel}>
        {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="h-8" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const d = new Date(year, month, day);
          const dis = isDisabled(day);
          const isFrom = value.from && isSameDay(d, value.from);
          const isTo = value.to && isSameDay(d, value.to);
          const selected = isFrom || isTo;

          // Range highlight
          let inRange = false;
          if (value.from && value.to) {
            inRange = isBetween(d, value.from, value.to);
          } else if (selecting === 'to' && value.from && hoverDate) {
            const rangeStart = value.from < hoverDate ? value.from : hoverDate;
            const rangeEnd = value.from < hoverDate ? hoverDate : value.from;
            inRange = isBetween(d, rangeStart, rangeEnd);
          }

          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              aria-selected={selected || undefined}
              disabled={dis}
              onClick={() => !dis && onSelect(d)}
              onMouseEnter={() => onHover(d)}
              onMouseLeave={() => onHover(null)}
              className={`h-8 w-8 mx-auto text-sm transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                selected
                  ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)] font-semibold'
                  : inRange
                    ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-text)]'
                    : isToday(d)
                      ? 'border border-[var(--ui-primary)] text-[var(--ui-primary)]'
                      : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
              } ${dis ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  presets = defaultPresets,
  min,
  max,
  placeholder = 'Select range',
  disabled = false,
  locale = 'en-US',
  className = '',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [leftYear, setLeftYear] = useState(value.from?.getFullYear() ?? now.getFullYear());
  const [leftMonth, setLeftMonth] = useState((value.from?.getMonth() ?? now.getMonth()) === 0 && !value.from ? now.getMonth() - 1 : (value.from?.getMonth() ?? now.getMonth()));
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = (leftMonth + 1) % 12;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
    else setLeftMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
    else setLeftMonth(m => m + 1);
  };

  const handleSelect = (d: Date) => {
    if (selecting === 'from') {
      onChange({ from: d, to: null });
      setSelecting('to');
    } else {
      const from = value.from!;
      if (d < from) {
        onChange({ from: d, to: from });
      } else {
        onChange({ from, to: d });
      }
      setSelecting('from');
      setOpen(false);
    }
  };

  const handlePreset = (preset: Preset) => {
    onChange(preset.range);
    setSelecting('from');
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setOpen(false);
  };

  const displayText = value.from && value.to
    ? `${formatShort(value.from, locale)} — ${formatShort(value.to, locale)}`
    : value.from
      ? `${formatShort(value.from, locale)} — ...`
      : placeholder;

  return (
    <div ref={ref} className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 h-10 px-3 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] text-sm text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] transition-colors"
      >
        <svg className="w-4 h-4 text-[var(--ui-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={value.from ? '' : 'text-[var(--ui-text-muted)]'}>{displayText}</span>
      </button>

      {open && (
        <div className="absolute z-[var(--ui-z-dropdown)] mt-1 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-lg flex" role="dialog" aria-label="Date range picker">
          {/* Presets */}
          {presets.length > 0 && (
            <div className="border-r border-[var(--ui-border)] p-3 min-w-[140px]">
              <div className="text-xs font-medium text-[var(--ui-text-muted)] mb-2 uppercase tracking-wider">Presets</div>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className="block w-full text-left text-sm px-2 py-1.5 rounded text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Calendars */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <button type="button" onClick={prevMonth} aria-label="Previous month" className="p-1 rounded hover:bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button type="button" onClick={nextMonth} aria-label="Next month" className="p-1 rounded hover:bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <div className="flex gap-4">
              <CalendarGrid year={leftYear} month={leftMonth} locale={locale} selecting={selecting} value={value} onSelect={handleSelect} onHover={setHoverDate} hoverDate={hoverDate} min={min} max={max} />
              <CalendarGrid year={rightYear} month={rightMonth} locale={locale} selecting={selecting} value={value} onSelect={handleSelect} onHover={setHoverDate} hoverDate={hoverDate} min={min} max={max} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
