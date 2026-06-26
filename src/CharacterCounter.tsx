import './ui-classes.css';
import type { HTMLAttributes } from 'react';

export interface CharacterCounterProps extends HTMLAttributes<HTMLSpanElement> {
  current: number;
  max: number;
  /** Warning threshold as fraction of max (default 0.9) */
  warnAt?: number;
  showRemaining?: boolean;
}

export function CharacterCounter({
  current,
  max,
  warnAt = 0.9,
  showRemaining = false,
  className = '',
  ...props
}: CharacterCounterProps) {
  const remaining = max - current;
  const ratio = current / max;
  const isOver = current > max;
  const isWarning = !isOver && ratio >= warnAt;

  const color = isOver
    ? 'gu-text-error'
    : isWarning
      ? 'gu-text-warning'
      : 'gu-text-text-muted';

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`${current} de ${max} caracteres`}
      className={`text-xs tabular-nums ${color} ${className}`}
      {...props}
    >
      {showRemaining ? remaining : current}
      <span className="opacity-60">/{max}</span>
    </span>
  );
}
