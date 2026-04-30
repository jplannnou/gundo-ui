import { useId } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  /**
   * Accessible label when no visible `label` is provided. WCAG ARIA progressbar
   * requires an accessible name — defaults to "Progress" so a bare
   * `<ProgressBar value={n} />` still passes AA.
   */
  ariaLabel?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage,
  color,
  ariaLabel,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const labelId = useId();

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--ui-text-secondary)]">
          {label && <span id={labelId}>{label}</span>}
          {showPercentage && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? (ariaLabel ?? 'Progress') : undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]"
      >
        <div
          className="h-full rounded-full transition-[width] duration-[var(--ui-duration-slow)]"
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--ui-primary)' }}
        />
      </div>
    </div>
  );
}
