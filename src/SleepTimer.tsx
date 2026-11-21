'use client';
import './ui-classes.css';
import './Button.css';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { formatClock } from './utils/formatClock';

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Lo elegido: minutos, `'end'` (al terminar la pista) o `null` (sin temporizador). */
export type SleepTimerValue = number | 'end' | null;

/** Todos los textos de `SleepTimer`, ya traducidos: la librería no trae copy. */
export interface SleepTimerLabels {
  /** Nombre accesible del conjunto, p. ej. «Detener en». */
  group: string;
  /** Texto de la opción de `n` minutos, p. ej. `(n) => \`${n} min\``. */
  minutes: (n: number) => string;
  /** Texto de la opción «al terminar la pista». Sin él, esa opción no aparece. */
  end?: string;
  /** Estado mientras corre la opción «al terminar»; si falta se usa `end`. P. ej. «Se detendrá al terminar la pista». */
  endStatus?: string;
  /** Estado con cuenta atrás, con el tiempo ya formateado: `(t) => \`Se detiene en ${t}\``. */
  remaining: (time: string) => string;
  /** Botón de cancelar, p. ej. «Cancelar temporizador». */
  cancel: string;
}

export interface SleepTimerProps {
  /** Lo que está activo. El estado lo lleva quien llama. */
  value: SleepTimerValue;
  /**
   * Quien llama recibe la nueva elección: minutos, `'end'` o `null`. Pulsar la
   * opción que ya estaba activa también da `null` (alterna), igual que el botón
   * de cancelar.
   */
  onChange: (value: SleepTimerValue) => void;
  /** Opciones en minutos, p. ej. `[5, 10, 15, 30]`. Se ignoran las que no son números finitos mayores que 0 y las repetidas. */
  options: readonly number[];
  /**
   * Segundos que faltan. Lo cuenta quien llama (la pieza no tiene reloj). Con
   * minutos activos, sin este valor no hay fila de estado: la opción activa y
   * el alternar de la propia opción bastan. Se redondea hacia arriba, para no
   * enseñar 0:00 con casi un segundo por delante.
   */
  remainingSeconds?: number;
  /** Todos los textos, ya traducidos. */
  labels: SleepTimerLabels;
  className?: string;
}

/* ─── Estilos ────────────────────────────────────────────────────────── */

const TAP = 44;

const CHIP: CSSProperties = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: TAP,
  minHeight: TAP,
  padding: '0 var(--ui-spacing-4)',
  // 2 px siempre, activo o no: el chip no cambia de tamaño al pulsarlo.
  border: '2px solid var(--ui-border-control, var(--ui-border-hover))',
  borderRadius: 'var(--ui-radius-full)',
  backgroundColor: 'transparent',
  color: 'var(--ui-text)',
  fontFamily: 'inherit',
  fontSize: 'var(--ui-font-size-sm)',
  // Peso constante: con otro peso en el activo el texto ensancharía el chip.
  fontWeight: 600,
  lineHeight: 'var(--ui-line-height-tight)',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};

const CHIP_ACTIVE: CSSProperties = {
  borderColor: 'var(--ui-primary-fill, var(--ui-primary))',
  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
  color: 'var(--ui-primary-ink, var(--ui-surface))',
};

const STATUS_TEXT: CSSProperties = {
  fontSize: 'var(--ui-font-size-sm)',
  lineHeight: 'var(--ui-line-height-tight)',
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--ui-text-secondary)',
};

const CANCEL: CSSProperties = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: TAP,
  minHeight: TAP,
  padding: '0 var(--ui-spacing-3)',
  border: 0,
  borderRadius: 'var(--ui-radius-full)',
  background: 'transparent',
  color: 'var(--ui-text)',
  fontFamily: 'inherit',
  fontSize: 'var(--ui-font-size-sm)',
  fontWeight: 600,
  textDecoration: 'underline',
  cursor: 'pointer',
};

/* ─── SleepTimer ─────────────────────────────────────────────────────── */

/**
 * Selector de «detener en…» para reproductores de audio y vídeo: unas pocas
 * opciones en minutos (las pone quien llama), una opción «al terminar la
 * pista» si hay texto para ella, y, con el temporizador en marcha, lo que falta
 * y un botón para cancelarlo. No tiene reloj: el estado y la cuenta atrás son
 * de quien lo usa, que le pasa `value` y `remainingSeconds`.
 *
 * Son botones con `aria-pressed` dentro de un grupo con nombre, no un
 * `<select>`: se ven todas las opciones de un vistazo y cada una es una
 * pulsación. Todas miden 44 px o más. El activo se distingue por el relleno
 * Y por `aria-pressed`, no solo por el color.
 *
 * No anima nada, así que `prefers-reduced-motion` no tiene nada que apagar.
 *
 * Al cancelar con el botón, el foco pasa a la opción que estaba activa (el
 * botón de cancelar desaparece y el foco no debe caer al principio de la página).
 */
export function SleepTimer({ value, onChange, options, remainingSeconds, labels, className = '' }: SleepTimerProps) {
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());

  const minutes = [...new Set(options.filter((n) => Number.isFinite(n) && n > 0))];
  const hasEnd = Boolean(labels.end);

  const keyOf = (v: number | 'end') => String(v);
  const register = (v: number | 'end') => (node: HTMLButtonElement | null) => {
    if (node) chipRefs.current.set(keyOf(v), node);
    else chipRefs.current.delete(keyOf(v));
  };

  const toggle = (next: number | 'end') => onChange(value === next ? null : next);

  const cancel = () => {
    const previous = value;
    onChange(null);
    if (previous !== null) chipRefs.current.get(keyOf(previous))?.focus();
  };

  let status: string | null = null;
  if (value === 'end') {
    status = labels.endStatus ?? labels.end ?? null;
  } else if (value !== null && remainingSeconds !== undefined) {
    status = labels.remaining(formatClock(Math.ceil(remainingSeconds)));
  }

  const chip = (v: number | 'end', text: string) => {
    const active = value === v;
    return (
      <button
        key={keyOf(v)}
        ref={register(v)}
        type="button"
        aria-pressed={active}
        onClick={() => toggle(v)}
        className="ui-focus-ring"
        style={active ? { ...CHIP, ...CHIP_ACTIVE } : CHIP}
      >
        {text}
      </button>
    );
  };

  return (
    <div
      className={className}
      style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 'var(--ui-spacing-2)' }}
    >
      <div
        role="group"
        aria-label={labels.group}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ui-spacing-2)' }}
      >
        {minutes.map((n) => chip(n, labels.minutes(n)))}
        {hasEnd && chip('end', labels.end as string)}
      </div>

      {status !== null && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--ui-spacing-2)' }}>
          <span role="timer" aria-live="off" style={STATUS_TEXT}>
            {status}
          </span>
          <button type="button" onClick={cancel} className="ui-focus-ring" style={CANCEL}>
            {labels.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
