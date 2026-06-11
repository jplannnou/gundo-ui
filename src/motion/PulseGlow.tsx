'use client';
import { useState, useCallback, type ReactNode } from 'react';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useIsMobile } from '../utils/useMediaQuery';

export interface PulseGlowProps {
  children: ReactNode;
  /** Glow color (defaults to a soft brand-green; pass any CSS color or var()) */
  color?: string;
  className?: string;
}

/**
 * Cursor-following radial glow on hover. Ported from Gundo Vida landing
 * animations. Purely decorative: disabled on mobile and with
 * `prefers-reduced-motion` (children render unchanged).
 */
export function PulseGlow({
  children,
  color = 'var(--ui-primary-soft)',
  className = '',
}: PulseGlowProps) {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [pos, setPos] = useState({ x: '50%', y: '50%' });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || prefersReduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({
        x: `${e.clientX - rect.left}px`,
        y: `${e.clientY - rect.top}px`,
      });
    },
    [isMobile, prefersReduced],
  );

  const glowStyle = {
    background: `radial-gradient(circle 200px at ${pos.x} ${pos.y}, ${color}, transparent)`,
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMove}
    >
      {!prefersReduced && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={glowStyle}
          aria-hidden="true"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
