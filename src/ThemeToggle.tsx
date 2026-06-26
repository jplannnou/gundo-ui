'use client';
import './ui-classes.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './utils/useTheme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'row';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'w-7 h-7 p-1',
  md: 'w-9 h-9 p-1.5',
  lg: 'w-11 h-11 p-2',
};

const iconSize: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

// Using Lucide Sun and Moon icons directly

export function ThemeToggle({ size = 'md', variant = 'icon', className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isLight = resolvedTheme === 'light';

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        className={`flex items-center gap-3 w-full px-3 py-2.5 gu-rounded-radius-md text-sm font-medium gu-text-text-secondary gu-h-text-text gu-h-bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color ${className}`}
      >
        <span className="w-5 h-5 flex items-center justify-center text-base" aria-hidden="true">
          {isLight ? '☀️' : '🌙'}
        </span>
        <span>{isLight ? 'Light mode' : 'Dark mode'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`${sizeStyles[size]} gu-rounded-radius-md border gu-border-border gu-bg-surface gu-text-text-secondary gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color ${className}`}
    >
      {isLight ? <Moon className={iconSize[size]} aria-hidden="true" /> : <Sun className={iconSize[size]} aria-hidden="true" />}
    </button>
  );
}
