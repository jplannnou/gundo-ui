interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, showPercentage, color, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--ui-text-secondary)]">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--ui-primary)' }}
        />
      </div>
    </div>
  );
}
