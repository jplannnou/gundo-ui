import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ScoreGaugeVariant = 'default' | 'compact' | 'minimal';

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
  /** Visual variant */
  variant?: ScoreGaugeVariant;
  /** Override color (defaults to semantic color based on score) */
  color?: string;
  /** Show numeric score value */
  showValue?: boolean;
  /** Arc stroke width */
  strokeWidth?: number;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getSemanticColor(score: number): string {
  if (score >= 75) return 'var(--ui-success)';
  if (score >= 50) return 'var(--ui-primary)';
  if (score >= 25) return 'var(--ui-warning)';
  return 'var(--ui-error)';
}

function getSemanticLabel(score: number): string {
  if (score >= 75) return 'Excelente';
  if (score >= 50) return 'Bueno';
  if (score >= 25) return 'Regular';
  return 'Bajo';
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
  className = '',
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const resolvedColor = color ?? getSemanticColor(clampedScore);
  const resolvedStroke = strokeWidth ?? (variant === 'minimal' ? 3 : variant === 'compact' ? 5 : 7);

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
      aria-label={label ?? getSemanticLabel(clampedScore)}
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
                {clampedScore}
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