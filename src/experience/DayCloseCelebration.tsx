'use client';
import '../ui-classes.css';
import { useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, Snowflake } from 'lucide-react';
import { Button } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useHaptics } from './haptics';

/**
 * Estado de un día en la racha semanal. La racha perdona: `rest` es un día
 * congelado o de descanso, y `open` es un día sin marcar. Ninguno se pinta
 * como fallo: una racha rota reduce el uso posterior, así que no hay rojo ni
 * cruz.
 */
export type WeekDayState = 'done' | 'rest' | 'open' | 'today' | 'future';

export interface WeekDay {
  /** Inicial visible: «L», «M»… */
  short: string;
  /** Lectura completa para el lector de pantalla: «Lunes, hecho». */
  label: string;
  state: WeekDayState;
}

export interface DayCloseCelebrationProps {
  /** «Día cerrado». */
  title: ReactNode;
  /** Una frase, sin culpa ni cifras de peso o calorías. */
  message?: ReactNode;
  /** Comidas marcadas hoy. */
  completed: number;
  /** Comidas del plan hoy. */
  total: number;
  /** Lectura del progreso: «4 de 4 comidas». */
  progressLabel: string;
  /** Racha de la semana (opcional; se oculta para perfiles sin gamificación). */
  week?: WeekDay[];
  /** Nombre accesible de la racha: «Tu semana». */
  weekLabel?: string;
  action?: { label: string; onClick: () => void };
  /** Vibra al aparecer (si hay `HapticsProvider`). Por defecto, sí. */
  haptic?: boolean;
  className?: string;
}

const RING = 76;
const STROKE = 7;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

/* Pocas partículas y contenidas en el anillo: es un cierre, no una fiesta. */
function makeSparks() {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const d = 52 + (i % 3) * 8;
    return {
      x: Math.cos(a) * d,
      y: Math.sin(a) * d,
      color: i % 2 ? 'var(--ui-primary)' : 'var(--ui-success)',
      delay: 0.55 + (i % 4) * 0.04,
    };
  });
}

/**
 * Cierre del día: anillo que se completa, check que se dibuja, una ráfaga breve
 * y la racha semanal. Con `prefers-reduced-motion`, todo aparece ya en su
 * estado final, sin partículas.
 */
export function DayCloseCelebration({
  title,
  message,
  completed,
  total,
  progressLabel,
  week,
  weekLabel,
  action,
  haptic = true,
  className = '',
}: DayCloseCelebrationProps) {
  const reduced = useReducedMotion();
  const haptics = useHaptics();
  const titleId = useId();
  const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const full = ratio >= 1;
  const sparks = useMemo(() => (reduced || !full ? [] : makeSparks()), [reduced, full]);
  const fired = useRef(false);

  useEffect(() => {
    if (!haptic || fired.current) return;
    fired.current = true;
    haptics.notification(full ? 'success' : 'warning');
  }, [haptic, haptics, full]);

  const offset = C * (1 - ratio);

  return (
    <section
      aria-labelledby={titleId}
      className={`relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border px-5 py-6 text-center gu-border-border gu-bg-surface-raised ${className}`}
    >
      <div className="relative" style={{ width: RING, height: RING }}>
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} role="img" aria-label={progressLabel}>
          <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="var(--ui-border)" strokeWidth={STROKE} />
          <motion.circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            fill="none"
            stroke="var(--ui-primary)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: reduced ? offset : C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
          {full && (
            <motion.path
              d={`M ${RING * 0.34} ${RING * 0.52} L ${RING * 0.45} ${RING * 0.63} L ${RING * 0.67} ${RING * 0.4}`}
              fill="none"
              stroke="var(--ui-primary)"
              strokeWidth={STROKE - 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.6, ease: 'easeOut' }}
            />
          )}
        </svg>
        {sparks.length > 0 && (
          <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
            {sparks.map((s, i) => (
              <motion.span
                key={i}
                className="absolute block size-1.5 rounded-full"
                style={{ background: s.color }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
                transition={{ duration: 0.8, delay: s.delay, ease: [0, 0, 0.2, 1] }}
              />
            ))}
          </span>
        )}
      </div>

      <motion.div
        role="status"
        className="flex flex-col gap-1"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.5 }}
      >
        <h2 id={titleId} className="m-0 text-xl font-bold leading-tight gu-font-font-display gu-text-text">
          {title}
        </h2>
        <p className="m-0 text-sm font-semibold gu-text-text-secondary">{progressLabel}</p>
        {message && <p className="m-0 text-sm leading-relaxed gu-text-text-secondary">{message}</p>}
      </motion.div>

      {week && week.length > 0 && (
        <ol aria-label={weekLabel} className="m-0 flex list-none gap-1.5 p-0">
          {week.map((d, i) => (
            <li key={`${d.short}-${i}`} className="flex flex-col items-center gap-1">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                  d.state === 'done'
                    ? 'gu-bg-primary gu-text-surface'
                    : d.state === 'rest'
                      ? 'gu-bg-info-soft gu-text-info'
                      : d.state === 'today'
                        ? 'border-2 gu-border-primary gu-text-text'
                        : 'border gu-border-border gu-text-text-secondary'
                }`}
                aria-hidden="true"
              >
                {d.state === 'done' ? (
                  <Check size={14} strokeWidth={3} />
                ) : d.state === 'rest' ? (
                  <Snowflake size={14} strokeWidth={2.25} />
                ) : null}
              </span>
              <span className="gu-text-2xs leading-none gu-text-text-secondary" aria-hidden="true">
                {d.short}
              </span>
              <VisuallyHidden>{d.label}</VisuallyHidden>
            </li>
          ))}
        </ol>
      )}

      {action && (
        <Button type="button" onClick={action.onClick} className="min-h-11 w-full justify-center sm:w-auto">
          {action.label}
        </Button>
      )}
    </section>
  );
}
