'use client';
import './ui-classes.css';
import './Button.css';
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface WeekdayPickerDay {
  /** Stable identifier returned in `onChange`, e.g. `"mon"` or `"1"`. */
  value: string;
  /** Short visible label (already localized), e.g. "L". */
  label: string;
  /** Full accessible name (already localized), e.g. "lunes". */
  ariaLabel: string;
}

export interface WeekdayPickerProps {
  /** The selectable days, in display order. Labels and aria labels must be pre-translated. */
  days: WeekdayPickerDay[];
  /** Selected day values. In `single` mode only the first one counts. */
  value: string[];
  /**
   * Called with the next selection, always sorted in `days` order. In `single`
   * mode it is called with a one-element array.
   */
  onChange: (next: string[]) => void;
  /**
   * `multiple` — toggle buttons in a `group` (`aria-pressed`). Default.
   * `single` — a `radiogroup` with roving tabindex and arrow keys.
   */
  mode?: 'multiple' | 'single';
  /** `multiple` only. The selection cannot drop below this many days. */
  min?: number;
  /** `multiple` only. Once reached, unselected days stay `aria-disabled` and do not change. */
  max?: number;
  /** Accessible name of the whole group (already localized), e.g. "Días de entrenamiento". */
  ariaLabel: string;
  /** Disables every day. */
  disabled?: boolean;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Keeps the selection in `days` order; unknown values go last, in their original order. */
function sortByDays(values: string[], days: WeekdayPickerDay[]): string[] {
  const rank = (v: string) => {
    const i = days.findIndex(d => d.value === v);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return values
    .map((v, original) => ({ v, original }))
    .sort((a, b) => rank(a.v) - rank(b.v) || a.original - b.original)
    .map(({ v }) => v);
}

/* ─── WeekdayPicker ──────────────────────────────────────────────────── */

/**
 * Round day-of-week selector: seven 44×44 px buttons that fit a 390 px phone
 * with one row. `multiple` mode is a group of toggle buttons (training days,
 * reminder days) with optional `min`/`max`; `single` mode is a radiogroup
 * (arrows, Home and End move and select). Selected = filled with the primary
 * action color, bold weight and a thicker border, so the state never relies on
 * color alone. All text arrives pre-translated through props.
 */
export function WeekdayPicker({
  days,
  value,
  onChange,
  mode = 'multiple',
  min,
  max,
  ariaLabel,
  disabled = false,
  className = '',
}: WeekdayPickerProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const single = mode === 'single';
  const selectedSingle = value[0];

  /* ── multiple ── */

  const isBlocked = (dayValue: string): boolean => {
    if (single) return false;
    if (value.includes(dayValue)) return min !== undefined && value.length <= min;
    return max !== undefined && value.length >= max;
  };

  const toggle = (dayValue: string) => {
    if (disabled || isBlocked(dayValue)) return;
    const next = value.includes(dayValue)
      ? value.filter(v => v !== dayValue)
      : [...value, dayValue];
    onChange(sortByDays(next, days));
  };

  /* ── single ── */

  const select = (dayValue: string) => {
    if (disabled) return;
    if (value.length === 1 && selectedSingle === dayValue) return;
    onChange([dayValue]);
  };

  const hasSelectedSingle = days.some(d => d.value === selectedSingle);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % days.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + days.length) % days.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = days.length - 1;
    else return;
    e.preventDefault();
    buttonRefs.current[next]?.focus();
    select(days[next].value);
  };

  /* ── render ── */

  return (
    <div
      role={single ? 'radiogroup' : 'group'}
      aria-label={ariaLabel}
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${days.length}, minmax(44px, 1fr))`,
        justifyItems: 'center',
        gap: 4,
      }}
    >
      {days.map((day, index) => {
        const isSelected = single ? day.value === selectedSingle : value.includes(day.value);
        const blocked = isBlocked(day.value);
        // Roving tabindex: the checked radio is the tab stop; with none checked, the first day is.
        const tabIndex = single ? (isSelected || (!hasSelectedSingle && index === 0) ? 0 : -1) : undefined;

        const style: CSSProperties = {
          minWidth: 44,
          minHeight: 44,
          width: 44,
          height: 44,
          borderRadius: 'var(--ui-radius-full)',
          fontWeight: isSelected ? 700 : 500,
          ...(isSelected
            ? {
                backgroundColor: 'var(--ui-primary-fill)',
                color: 'var(--ui-primary-ink, var(--ui-surface))',
                border: '2px solid var(--ui-primary-fill)',
              }
            : {
                color: 'var(--ui-text)',
                border: '1px solid var(--ui-border-control, var(--ui-border-hover))',
              }),
          ...(disabled || (blocked && !isSelected) ? { opacity: 0.5 } : null),
          cursor: disabled || blocked ? 'not-allowed' : 'pointer',
        };

        return (
          <button
            key={day.value}
            ref={el => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            {...(single
              ? { role: 'radio' as const, 'aria-checked': isSelected }
              : { 'aria-pressed': isSelected })}
            aria-label={day.ariaLabel}
            aria-disabled={blocked || undefined}
            disabled={disabled}
            tabIndex={tabIndex}
            onClick={() => (single ? select(day.value) : toggle(day.value))}
            onKeyDown={single ? e => handleKeyDown(e, index) : undefined}
            className={`ui-focus-ring inline-flex items-center justify-center text-sm tabular-nums select-none ${
              isSelected ? '' : 'gu-bg-surface-raised'
            }`}
            style={style}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
