'use client';
import { useState, useEffect } from 'react';
import { useReducedMotion } from '../utils/useReducedMotion';

export interface TypeWriterProps {
  /** Text to type out, provided by the host (the library carries no copy) */
  text: string;
  /** Milliseconds per character (default 40) */
  speed?: number;
  /** Delay in milliseconds before typing starts */
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Types text character by character with a blinking caret.
 * Ported from Gundo Vida landing animations.
 *
 * With `prefers-reduced-motion` the full text renders immediately.
 * The full text is always exposed to assistive tech via `aria-label`
 * so screen readers never hear partial words.
 */
export function TypeWriter({
  text,
  speed = 40,
  delay = 0,
  onComplete,
  className = '',
}: TypeWriterProps) {
  const prefersReduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(prefersReduced ? text : '');
  const [started, setStarted] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) return;
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, prefersReduced]);

  useEffect(() => {
    if (!started || prefersReduced) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }
    const timeout = setTimeout(
      () => setDisplayed(text.slice(0, displayed.length + 1)),
      speed,
    );
    return () => clearTimeout(timeout);
  }, [displayed, started, text, speed, prefersReduced, onComplete]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{displayed}</span>
      {!prefersReduced && displayed.length < text.length && (
        <span className="animate-pulse" aria-hidden="true">|</span>
      )}
    </span>
  );
}
