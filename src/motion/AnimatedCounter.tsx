'use client';
import { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion, useInView } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

export interface AnimatedCounterProps {
  /** Target value to count up to */
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Approximate duration in seconds (default 1.5) */
  duration?: number;
  /**
   * BCP-47 locale for number formatting (e.g. 'es-ES'). Defaults to the
   * browser locale — the library never assumes a language.
   */
  locale?: string;
  /** Full control over formatting; overrides `locale` */
  formatValue?: (value: number) => string;
}

/**
 * Number that counts up with a spring once it enters the viewport.
 * Ported from Gundo Vida landing animations.
 *
 * With `prefers-reduced-motion` the final value renders immediately.
 */
export function AnimatedCounter({
  to,
  prefix = '',
  suffix = '',
  className = '',
  duration = 1.5,
  locale,
  formatValue,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReduced = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  const format = (value: number) =>
    formatValue ? formatValue(value) : value.toLocaleString(locale);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (v) => `${prefix}${format(Math.round(v))}${suffix}`);

  useEffect(() => {
    if (isInView && !hasAnimatedRef.current) {
      spring.set(to);
      hasAnimatedRef.current = true;
    }
  }, [isInView, to, spring]);

  if (prefersReduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}{format(to)}{suffix}
      </span>
    );
  }

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
