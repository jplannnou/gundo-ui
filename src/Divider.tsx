interface DividerProps {
  className?: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ className = '', label, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`self-stretch w-px min-h-4 bg-[var(--ui-border)] ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`} role="separator">
        <div className="flex-1 h-px bg-[var(--ui-border)]" />
        <span className="text-xs text-[var(--ui-text-muted)] uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-[var(--ui-border)]" />
      </div>
    );
  }

  return (
    <div
      className={`h-px w-full bg-[var(--ui-border)] ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
