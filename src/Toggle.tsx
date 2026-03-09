export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const trackSize = {
  sm: 'w-8 h-[18px]',
  md: 'w-10 h-[22px]',
} as const;

const thumbSize = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
} as const;

const thumbTranslate = {
  sm: 'translate-x-[14px]',
  md: 'translate-x-[18px]',
} as const;

export function Toggle({ checked, onChange, label, disabled = false, size = 'md', className = '' }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${trackSize[size]} ${
          checked ? 'bg-[var(--ui-primary)]' : 'bg-[var(--ui-border)]'
        }`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ${thumbSize[size]} ${
            checked ? thumbTranslate[size] : 'translate-x-[3px]'
          }`}
        />
      </button>
      {label && (
        <span className="text-sm text-[var(--ui-text)]">{label}</span>
      )}
    </label>
  );
}
