interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)] ${className}`}>
      <div
        className="h-full rounded-full bg-[var(--ui-primary)] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
