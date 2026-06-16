import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Mock matchMedia for jsdom (needed by useReducedMotion and motion/react)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  // Test isolation: ThemeProvider (and other components) persist to
  // localStorage and mutate documentElement. Without resetting these between
  // tests, persisted state leaks across cases and across files — e.g. a theme
  // toggled to 'light' in one test made a later `defaultTheme="dark"` resolve
  // to light. Reset both so every test starts from a clean slate.
  try {
    localStorage.clear();
  } catch {
    /* jsdom without localStorage — nothing to clear */
  }
  document.documentElement.classList.remove('theme-light');
});
