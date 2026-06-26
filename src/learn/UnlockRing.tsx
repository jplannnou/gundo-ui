'use client';
import '../ui-classes.css';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type UnlockRingSize = 'sm' | 'md' | 'lg';

export interface UnlockRingSegment {
  /** Data source name, e.g. "Sangre", "Microbiota" (host copy) */
  label: string;
  done: boolean;
}

export interface UnlockRingProps {
  /** Current progress (e.g. parameters unlocked) */
  value: number;
  /** Total available */
  max: number;
  /** What the ring measures, shown below (host copy) */
  label?: string;
  /**
   * Optional discrete segments (e.g. data sources: sangre/orina/microbiota/
   * nutrigenética). When present, the ring renders one arc per segment
   * (done = filled) and a legend below.
   */
  segments?: UnlockRingSegment[];
  size?: UnlockRingSize;
  /** Accessible name when `label` is not enough context */
  ariaLabel?: string;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const sizeMap: Record<UnlockRingSize, { diameter: number; stroke: number; font: number }> = {
  sm: { diameter: 64, stroke: 6, font: 13 },
  md: { diameter: 96, stroke: 8, font: 18 },
  lg: { diameter: 128, stroke: 10, font: 24 },
};

/* ─── UnlockRing ─────────────────────────────────────────────────────── */

/**
 * Progress/completeness ring with unlock framing — shows what the user HAS
 * unlocked (never frames missing data as debt). The arc animates
 * (stroke-dashoffset) when it enters the viewport; segments stagger in.
 *
 * `prefers-reduced-motion`: final state renders immediately.
 */
export function UnlockRing({
  value,
  max,
  label,
  segments,
  size = 'md',
  ariaLabel,
  className = '',
}: UnlockRingProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-40px' });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reduced || isInView) setRevealed(true);
  }, [reduced, isInView]);

  const { diameter, stroke, font } = sizeMap[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeMax = Math.max(1, max);
  const ratio = Math.max(0, Math.min(1, value / safeMax));

  const transitionStyle = reduced
    ? undefined
    : `stroke-dashoffset var(--ui-duration-reveal) var(--ui-easing-out), stroke 200ms`;

  const center = diameter / 2;

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={ariaLabel ?? (label ? `${label}: ${value}/${safeMax}` : `${value}/${safeMax}`)}
    >
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} aria-hidden="true">
          {segments && segments.length > 0 ? (
            /* Segmented: one arc per data source, gaps between */
            segments.map((seg, i) => {
              const segCount = segments.length;
              const gap = Math.min(6, circumference * 0.02);
              const segLen = circumference / segCount - gap;
              const offset = -((circumference / segCount) * i);
              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.done && revealed ? 'var(--ui-primary)' : 'var(--ui-border)'}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${segLen} ${circumference - segLen}`}
                  strokeDashoffset={offset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    transition: reduced
                      ? undefined
                      : `stroke var(--ui-duration-reveal) var(--ui-easing-out) ${i * 90}ms`,
                  }}
                />
              );
            })
          ) : (
            <>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--ui-border)"
                strokeWidth={stroke}
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--ui-primary)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={revealed ? circumference * (1 - ratio) : circumference}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  transition: transitionStyle,
                }}
              />
            </>
          )}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center leading-none"
          aria-hidden="true"
        >
          <span className="font-bold tabular-nums gu-text-text" style={{ fontSize: font }}>
            {value}
            <span className="font-medium gu-text-text-secondary" style={{ fontSize: font * 0.6 }}>
              /{safeMax}
            </span>
          </span>
        </div>
      </div>

      {label && (
        <span className="text-xs font-medium gu-text-text-secondary">{label}</span>
      )}

      {segments && segments.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: seg.done ? 'var(--ui-primary)' : 'var(--ui-border)' }}
                aria-hidden="true"
              />
              <span className={seg.done ? 'gu-text-text' : 'gu-text-text-secondary'}>
                {seg.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
