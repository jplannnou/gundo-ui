'use client';
import { useState, useEffect } from 'react';

/**
 * Returns true when the given CSS media query matches.
 * Follows the same pattern as useReducedMotion for consistency.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hook — returns true on viewports ≤ 640px (mobile).
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}
