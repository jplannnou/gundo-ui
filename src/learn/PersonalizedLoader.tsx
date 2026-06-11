'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface LoaderPhase {
  /** Phase icon (emoji/lucide) */
  icon?: ReactNode;
  /** Phase label, e.g. "Cruzando tu analítica con 4.500 productos" */
  label: ReactNode;
}

export interface PersonalizedLoaderProps {
  /** Storytelling phases — advance automatically (or control via `activePhase`) */
  phases: LoaderPhase[];
  /** Controlled phase index; omit for auto-advance */
  activePhase?: number;
  /** Auto-advance interval per phase in ms (default 3000). Stops at the last phase. */
  phaseDurationMs?: number;
  /** Rotating secondary messages — pass REAL user data from the host */
  messages?: string[];
  /** Rotation interval in ms (default 4000) */
  messageIntervalMs?: number;
  /** Determinate progress 0-100; omit for the indeterminate breathing bar */
  progress?: number;
  /**
   * Every long loader needs an exit (the infinite-spinner lesson): after
   * `timeoutMs` the loader fires `onTimeout` and renders `errorState`.
   */
  timeoutMs?: number;
  onTimeout?: () => void;
  /** Rendered instead of the loader once `timeoutMs` elapses */
  errorState?: ReactNode;
  className?: string;
}

/* ─── PersonalizedLoader ─────────────────────────────────────────────── */

/**
 * Loader with storytelling — tells the user WHAT is being personalized
 * while they wait (phases + rotating real-data messages) instead of a
 * naked spinner. Indeterminate "breathing" bar or determinate `progress`.
 *
 * Always give long loaders an exit: `timeoutMs` + `errorState`.
 * `prefers-reduced-motion`: instant phase swaps, static bar.
 */
export function PersonalizedLoader({
  phases,
  activePhase,
  phaseDurationMs = 3000,
  messages,
  messageIntervalMs = 4000,
  progress,
  timeoutMs,
  onTimeout,
  errorState,
  className = '',
}: PersonalizedLoaderProps) {
  const reduced = useReducedMotion();
  const [internalPhase, setInternalPhase] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const phase = Math.min(activePhase ?? internalPhase, Math.max(0, phases.length - 1));
  const isControlled = activePhase !== undefined;

  // Auto-advance phases (stop at the last one — it represents "almost done")
  useEffect(() => {
    if (isControlled || timedOut || phases.length <= 1) return;
    if (internalPhase >= phases.length - 1) return;
    const id = setTimeout(() => setInternalPhase((p) => p + 1), phaseDurationMs);
    return () => clearTimeout(id);
  }, [isControlled, timedOut, internalPhase, phases.length, phaseDurationMs]);

  // Rotate messages cyclically
  useEffect(() => {
    if (timedOut || !messages || messages.length <= 1) return;
    const id = setInterval(
      () => setMessageIndex((i) => (i + 1) % messages.length),
      messageIntervalMs,
    );
    return () => clearInterval(id);
  }, [timedOut, messages, messageIntervalMs]);

  // Timeout — every long loader has an exit
  useEffect(() => {
    if (!timeoutMs) return;
    const id = setTimeout(() => {
      setTimedOut(true);
      onTimeoutRef.current?.();
    }, timeoutMs);
    return () => clearTimeout(id);
  }, [timeoutMs]);

  if (timedOut && errorState) {
    return <div className={className}>{errorState}</div>;
  }

  const current = phases[phase];
  const swapTransition = { duration: reduced ? 0 : 0.25, ease: [0, 0, 0.2, 1] as const };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full max-w-md flex-col items-center gap-4 px-6 py-8 text-center ${className}`}
    >
      {/* Phase */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -10 }}
          transition={swapTransition}
          className="flex flex-col items-center gap-2"
        >
          {current?.icon && (
            <span className="text-3xl leading-none" aria-hidden="true">
              {current.icon}
            </span>
          )}
          <p className="text-base font-semibold text-[var(--ui-text)]">{current?.label}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]"
        aria-hidden="true"
      >
        {progress !== undefined ? (
          <div
            className="h-full rounded-full bg-[var(--ui-primary)]"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
              transition: reduced ? undefined : 'width var(--ui-duration-slow) var(--ui-easing-out)',
            }}
          />
        ) : reduced ? (
          <div className="h-full w-1/2 rounded-full bg-[var(--ui-primary)] opacity-60" />
        ) : (
          <motion.div
            className="h-full w-2/5 rounded-full bg-[var(--ui-primary)]"
            animate={{ x: ['-100%', '280%'], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Phase dots */}
      {phases.length > 1 && (
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {phases.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{
                background: i <= phase ? 'var(--ui-primary)' : 'var(--ui-border)',
              }}
            />
          ))}
        </div>
      )}

      {/* Rotating real-data messages */}
      {messages && messages.length > 0 && (
        <div className="min-h-[20px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={messageIndex}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={swapTransition}
              className="text-sm text-[var(--ui-text-secondary)]"
            >
              {messages[messageIndex % messages.length]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
