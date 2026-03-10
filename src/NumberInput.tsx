import { useRef, useId, type KeyboardEvent } from 'react';

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'h-8 text-sm px-2',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const btnSize: Record<string, string> = {
  sm: 'w-7 h-8',
  md: 'w-9 h-10',
  lg: 'w-10 h-12',
};

function clamp(val: number, min?: number, max?: number): number {
  if (min !== undefined && val < min) return min;
  if (max !== undefined && val > max) return max;
  return val;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  size = 'md',
  placeholder,
  disabled = false,
  label,
  className = '',
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const increment = () => {
    const current = typeof value === 'number' ? value : 0;
    onChange(clamp(current + step, min, max));
  };

  const decrement = () => {
    const current = typeof value === 'number' ? value : 0;
    onChange(clamp(current - step, min, max));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      onChange('');
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  const handleBlur = () => {
    if (typeof value === 'number') {
      onChange(clamp(value, min, max));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
  };

  return (
    <div className={`inline-flex ${className}`}>
      {label && <label htmlFor={id} className="sr-only">{label}</label>}
      <div className="flex items-center rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] focus-within:ring-2 focus-within:ring-[var(--ui-focus-ring-color)]">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (min !== undefined && typeof value === 'number' && value <= min)}
          tabIndex={-1}
          aria-label="Decrease"
          className={`${btnSize[size]} flex items-center justify-center border-r border-[var(--ui-border)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>

        <div className={`flex items-center gap-1 ${sizeStyles[size]}`}>
          {prefix && <span className="text-[var(--ui-text-muted)] select-none">{prefix}</span>}
          <input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            role="spinbutton"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof value === 'number' ? value : undefined}
            value={value}
            onChange={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-w-[3ch] text-center bg-transparent text-[var(--ui-text)] outline-none disabled:opacity-40"
          />
          {suffix && <span className="text-[var(--ui-text-muted)] select-none">{suffix}</span>}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && typeof value === 'number' && value >= max)}
          tabIndex={-1}
          aria-label="Increase"
          className={`${btnSize[size]} flex items-center justify-center border-l border-[var(--ui-border)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>
    </div>
  );
}
