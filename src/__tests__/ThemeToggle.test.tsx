import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../utils/useTheme';
import { ThemeToggle } from '../ThemeToggle';

function ThemeDisplay() {
  const { resolvedTheme, theme } = useTheme();
  return <span data-testid="theme">{theme}:{resolvedTheme}</span>;
}

function renderWithProvider(ui: React.ReactNode, defaultTheme: 'dark' | 'light' | 'system' = 'dark') {
  return render(<ThemeProvider defaultTheme={defaultTheme}>{ui}</ThemeProvider>);
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('theme-light');
  });

  it('renders toggle button', () => {
    renderWithProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has aria-label for current mode', () => {
    renderWithProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('toggles theme on click', () => {
    renderWithProvider(<><ThemeToggle /><ThemeDisplay /></>);
    expect(screen.getByTestId('theme').textContent).toBe('dark:dark');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('theme').textContent).toBe('light:light');
  });

  it('applies theme-light class to documentElement', () => {
    renderWithProvider(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('toggles back to dark', () => {
    renderWithProvider(<><ThemeToggle /><ThemeDisplay /></>);
    fireEvent.click(screen.getByRole('button')); // dark → light
    fireEvent.click(screen.getByRole('button')); // light → dark
    expect(screen.getByTestId('theme').textContent).toBe('dark:dark');
  });
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('theme-light');
  });

  it('uses defaultTheme', () => {
    renderWithProvider(<ThemeDisplay />, 'light');
    expect(screen.getByTestId('theme').textContent).toBe('light:light');
  });

  it('throws when useTheme is used outside provider', () => {
    expect(() => render(<ThemeDisplay />)).toThrow('useTheme must be used within a ThemeProvider');
  });
});
