'use client';
import '../ui-classes.css';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CelebrationIntensity = 'gentle' | 'celebrate';

export interface ProgressCelebrationCountUp {
  /** Number to count up to (e.g. 24 for "+24 parámetros desbloqueados") */
  to: number;
  prefix?: string;
  suffix?: string;
  /** BCP-47 locale for formatting; defaults to the browser locale */
  locale?: string;
}

export interface ProgressCelebrationProps {
  /** Milestone copy (host-provided) */
  message: ReactNode;
  /** Numeric payoff with count-up, e.g. { to: 24, prefix: '+', suffix: ' parámetros' } */
  countUp?: ProgressCelebrationCountUp;
  /** Extra static detail under the message */
  detail?: ReactNode;
  intensity?: CelebrationIntensity;
  /** Auto-dismiss after N ms (default 4000). Pass 0 to keep it until unmounted. */
  duration?: number;
  /** Fired after the exit animation completes (host unmounts here) */
  onDone?: () => void;
  /** Optional leading icon/emoji slot */
  icon?: ReactNode;
  className?: string;
}

/* ─── Particles (own SVG/CSS burst — zero canvas deps) ───────────────── */

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  round: boolean;
}

const PARTICLE_COLORS = [
  'var(--ui-primary)',
  'var(--ui-success)',
  'var(--ui-info)',
  'var(--ui-warning)',
];

function makeParticles(intensity: CelebrationIntensity): Particle[] {
  const count = intensity === 'celebrate' ? 24 : 12;
  const maxDistance = intensity === 'celebrate' ? 150 : 90;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const distance = maxDistance * (0.5 + Math.random() * 0.5);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 20,
      size: 4 + Math.random() * 5,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      delay: Math.random() * 0.15,
      duration: 0.8 + Math.random() * 0.5,
      round: i % 3 !== 0,
    };
  });
}

/* ─── Count-up ───────────────────────────────────────────────────────── */

function CountUpValue({ countUp, animate }: { countUp: ProgressCelebrationCountUp; animate: boolean }) {
  const [value, setValue] = useState(animate ? 0 : countUp.to);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setValue(countUp.to);
      return;
    }
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(countUp.to * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [countUp.to, animate]);

  return (
    <span className="font-semibold tabular-nums gu-text-primary">
      {countUp.prefix ?? ''}
      {value.toLocaleString(countUp.locale)}
      {countUp.suffix ?? ''}
    </span>
  );
}

/* ─── ProgressCelebration ────────────────────────────────────────────── */

/**
 * Contained milestone celebration — a card with an SVG/CSS particle burst
 * (no canvas-confetti dependency), message, optional count-up payoff and
 * auto-dismiss. Use for real milestones (test uploaded, plan generated),
 * not routine actions.
 *
 * `prefers-reduced-motion`: simple fade, no particles, counter static.
 */
export function ProgressCelebration({
  message,
  countUp,
  detail,
  intensity = 'gentle',
  duration = 4000,
  onDone,
  icon,
  className = '',
}: ProgressCelebrationProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const particles = useMemo(
    () => (reduced ? [] : makeParticles(intensity)),
    [reduced, intensity],
  );

  useEffect(() => {
    if (duration <= 0) return;
    const id = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(id);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.25 } }}
          transition={
            reduced
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 320, damping: 24 }
          }
          className={`relative inline-flex flex-col items-center gap-1 rounded-xl border gu-border-border gu-bg-surface px-6 py-5 text-center gu-shadow-shadow-md ${className}`}
        >
          {/* Particle burst — decorative, contained to the card's center */}
          {particles.length > 0 && (
            <span
              className="pointer-events-none absolute left-1/2 top-1/2"
              aria-hidden="true"
            >
              {particles.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: p.x, y: p.y, scale: 1, opacity: 0 }}
                  transition={{ duration: p.duration, delay: p.delay, ease: [0, 0, 0.2, 1] }}
                  className="absolute"
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    borderRadius: p.round ? '50%' : 2,
                  }}
                />
              ))}
            </span>
          )}

          {icon && (
            <span className="text-2xl leading-none" aria-hidden="true">
              {icon}
            </span>
          )}
          <p className="text-base font-semibold gu-text-text">{message}</p>
          {countUp && (
            <p className="text-sm gu-text-text-secondary">
              <CountUpValue countUp={countUp} animate={!reduced} />
            </p>
          )}
          {detail && <p className="text-sm gu-text-text-secondary">{detail}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
