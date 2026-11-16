'use client';
import '../ui-classes.css';
import { useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useHaptics } from './haptics';

export interface AchievementUnlockProps {
  /** Antetítulo: «Logro». */
  eyebrow?: ReactNode;
  /** Nombre del logro: «Una semana cocinando en casa». */
  title: ReactNode;
  /** Qué hábito lo desbloqueó. Logros por hábito: nunca por peso ni calorías. */
  description?: ReactNode;
  /** Icono del medallón. Por defecto, una medalla. Decorativo. */
  icon?: ReactNode;
  /** Pie opcional (puntos, compartir). */
  footer?: ReactNode;
  /** Vibra al aparecer (si hay `HapticsProvider`). Por defecto, sí. */
  haptic?: boolean;
  className?: string;
}

const RAYS = 12;

/**
 * Logro desbloqueado: medallón que entra con un muelle, un halo de rayos y el
 * nombre del hábito. Confeti contenido: los rayos no salen de la tarjeta. Con
 * `prefers-reduced-motion` aparece quieto y sin halo.
 */
export function AchievementUnlock({
  eyebrow,
  title,
  description,
  icon,
  footer,
  haptic = true,
  className = '',
}: AchievementUnlockProps) {
  const reduced = useReducedMotion();
  const haptics = useHaptics();
  const titleId = useId();
  const fired = useRef(false);
  const rays = useMemo(() => (reduced ? [] : Array.from({ length: RAYS }, (_, i) => (i / RAYS) * 360)), [reduced]);

  useEffect(() => {
    if (!haptic || fired.current) return;
    fired.current = true;
    haptics.notification('success');
  }, [haptic, haptics]);

  return (
    <section
      aria-labelledby={titleId}
      className={`relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border px-5 py-6 text-center gu-border-border gu-bg-surface-raised ${className}`}
    >
      <div className="relative flex size-24 items-center justify-center" aria-hidden="true">
        {rays.map((deg, i) => (
          <motion.span
            key={deg}
            className="absolute left-1/2 top-1/2 block h-3 w-1 rounded-full"
            style={{ background: i % 2 ? 'var(--ui-primary)' : 'var(--ui-warning)', rotate: deg, originY: 0 }}
            initial={{ opacity: 0, y: 30, scaleY: 0.4 }}
            animate={{ opacity: [0, 1, 0], y: [30, 44, 52], scaleY: [0.4, 1, 0.6] }}
            transition={{ duration: 0.9, delay: 0.25 + (i % 3) * 0.05, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          className="flex size-20 items-center justify-center rounded-full gu-bg-warning-soft gu-text-warning"
          initial={reduced ? false : { scale: 0.4, rotate: -18, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 16 }}
        >
          {icon ?? <Award size={40} strokeWidth={1.75} />}
        </motion.span>
      </div>

      <motion.div
        role="status"
        className="flex flex-col gap-1"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.35 }}
      >
        {eyebrow && (
          <p className="m-0 text-xs font-semibold uppercase tracking-wide gu-text-text-secondary">{eyebrow}</p>
        )}
        <h2 id={titleId} className="m-0 text-lg font-bold leading-tight gu-font-font-display gu-text-text">
          {title}
        </h2>
        {description && <p className="m-0 text-sm leading-relaxed gu-text-text-secondary">{description}</p>}
      </motion.div>

      {footer}
    </section>
  );
}
