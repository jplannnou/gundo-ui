import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'gundo-ui-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.remove('theme-light');
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = STORAGE_KEY }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolved = resolveTheme(theme);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for system theme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyTheme(resolveTheme('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(storageKey, t); } catch { /* SSR/test */ }
  }, [storageKey]);

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
