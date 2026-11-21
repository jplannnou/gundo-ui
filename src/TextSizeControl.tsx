import './ui-classes.css';
import { useRef, type KeyboardEvent } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface TextSizeOption {
  value: string;
  /** Visible name (already localized), e.g. "Grande". */
  label: string;
  /** Multiplier over the base size, e.g. 1, 1.15, 1.3. */
  scale: number;
}

export interface TextSizeControlProps {
  /** Accessible name of the group (already localized), e.g. "Tamaño del texto". */
  ariaLabel: string;
  /** Sizes in growing order. */
  options: readonly TextSizeOption[];
  value: string;
  onChange: (value: string) => void;
  /** Glyph drawn at each size (default "A"). Decorative. */
  glyph?: string;
  /** Sample sentence drawn at the selected size (already localized). */
  sampleText?: string;
  className?: string;
}

/* ─── TextSizeControl ────────────────────────────────────────────────── */

/**
 * Ajuste de tamaño de texto: un grupo de opciones donde cada una enseña la
 * letra a su tamaño. No aplica el tamaño a la app: avisa con `onChange` y quien
 * lo use decide dónde guardarlo y cómo escalar.
 */
export function TextSizeControl({
  ariaLabel,
  options,
  value,
  onChange,
  glyph = 'A',
  sampleText,
  className = '',
}: TextSizeControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  // Sin valor válido, la primera opción recibe el foco para que el grupo sea alcanzable.
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next === null) return;
    event.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="flex rounded-2xl border gu-border-border gu-bg-surface"
        style={{ padding: 4, gap: 4 }}
      >
        {options.map((option, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => move(event, index)}
              className="focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
              style={{
                flex: 1,
                minHeight: 64,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
                padding: '8px 4px',
                cursor: 'pointer',
                border: 0,
                borderRadius: 'var(--ui-radius-xl)',
                background: active ? 'var(--ui-primary-fill)' : 'transparent',
                color: active ? 'var(--ui-primary-ink)' : 'var(--ui-text)',
                font: 'inherit',
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontSize: `calc(1rem * ${option.scale})`, lineHeight: 1, fontWeight: 600 }}
              >
                {glyph}
              </span>
              <span style={{ fontSize: 'var(--ui-font-size-xs)', lineHeight: 1.2 }}>{option.label}</span>
            </button>
          );
        })}
      </div>
      {sampleText && (
        <p
          data-testid="text-size-sample"
          className="gu-text-text-secondary"
          style={{
            margin: '12px 0 0',
            fontSize: `calc(var(--ui-font-size-base) * ${selected?.scale ?? 1})`,
            lineHeight: 1.5,
          }}
        >
          {sampleText}
        </p>
      )}
    </div>
  );
}
