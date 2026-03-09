interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-1.5';

  return (
    <div
      role="radiogroup"
      className={`inline-flex rounded-lg bg-[var(--ui-surface)] border border-[var(--ui-border)] p-0.5 ${className}`}
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`${sizeClass} rounded-md font-medium transition-all ${
              isActive
                ? 'bg-[var(--ui-primary)] text-white shadow-sm'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
