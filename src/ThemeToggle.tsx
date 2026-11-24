'use client';
import './ui-classes.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './utils/useTheme';

/**
 * Textos del conmutador. Por defecto en inglés (compatibilidad con los
 * consumidores actuales); cada app pasa los suyos desde su i18n para que el
 * lector de pantalla no anuncie inglés en una interfaz en otro idioma.
 */
export interface ThemeToggleLabels {
  /** Nombre accesible del botón cuando el tema activo es oscuro. */
  switchToLight: string;
  /** Nombre accesible del botón cuando el tema activo es claro. */
  switchToDark: string;
  /** Texto visible de la variante `row` con el tema claro activo. */
  light: string;
  /** Texto visible de la variante `row` con el tema oscuro activo. */
  dark: string;
}

const defaultLabels: ThemeToggleLabels = {
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',
  light: 'Light mode',
  dark: 'Dark mode',
};

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'row';
  className?: string;
  labels?: Partial<ThemeToggleLabels>;
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

export function ThemeToggle({ size = 'md', variant = 'icon', className = '', labels }: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isLight = resolvedTheme === 'light';
  const text = { ...defaultLabels, ...labels };
  const actionLabel = isLight ? text.switchToDark : text.switchToLight;

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={actionLabel}
        className={`flex items-center gap-3 w-full px-3 py-2.5 gu-rounded-radius-md text-sm font-medium gu-text-text-secondary gu-h-text-text gu-h-bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color ${className}`}
      >
        {isLight ? (
          <Sun className="w-5 h-5 shrink-0" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5 shrink-0" aria-hidden="true" />
        )}
        <span>{isLight ? text.light : text.dark}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={actionLabel}
      className={`${sizeStyles[size]} gu-rounded-radius-md border gu-border-border gu-bg-surface gu-text-text-secondary gu-h-bg-surface-hover gu-h-text-text transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color ${className}`}
    >
      {isLight ? <Moon className={iconSize[size]} aria-hidden="true" /> : <Sun className={iconSize[size]} aria-hidden="true" />}
    </button>
  );
}
