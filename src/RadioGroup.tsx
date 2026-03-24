'use client';
import { useRef, useCallback, type KeyboardEvent } from 'react';

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  orientation = 'vertical',
  size = 'md',
  label,
  disabled,
  className = '',
}: RadioGroupProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isVertical = orientation === 'vertical';
  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === nextKey) {
        nextIndex = (index + 1) % options.length;
      } else if (e.key === prevKey) {
        nextIndex = (index - 1 + options.length) % options.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = options.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        let attempts = 0;
        while ((options[nextIndex].disabled || disabled) && attempts < options.length) {
          if (e.key === prevKey || e.key === 'End') {
            nextIndex = (nextIndex - 1 + options.length) % options.length;
          } else {
            nextIndex = (nextIndex + 1) % options.length;
          }
          attempts++;
        }
        if (!options[nextIndex].disabled) {
          buttonRefs.current[nextIndex]?.focus();
          onChange(options[nextIndex].value);
        }
      }
    },
    [options, onChange, prevKey, nextKey, disabled],
  );

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const dotSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const innerDot = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-2' : 'gap-3';

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex ${isVertical ? `flex-col ${gap}` : `flex-row ${gap} flex-wrap`} ${className}`}
    >
      {options.map((opt, index) => {
        const isSelected = opt.value === value;
        const isDisabled = opt.disabled || disabled;
        return (
          <button
            key={opt.value}
            ref={el => { buttonRefs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => !isDisabled && onChange(opt.value)}
            onKeyDown={e => handleKeyDown(e, index)}
            className={`flex items-start gap-2.5 text-left rounded-lg px-1 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span
              className={`${dotSize} shrink-0 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)]'
                  : 'border-[var(--ui-border-hover)] bg-transparent'
              }`}
            >
              {isSelected && (
                <span className={`${innerDot} rounded-full bg-[var(--ui-surface)]`} />
              )}
            </span>
            <span className="flex flex-col">
              <span className={`${textSize} font-medium text-[var(--ui-text)]`}>
                {opt.label}
              </span>
              {opt.description && (
                <span className={`${size === 'sm' ? 'text-[0.65rem]' : 'text-xs'} text-[var(--ui-text-muted)] mt-0.5`}>
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
