'use client';
import './ui-classes.css';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface BreathingPhase {
  /** Texto de la fase (ya traducido), p. ej. «Inspira». Se anuncia a los lectores de pantalla al cambiar. */
  label: string;
  /** Duración en segundos. Una fase con duración no finita o menor o igual que 0 se ignora. */
  seconds: number;
  /** `in` el círculo crece, `out` se encoge, `hold` se queda como está. */
  kind: 'in' | 'hold' | 'out';
}

export interface BreathingGuideProps {
  /**
   * Pauta de una vuelta, en orden: p. ej. inspira 4 s, sostén 4 s, espira 6 s.
   * Se lee al arrancar cada fase, así que pasar un array nuevo en cada render
   * no reinicia nada. Para CAMBIAR de pauta a mitad, cambia la `key` del componente.
   */
  phases: BreathingPhase[];
  /**
   * `true` guía; `false` pausa. Al pausar el círculo vuelve a su punto de
   * partida y, al reanudar, la fase en curso empieza de nuevo desde su primer
   * segundo (no se retoma a medias: así el círculo y el texto nunca se desfasan).
   */
  running: boolean;
  /** Número de vueltas. Se redondea hacia abajo y como mínimo es 1. Sin él, vueltas sin fin. */
  cycles?: number;
  /** Al completar cada vuelta, con el número de vueltas completadas hasta ahora (1, 2, 3…). */
  onCycle?: (completed: number) => void;
  /** Una sola vez, al completar la última vuelta (solo con `cycles`). La última fase se queda en pantalla. */
  onDone?: () => void;
  /** Nombre accesible del ejercicio (ya traducido), p. ej. «Respiración guiada». */
  ariaLabel: string;
  /** Diámetro máximo del círculo en px. Por defecto 200; mínimo 64. */
  size?: number;
  /** Muestra bajo el texto los segundos que quedan de la fase (solo visual: no se anuncia). Por defecto `false`. */
  showSeconds?: boolean;
  className?: string;
}

/* ─── Estilos ────────────────────────────────────────────────────────── */

const ROOT: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--ui-spacing-5)',
};

const LABEL: CSSProperties = {
  textAlign: 'center',
  fontSize: 'var(--ui-font-size-xl)',
  fontWeight: 600,
  lineHeight: 'var(--ui-line-height-tight)',
  minHeight: 'calc(var(--ui-font-size-xl) * var(--ui-line-height-tight))',
};

const SECONDS: CSSProperties = {
  textAlign: 'center',
  fontSize: 'var(--ui-font-size-3xl)',
  fontVariantNumeric: 'tabular-nums',
  minHeight: 'calc(var(--ui-font-size-3xl) * 1.05)',
};

/** Círculo encogido: tamaño y opacidad de reposo. El grande es `scale(1)` y opacidad 1. */
const LOW_SCALE = 0.45;
const LOW_OPACITY = 0.5;
const MIN_SIZE = 64;
const DEFAULT_SIZE = 200;

/* ─── Lógica pura ────────────────────────────────────────────────────── */

type Level = 'low' | 'high';

/**
 * Dónde está el círculo al empezar (`start`) o al acabar (`end`) la fase.
 * `in` va de pequeño a grande y `out` al revés; `hold` se queda como lo dejó la
 * última fase que se movió (sin ninguna antes, pequeño: es el reposo).
 */
function levelOf(list: BreathingPhase[], index: number, edge: 'start' | 'end'): Level {
  const kind = list[index].kind;
  if (kind === 'in') return edge === 'start' ? 'low' : 'high';
  if (kind === 'out') return edge === 'start' ? 'high' : 'low';
  for (let i = index - 1; i >= 0; i -= 1) {
    if (list[i].kind === 'in') return 'high';
    if (list[i].kind === 'out') return 'low';
  }
  return 'low';
}

/** Evita que 0.1 + 0.2 deje un resto de 1e-17 segundos sin terminar la fase. */
const trim = (n: number) => Math.round(n * 1000) / 1000;

interface RunState {
  phase: number;
  /** Segundos que le quedan a la fase en curso. */
  left: number;
  /** Vueltas completadas. */
  cycle: number;
  done: boolean;
}

/* ─── BreathingGuide ─────────────────────────────────────────────────── */

/**
 * Respiración guiada: un círculo que crece, se mantiene y se encoge según las
 * fases que le pases. Es solo la piel y el reloj: no suena nada, y quien lo
 * usa decide la pauta, cuándo arranca y qué pasa al terminar.
 *
 * Movimiento. El círculo se anima únicamente con `transform: scale` y
 * `opacity`, con una transición cuya duración es la de la fase, así que la
 * animación dura exactamente lo que dura la fase y no hay bucles de CSS que
 * desfasar. Con `prefers-reduced-motion` el círculo no se mueve: solo cambian
 * el texto y la cuenta.
 *
 * Accesibilidad. El texto de la fase está en una región `aria-live="polite"`:
 * quien respira con los ojos cerrados oye cada cambio sin que se pisen. Los
 * segundos NO se anuncian (sería una frase por segundo). El círculo es
 * decorativo. Un único temporizador encadenado lleva a la vez la cuenta y el
 * final de cada fase, y se limpia al desmontar, al pausar y al terminar.
 * Todo el texto llega por props ya traducido.
 */
