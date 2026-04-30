import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ScoreGaugeVariant = 'default' | 'compact' | 'minimal' | 'match';

/** A scoring band: from `min` (inclusive) to next band's min, with color + label */
export interface ScoreBand {
  /** Threshold (inclusive). Score >= min belongs to this band. */
  min: number;
  /** CSS color value (typically a `var(--ui-*)` token reference) */
  color: string;
  /** Accessible label for this band (used as default ARIA label and badge text) */
  label: string;
}

/** Default 4-band scale matching legacy ScoreGauge behavior (Spanish labels). */
export const DEFAULT_SCORE_BANDS: ScoreBand[] = [
  { min: 75, color: 'var(--ui-range-optimal)', label: 'Excelente' },
  { min: 50, color: 'var(--ui-primary)', label: 'Bueno' },
  { min: 25, color: 'var(--ui-range-attention)', label: 'Regular' },
  { min: 0, color: 'var(--ui-range-critical)', label: 'Bajo' },
];

/** Match-style bands (for product match%, recipe affinity, etc.) */
export const MATCH_SCORE_BANDS: ScoreBand[] = [
  { min: 90, color: 'var(--ui-range-optimal)', label: 'Match perfecto' },
  { min: 70, color: 'var(--ui-range-good)', label: 'Buen match' },
  { min: 40, color: 'var(--ui-range-attention)', label: 'Match medio' },
  { min: 0, color: 'var(--ui-range-critical)', label: 'Bajo match' },
];

export interface ScoreGaugeProps {
  /** Score value 0–100 */
  score: number;
  /** Label below the score */
  label?: string;
  /** Sub-label or description */
  sublabel?: string;
  /** Icon in the center (replaces numeric value when provided) */
  icon?: ReactNode;
  /** Display size in pixels (diameter) */
  size?: number;
  /** Visual variant. `match` formats the value as "{n}%" for product/recipe affinity. */
  variant?: ScoreGaugeVariant;
  /** Override color (defaults to band color from `bands` based on score) */
  color?: string;
  /** Show numeric score value */
  showValue?: boolean;
  /** Arc stroke width */
  strokeWidth?: number;
  /**
   * Custom band thresholds with colors and labels. Bands must be sorted descending by `min`.
   * Defaults to `DEFAULT_SCORE_BANDS`. Use `MATCH_SCORE_BANDS` for match% patterns,
   * or pass a custom array for domain-specific scales (e.g. health data ranges).
   */
  bands?: ScoreBand[];
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getBandFor(score: number, bands: ScoreBand[]): ScoreBand {
  // Bands are sorted descending by min — first matching band wins.
  return bands.find((b) => score >= b.min) ?? bands[bands.length - 1];
}

/* ─── ScoreGauge ──────────────────────────────────────────────────────── */

export function ScoreGauge({
  score,
  label,
  sublabel,
  icon,
  size = 80,
  variant = 'default',
  color,
  showValue = true,
  strokeWidth,
  bands = DEFAULT_SCORE_BANDS,
  className = '',
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const activeBand = getBandFor(clampedScore, bands);
  const resolvedColor = color ?? activeBand.color;
  const resolvedStroke = strokeWidth ?? (variant === 'minimal' ? 3 : variant === 'compact' ? 5 : 7);
  const valueDisplay = variant === 'match' ? `${clampedScore}%` : `${clampedScore}`;

  // SVG arc geometry
  const radius = (size - resolvedStroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 270° arc (¾ of circle), starting from bottom-left
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const dashOffset = arcLength - (clampedScore / 100) * arcLength;
  // Rotate so arc starts at bottom-left (225°) → ends at bottom-right (135°)
  const rotateAngle = 135;

  const fontSize =
    variant === 'minimal'
      ? Math.round(size * 0.22)
      : variant === 'compact'
        ? Math.round(size * 0.26)
        : Math.round(size * 0.3);

  return (
    <div
      className={`inline-flex flex-col items-center gap-1.5 ${className}`}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? activeBand.label}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          aria-hidden="true"
          style={{ transform: `rotate(${rotateAngle}deg)` }}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="var(--ui-border)"
            strokeWidth={resolvedStroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={resolvedColor}
            strokeWidth={resolvedStroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength - dashOffset} ${circumference - (arcLength - dashOffset)}`}
            fill="none"
            style={{ transition: 'stroke-dasharray 0.4s var(--ui-ease-out, ease-out)' }}
          />
        </svg>

        {/* Center content */}
        {(showValue || icon) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingBottom: `${size * 0.08}px` }}
          >
            {icon ?? (
              <span
                className="font-bold tabular-nums leading-none"
                style={{ fontSize, color: resolvedColor }}
              >
                {valueDisplay}
              </span>
            )}
          </div>
        )}
      </div>

      {(label || sublabel) && (
        <div className="text-center">
          {label && (
            <p
              className={`font-medium text-[var(--ui-text)] ${
                variant === 'minimal' ? 'text-xs' : 'text-sm'
              }`}
            >
              {label}
            </p>
          )}
          {sublabel && (
            <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ScoreGaugeMini (inline badge variant) ──────────────────────────── */

export interface ScoreGaugeMiniProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ScoreGaugeMini({
  score,
  size = 32,
  strokeWidth = 3,
  color,
  className = '',
}: ScoreGaugeMiniProps) {
  return (
    <ScoreGauge
      score={score}
      size={size}
      strokeWidth={strokeWidth}
      variant="minimal"
      color={color}
      showValue
      className={className}
    />
  );
}