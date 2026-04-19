import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MatchScoreRingSize = 'sm' | 'md' | 'lg';

export interface MatchScoreRingProps {
  /** Score 0-100 */
  score: number;
  /** Display size */
  size?: MatchScoreRingSize;
  /** Optional label shown below the ring */
  label?: string;
  /** Override color (defaults to semantic by score) */
  color?: string;
  /** Stroke width (optional override) */
  strokeWidth?: number;
  /** Disable enter animation */
  disableAnimation?: boolean;
  /** Hide numeric value inside the ring */
  hideValue?: boolean;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const sizeMap: Record<MatchScoreRingSize, { diameter: number; stroke: number; font: number }> = {
  sm: { diameter: 48, stroke: 4, font: 14 },
  md: { diameter: 72, stroke: 6, font: 18 },
  lg: { diameter: 112, stroke: 8, font: 28 },
};

function semanticColor(score: number): string {
  if (score >= 80) return 'var(--ui-success)';
  if (score >= 60) return 'var(--ui-primary)';
  if (score >= 40) return 'var(--ui-warning)';
  return 'var(--ui-error)';
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/* ─── MatchScoreRing ─────────────────────────────────────────────────── */

export function MatchScoreRing({
  score,
  size = 'md',
  label,
  color,
  strokeWidth,
  disableAnimation = false,
  hideValue = false,
  className = '',
}: MatchScoreRingProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = !disableAnimation && !reduceMotion;
  const targetScore = clamp(score);
  const { diameter, stroke: defaultStroke, font } = sizeMap[size];
  const stroke = strokeWidth ?? defaultStroke;
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayScore, setDisplayScore] = useState(shouldAnimate ? 0 : targetScore);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayScore(targetScore);
      return;
    }

    const start = performance.now();
    const duration = 700;
    const initial = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(initial + (targetScore - initial) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetScore, shouldAnimate]);

  const resolvedColor = color ?? semanticColor(targetScore);
  const dashOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 ${className}`}
      role="meter"
      aria-valuenow={targetScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${targetScore}%` : `Match score ${targetScore}%`}
    >
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          aria-hidden="true"
        >
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke="var(--ui-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={resolvedColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: shouldAnimate ? 'none' : 'stroke-dashoffset 0.4s ease-out',
            }}
          />
        </svg>
        {!hideValue && (
          <div
            className="absolute inset-0 flex items-center justify-center font-bold tabular-nums leading-none"
            style={{ fontSize: font, color: resolvedColor }}
          >
            {Math.round(displayScore)}
            <span className="text-[0.55em] ml-0.5">%</span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-xs font-medium text-[var(--ui-text-secondary)]">{label}</span>
      )}
    </div>
  );
}