export function BreathingGuide({
  phases,
  running,
  cycles,
  onCycle,
  onDone,
  ariaLabel,
  size = DEFAULT_SIZE,
  showSeconds = false,
  className = '',
}: BreathingGuideProps) {
  const reduceMotion = useReducedMotion();
  const list = phases.filter((p) => Number.isFinite(p.seconds) && p.seconds > 0);
  const limit = cycles === undefined || !Number.isFinite(cycles) ? Infinity : Math.max(1, Math.floor(cycles));
  const diameter = Number.isFinite(size) ? Math.max(MIN_SIZE, size) : DEFAULT_SIZE;

  const [state, setState] = useState<RunState>({
    phase: 0,
    left: list[0]?.seconds ?? 0,
    cycle: 0,
    done: false,
  });

  // Siempre la pauta y los avisos más recientes, sin reiniciar el temporizador por ellos.
  const listRef = useRef(list);
  const onCycleRef = useRef(onCycle);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    listRef.current = list;
    onCycleRef.current = onCycle;
    onDoneRef.current = onDone;
  });

  // Al pausar, la fase en curso vuelve a su primer segundo (ajuste durante el render, sin efecto).
  const [wasRunning, setWasRunning] = useState(running);
  if (wasRunning !== running) {
    setWasRunning(running);
    if (!running && !state.done && list.length > 0) {
      const index = Math.min(state.phase, list.length - 1);
      if (state.left !== list[index].seconds) setState({ ...state, left: list[index].seconds });
    }
  }

  // El círculo se pinta primero en su punto de partida y se arma después, para que arrancar anime.
  const circleRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    // Lectura de layout a propósito: consolida el estado inicial antes de animar.
    circleRef.current?.getBoundingClientRect();
    setArmed(true);
  }, []);

  // Un solo temporizador encadenado: cada paso es de 1 s (o lo que quede de la fase).
  useEffect(() => {
    if (!running || state.done || state.left <= 0) return;
    const step = Math.min(1, state.left);
    const id = setTimeout(() => {
      const phasesNow = listRef.current;
      if (phasesNow.length === 0) return;
      const left = trim(state.left - step);
      if (left > 0) {
        setState({ ...state, left });
        return;
      }
      const next = state.phase + 1;
      if (next < phasesNow.length) {
        setState({ ...state, phase: next, left: phasesNow[next].seconds });
        return;
      }
      const cycle = state.cycle + 1;
      onCycleRef.current?.(cycle);
      if (cycle >= limit) {
        setState({ phase: phasesNow.length - 1, left: 0, cycle, done: true });
        onDoneRef.current?.();
        return;
      }
      setState({ phase: 0, left: phasesNow[0].seconds, cycle, done: false });
    }, step * 1000);
    return () => clearTimeout(id);
  }, [running, state, limit]);

  if (list.length === 0) return null;

  const index = Math.min(state.phase, list.length - 1);
  const current = list[index];
  const moving = running && armed && !state.done;
  const level: Level = state.done ? 'low' : levelOf(list, index, moving ? 'end' : 'start');

  const circle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--ui-radius-full)',
    backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
    ...(reduceMotion
      ? null
      : {
          opacity: level === 'high' ? 1 : LOW_OPACITY,
          transform: `scale(${level === 'high' ? 1 : LOW_SCALE})`,
          transitionProperty: 'transform, opacity',
          transitionDuration: moving ? `${current.seconds}s` : 'var(--ui-duration-slow)',
          transitionTimingFunction: moving ? 'var(--ui-easing-in-out)' : 'var(--ui-easing-out)',
        }),
  };

  return (
    <div role="group" aria-label={ariaLabel} className={className} style={ROOT}>
      <div aria-hidden="true" style={{ position: 'relative', width: diameter, height: diameter }}>
        {/* Aro fijo: marca hasta dónde llega el círculo cuando está lleno. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--ui-radius-full)',
            border: '2px solid var(--ui-border-hover)',
            boxSizing: 'border-box',
          }}
        />
        <div ref={circleRef} data-breathing-circle="" style={circle} />
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        data-phase-kind={current.kind}
        className="gu-text-text"
        style={LABEL}
      >
        {current.label}
      </div>

      {showSeconds && (
        <div aria-hidden="true" data-seconds="" className="gu-display gu-text-text-secondary" style={SECONDS}>
          {state.done ? '' : Math.ceil(state.left)}
        </div>
      )}
    </div>
  );
}
