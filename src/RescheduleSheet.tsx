'use client';
import './ui-classes.css';
import './Button.css';
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { Button } from './Button';
import { Sheet } from './Sheet';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface RescheduleSheetDay {
  /** Stable identifier returned in `onChange` and `onConfirm`, e.g. `"2026-11-24"`. */
  value: string;
  /** Main text of the row (already localized), e.g. "Martes". */
  label: string;
  /** Second line (already localized), e.g. "24 de noviembre". */
  sublabel?: string;
  /** The day cannot be picked (a rest day, a day already full). It stays in the list, unavailable. */
  disabled?: boolean;
  /** The day the workout sits on now. It can be highlighted, but moving to it changes nothing. */
  current?: boolean;
}

export interface RescheduleSheetProps {
  /** Whether the sheet is showing. */
  open: boolean;
  /** Called on Esc, on the close button, on the backdrop and on "cancel". */
  onClose: () => void;
  /** Heading of the sheet (already localized), e.g. "Mover entreno". */
  title: string;
  /** One supporting line under the heading (already localized). */
  description?: string;
  /** The days to choose from, in display order. */
  days: readonly RescheduleSheetDay[];
  /** Chosen day. Controlled: leave it out (or `undefined`) while nothing is chosen. */
  value?: string;
  /** Called with the value of the day the user picks (click, arrows, Home, End). */
  onChange: (value: string) => void;
  /** Label of the confirm button (already localized), e.g. "Mover aquí". */
  confirmLabel: string;
  /**
   * Called with the chosen day. The button stays disabled until the user picks
   * an enabled day that is not the current one.
   */
  onConfirm: (value: string) => void;
  /** Label of the cancel button (already localized). Closing never needs a choice. */
  cancelLabel: string;
  /** Visible text that marks the current day (already localized), e.g. "Día actual". */
  currentLabel?: string;
  /** Accessible name of the X button (already localized). Defaults to `cancelLabel`. */
  closeLabel?: string;
  /** Accessible name of the list of days (already localized). Defaults to `title`. */
  daysLabel?: string;
  className?: string;
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const LIST: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const FOOTER: CSSProperties = {
  position: 'sticky',
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  marginTop: 16,
  padding: '12px 0',
  backgroundColor: 'var(--ui-surface)',
};

const INDICATOR: CSSProperties = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  boxSizing: 'border-box',
  border: '2px solid currentColor',
  borderRadius: 'var(--ui-radius-full)',
};

const DOT: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 'var(--ui-radius-full)',
  backgroundColor: 'currentColor',
};

/* ─── RescheduleSheet ────────────────────────────────────────────────── */

/**
 * "Move workout": a sheet with the days of the week as a `radiogroup`, one
 * confirm and one cancel. It is the DS `Sheet` (native `<dialog>`, focus
 * containment, Esc, backdrop), so it brings none of that itself.
 *
 * Confirming stays disabled until the user picks an enabled day other than the
 * current one; closing never needs a choice (cancel, X, Esc and backdrop all
 * work with nothing picked). Each row is at least 56 px tall; arrows, Home and
 * End move and select, skipping unavailable days. The chosen row is filled and
 * carries a filled dot, so the state never relies on color alone. Nothing
 * animates here beyond what `Sheet` does. All text arrives pre-translated
 * through props.
 */
export function RescheduleSheet({
  open,
  onClose,
  title,
  description,
  days,
  value,
  onChange,
  confirmLabel,
  onConfirm,
  cancelLabel,
  currentLabel,
  closeLabel,
  daysLabel,
  className = '',
}: RescheduleSheetProps) {
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = days.length;

  const chosen = days.find(day => day.value === value && !day.disabled);
  const firstEnabled = days.findIndex(day => !day.disabled);
  const canConfirm = chosen !== undefined && !chosen.current;

  /* ── radiogroup ── */

  const select = (day: RescheduleSheetDay) => {
    if (day.disabled || day.value === value) return;
    onChange(day.value);
  };

  /** Next enabled day from `from` in direction `step`, wrapping; -1 if none. */
  const neighbour = (from: number, step: 1 | -1): number => {
    for (let k = 1; k <= count; k += 1) {
      const index = (((from + step * k) % count) + count) % count;
      if (!days[index].disabled) return index;
    }
    return -1;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = neighbour(index, 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = neighbour(index, -1);
    else if (e.key === 'Home') next = firstEnabled;
    else if (e.key === 'End') next = days.map(day => !day.disabled).lastIndexOf(true);
    else return;
    e.preventDefault();
    if (next === -1) return;
    rowRefs.current[next]?.focus();
    select(days[next]);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      closeLabel={closeLabel ?? cancelLabel}
      className={className}
    >
      <div role="radiogroup" aria-label={daysLabel ?? title} style={LIST}>
        {days.map((day, index) => {
          const selected = day.value === value;
          // Roving tabindex: la fila marcada es la parada del Tab; sin marcar (o con la
          // marcada no disponible), la primera disponible.
          const tabIndex = day.disabled ? -1 : chosen ? (selected ? 0 : -1) : index === firstEnabled ? 0 : -1;
          const style: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            minHeight: 56,
            padding: '10px 16px',
            textAlign: 'left',
            borderRadius: 'var(--ui-radius-lg)',
            cursor: day.disabled ? 'not-allowed' : 'pointer',
            ...(selected
              ? {
                  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
                  color: 'var(--ui-primary-ink, var(--ui-surface))',
                  border: '2px solid var(--ui-primary-fill, var(--ui-primary))',
                }
              : {
                  color: 'var(--ui-text)',
                  border: '1px solid var(--ui-border-control, var(--ui-border-hover))',
                }),
            ...(day.disabled ? { opacity: 0.5 } : null),
          };
          return (
            <button
              key={day.value}
              ref={el => {
                rowRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-current={day.current ? 'true' : undefined}
              disabled={day.disabled}
              tabIndex={tabIndex}
              onClick={() => select(day)}
              onKeyDown={e => handleKeyDown(e, index)}
              className={`ui-focus-ring select-none ${selected ? '' : 'gu-bg-surface-raised'}`}
              style={style}
            >
              <span aria-hidden="true" style={INDICATOR}>
                {selected && <span style={DOT} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="text-base" style={{ display: 'block', fontWeight: selected ? 700 : 600 }}>
                  {day.label}
                </span>
                {day.sublabel && (
                  <span
                    className="text-sm"
                    style={{ display: 'block', color: selected ? 'inherit' : 'var(--ui-text-secondary)' }}
                  >
                    {day.sublabel}
                  </span>
                )}
              </span>
              {day.current && currentLabel && (
                <span
                  className="text-xs font-semibold"
                  style={{
                    flexShrink: 0,
                    padding: '2px 8px',
                    border: '1px solid currentColor',
                    borderRadius: 'var(--ui-radius-full)',
                  }}
                >
                  {currentLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={FOOTER}>
        <Button
          type="button"
          variant="primary"
          disabled={!canConfirm}
          onClick={() => {
            if (chosen && !chosen.current) onConfirm(chosen.value);
          }}
          style={{ minHeight: 48, width: '100%' }}
        >
          {confirmLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} style={{ minHeight: 44, width: '100%' }}>
          {cancelLabel}
        </Button>
      </div>
    </Sheet>
  );
}
