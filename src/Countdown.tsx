'use client';
import './ui-classes.css';
import './Button.css';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CountdownProps {
  /** Número desde el que se cuenta. Se redondea hacia abajo y como mínimo es 1. Por defecto 3. */
  from?: number;
  /**
   * `true` cuenta; `false` pausa. En pausa la cifra se queda donde está y, al
   * volver a `true`, el número en curso empieza su intervalo de nuevo.
   */
  running: boolean;
  /**
   * Se llama UNA sola vez cuando la cuenta termina: sola, justo al acabar el
   * último intervalo, o al pulsar «saltar». Nunca se retrasa para mostrar el
   * texto final: quien llama arranca la sesión y `doneLabel` se pinta a la vez.
   */
  onDone: () => void;
  /** Nombre accesible de la cuenta (ya traducido), p. ej. «La sesión empieza en». */
  label: string;
  /**
   * Texto final (ya traducido), p. ej. «¡Vamos!». Se pinta en lugar de la cifra y
   * se anuncia a los lectores de pantalla (región `assertive`) una sola vez.
   * Sin él, al terminar no se pinta ni se anuncia nada.
   */
  doneLabel?: string;
  /** Milisegundos entre cifras. Por defecto 1000. */
  intervalMs?: number;
  /** Texto del botón «saltar» (ya traducido). El botón solo existe si se pasa. */
  skipLabel?: string;
  /**
   * Aviso opcional (analítica, p. ej.) de que la persona saltó la cuenta. Se
   * llama justo ANTES de `onDone`, que también se dispara: saltar termina la
   * cuenta igual que acabarla, así que quien arranca la sesión en `onDone`
   * no tiene que cablear dos caminos.
   */
  onSkip?: () => void;
  className?: string;
}

/* ─── Estilos ────────────────────────────────────────────────────────── */

const ROOT: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--ui-spacing-6)',
};

/** Caja fija: la cifra y el texto final comparten altura y nada salta al cambiar. */
const STAGE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(var(--ui-font-size-5xl) * 3.4)',
  minWidth: 'calc(var(--ui-font-size-5xl) * 3)',
  textAlign: 'center',
};

const DIGIT: CSSProperties = {
  fontSize: 'calc(var(--ui-font-size-5xl) * 3)',
};

const DONE_TEXT: CSSProperties = {
  fontSize: 'var(--ui-font-size-5xl)',
};

const SKIP: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
  minHeight: 44,
  padding: '0 var(--ui-spacing-5)',
  border: '1px solid var(--ui-border-hover)',
  borderRadius: 'var(--ui-radius-full)',
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'var(--ui-font-size-sm)',
  fontWeight: 500,
  cursor: 'pointer',
};

/** Oculto a la vista pero leído por los lectores de pantalla (como `VisuallyHidden`). */
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

/* ─── Pop: entrada con escala + opacidad ─────────────────────────────── */

/**
 * Cada cifra entra desde `scale(0.6)` y opacidad 0 hasta su tamaño natural,
 * con la duración y la curva de los tokens de movimiento. Como es un elemento
 * nuevo por cada número (`key`), arranca en el estado inicial; se fuerza el
 * cálculo de estilos antes de pasar al final para que el navegador lo anime
 * como transición. Con «reducir movimiento» no hay transición: sale ya en su
 * sitio.
 */
function Pop({ animate, children }: { animate: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = useState(!animate);

  useLayoutEffect(() => {
    if (entered) return;
    // Lectura de layout a propósito: consolida el estado inicial.
    ref.current?.getBoundingClientRect();
    setEntered(true);
  }, [entered]);

  const settled = entered || !animate;
  const style: CSSProperties = animate
    ? {
        display: 'inline-block',
        opacity: settled ? 1 : 0,
        transform: settled ? 'scale(1)' : 'scale(0.6)',
        transitionProperty: 'transform, opacity',
        transitionDuration: 'var(--ui-duration-slow)',
        transitionTimingFunction: 'var(--ui-easing-out)',
      }
    : { display: 'inline-block' };

  return (
    <span ref={ref} style={style}>
      {children}
    </span>
  );
}

/* ─── Countdown ──────────────────────────────────────────────────────── */

/**
 * Cuenta atrás 3-2-1 previa a una sesión. La cifra es grande (`gu-display`) y
 * entra con escala + opacidad; con `prefers-reduced-motion` cambia sin animar.
 *
 * Accesibilidad. La cifra vive en un `role="timer"` con `aria-live="off"`: un
 * lector la lee al navegar hasta ella, pero NO la repite cada segundo (tres
 * anuncios seguidos, pisándose, son ruido). Lo único que se anuncia solo es el
 * final, en una región `aria-live="assertive"` aparte: es el instante en que
 * algo cambia para la persona (empieza la sesión), así que interrumpe. Esa
 * región existe desde el primer render, vacía, para que el cambio se anuncie.
 * Si quien llama desmonta el componente en `onDone`, el texto final no llega a
 * leerse: en ese caso la sesión que arranca debe anunciarse por su cuenta.
 *
 * Nunca retrasa la acción: `onDone` se llama en el mismo instante en que acaba
 * el último intervalo (o al saltar). Los temporizadores se limpian al
 * desmontar, al pausar (`running={false}`) y al terminar. Para reiniciar una
 * cuenta ya empezada, cambia la `key` del componente. Todo el texto llega por
 * props ya traducido.
 */
export function Countdown({
  from = 3,
  running,
  onDone,
  label,
  doneLabel,
  intervalMs = 1000,
  skipLabel,
  onSkip,
  className = '',
}: CountdownProps) {
  const reduceMotion = useReducedMotion();
  const start = Number.isFinite(from) ? Math.max(1, Math.floor(from)) : 3;
  const interval = Number.isFinite(intervalMs) ? Math.max(0, intervalMs) : 1000;

  const [count, setCount] = useState(start);
  const finishedRef = useRef(false);
  // Siempre el `onDone` más reciente, sin reiniciar el temporizador por él.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setCount(0);
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (!running || count <= 0) return;
    const id = setTimeout(() => {
      if (count <= 1) finish();
      else setCount(count - 1);
    }, interval);
    return () => clearTimeout(id);
  }, [running, count, interval, finish]);

  const done = count === 0;
  const animate = !reduceMotion;

  const skip = () => {
    if (finishedRef.current) return;
    onSkip?.();
    finish();
  };

  return (
    <div className={className} style={ROOT}>
      <div role="timer" aria-live="off" aria-label={label} style={STAGE}>
        {done ? (
          doneLabel ? (
            <Pop key="done" animate={animate}>
              {/* El anuncio lo hace la región de abajo: aquí sería leer dos veces. */}
              <span aria-hidden="true" className="gu-display gu-text-primary" style={DONE_TEXT}>
                {doneLabel}
              </span>
            </Pop>
          ) : null
        ) : (
          <Pop key={count} animate={animate}>
            <span className="gu-display gu-text-text tabular-nums" style={DIGIT}>
              {count}
            </span>
          </Pop>
        )}
      </div>

      <div aria-live="assertive" aria-atomic="true" style={SR_ONLY}>
        {done && doneLabel ? doneLabel : ''}
      </div>

      {skipLabel && !done && (
        <button type="button" onClick={skip} className="gu-text-text ui-focus-ring" style={SKIP}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}
