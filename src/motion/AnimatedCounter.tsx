"use client";
import { useEffect, useRef } from "react";
// (useRef sigue en uso para el ref del span)
import { useSpring, useTransform, motion, useInView } from "motion/react";
import { useReducedMotion } from "../utils/useReducedMotion";
import { spring as springPresets, durations } from "./tokens";

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
 * Re-anima cuando `to` cambia estando ya en viewport: es común alimentar este
 * contador con datos ASÍNCRONOS (queries que resuelven después del montaje). La
 * versión previa animaba una sola vez (`hasAnimatedRef`) e ignoraba cambios de
 * `to`, así que un valor que llegaba tarde se quedaba congelado en el parcial.
 *
 * With `prefers-reduced-motion` the final value renders immediately.
 */
export function AnimatedCounter({
  to,
  prefix = "",
  suffix = "",
  className = "",
  duration = durations.count,
  locale,
  formatValue,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();

  const format = (value: number) =>
    formatValue ? formatValue(value) : value.toLocaleString(locale);

  const spring = useSpring(0, {
    ...springPresets.count,
    duration: duration * 1000,
  });

  const display = useTransform(
    spring,
    (v) => `${prefix}${format(Math.round(v))}${suffix}`,
  );

  // Una vez en viewport, seguir al target: la primera vez anima 0→to; si `to`
  // cambia después (dato async que llega tarde) anima el valor actual→to. No
  // usamos un latch de "ya animé" — eso congelaba el contador en el parcial.
  useEffect(() => {
    if (isInView) spring.set(to);
  }, [isInView, to, spring]);

  if (prefersReduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {format(to)}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
