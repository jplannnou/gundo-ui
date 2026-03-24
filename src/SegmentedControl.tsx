'use client';
import { useRef, useCallback, type KeyboardEvent } from 'react';

interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Custom active background color (hex or CSS var). Falls back to --ui-primary */
  color?: string;
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
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % options.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + options.length) % options.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = options.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        // Skip disabled options
        let attempts = 0;
        while (options[nextIndex].disabled && attempts < options.length) {
          if (e.key === 'ArrowLeft' || e.key === 'End') {
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
    [options, onChange],
  );

  return (
    <div
      role="radiogroup"
      className={`inline-flex rounded-lg bg-[var(--ui-surface)] border border-[var(--ui-border)] p-0.5 ${className}`}
    >
      {options.map((opt, index) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={el => { buttonRefs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={opt.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={e => handleKeyDown(e, index)}
            className={`${sizeClass} rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
              isActive
                ? `${opt.color ? '' : 'bg-[var(--ui-primary)]'} text-white shadow-sm`
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            style={isActive && opt.color ? { backgroundColor: opt.color } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
