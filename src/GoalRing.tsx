import './ui-classes.css';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type GoalRingSize = 'md' | 'lg' | 'xl';

export interface GoalRingProps {
  /** Progreso actual (p. ej. 2 entrenos hechos). Se acota a `[0, max]`. */
  value: number;
  /** Meta (p. ej. 3 entrenos por semana). Con `max <= 0` el anillo queda vacío. */
  max: number;
  /** Nombre accesible del medidor (ya traducido), p. ej. «Entrenos de la semana». */
  label: string;
  /**
   * Texto que lee el lector de pantalla como valor (`aria-valuetext`), ya
   * traducido, p. ej. «2 de 3 entrenos». Sin él se anuncian solo los números.
   */
  valueText?: string;
  /** Contenido de la cifra central. Por defecto `value/max` (con `value` acotado). */
  centerLabel?: ReactNode;
  /** Línea pequeña bajo la cifra central (ya traducida). */
  caption?: string;
  /** Tamaño: `md` 96 px, `lg` 144 px, `xl` 200 px. */
  size?: GoalRingSize;
  /** Grosor del trazo en px. Por defecto depende del tamaño. */
  strokeWidth?: number;
  /** Color del arco mientras la meta está en curso. Por defecto `var(--ui-primary)`. */
  color?: string;
  /** Color del arco cuando `value >= max`. Por defecto `var(--ui-success)`. */
  completeColor?: string;
  /** Pinta el valor final directo, sin animar el llenado. */
  disableAnimation?: boolean;
  /** Clases extra para el contenedor. */
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const sizeMap: Record<GoalRingSize, { diameter: number; stroke: number; font: number }> = {
  md: { diameter: 96, stroke: 8, font: 28 },
  lg: { diameter: 144, stroke: 10, font: 44 },
  xl: { diameter: 200, stroke: 12, font: 60 },
};

const FILL_DURATION_MS = 700;

/** Un valor no finito (NaN, Infinity) cuenta como 0: el anillo nunca se rompe. */
function finiteOrZero(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/* ─── GoalRing ───────────────────────────────────────────────────────── */

/**
 * Anillo de meta «valor de máximo» (p. ej. 2 de 3 entrenos esta semana).
 *
 * A diferencia de `MatchScoreRing` (un porcentaje con color semántico por
 * tramo), este anillo no juzga: lleva un solo color y solo cambia a
 * `completeColor` cuando la meta se cumple. Toda la copy entra por props ya
 * traducidas.
 */
export function GoalRing({
  value,
  max,
  label,
  valueText,
  centerLabel,
  caption,
  size = 'md',
  strokeWidth,
  color = 'var(--ui-primary)',
  completeColor = 'var(--ui-success)',
  disableAnimation = false,
  className = '',
}: GoalRingProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = !disableAnimation && !reduceMotion;

  const safeMax = Math.max(0, finiteOrZero(max));
  const safeValue = Math.max(0, Math.min(safeMax, finiteOrZero(value)));
  const targetFraction = safeMax > 0 ? safeValue / safeMax : 0;
  const isComplete = safeMax > 0 && safeValue >= safeMax;

  const { diameter, stroke: defaultStroke, font } = sizeMap[size];
  const stroke = strokeWidth ?? defaultStroke;
  const radius = Math.max(0, (diameter - stroke) / 2);
  const circumference = 2 * Math.PI * radius;

  const [animatedFraction, setAnimatedFraction] = useState(shouldAnimate ? 0 : targetFraction);
  // Última fracción pintada: si el valor cambia a mitad de camino, el llenado
  // sigue desde donde está y no vuelve a empezar desde cero.
  const fractionRef = useRef(animatedFraction);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      // Deja el estado al día para que, si la animación se reactiva, el llenado
      // parta del valor que se estaba viendo y no de uno antiguo.
      fractionRef.current = targetFraction;
      setAnimatedFraction(targetFraction);
      return;
    }

    const from = fractionRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FILL_DURATION_MS);
      // ease-out cúbico
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (targetFraction - from) * eased;
      fractionRef.current = next;
      setAnimatedFraction(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetFraction, shouldAnimate]);

  // Sin animación se pinta el valor final directo, sin pasar por estado.
  const shownFraction = shouldAnimate ? animatedFraction : targetFraction;
  const dashOffset = circumference * (1 - shownFraction);
  const arcColor = isComplete ? completeColor : color;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: diameter, height: diameter }}
      role="meter"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuetext={valueText}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="var(--ui-surface-strong, var(--ui-border))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            // Arranca arriba (a las 12) y llena en sentido horario.
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: stroke + 4 }}
      >
        <span
          className="gu-display gu-text-text tabular-nums leading-none"
          style={{ fontSize: font }}
        >
          {centerLabel ?? `${safeValue}/${safeMax}`}
        </span>
        {caption && (
          <span className="mt-1 text-xs leading-tight gu-text-text-secondary">{caption}</span>
        )}
      </div>
    </div>
  );
}
