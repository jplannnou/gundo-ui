import './ui-classes.css';
import type { CSSProperties, ReactNode } from 'react';
import { Minus, TrendingDown, TrendingUp } from './icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type StatHeroSize = 'md' | 'lg' | 'xl';
export type StatHeroTrendDirection = 'up' | 'down' | 'flat';

export interface StatHeroTrend {
  /** Sentido de la variación. Elige el icono; el texto lo cuenta `label`. */
  direction: StatHeroTrendDirection;
  /** Texto de la variación, ya traducido (p. ej. «+3 % frente a la semana pasada»). */
  label: string;
}

export interface StatHeroProps {
  /** La cifra protagonista (o su texto ya formateado, p. ej. «1.980» o «2,1»). */
  value: ReactNode;
  /** Unidad pequeña junto a la cifra (p. ej. «kcal»), ya traducida. */
  unit?: string;
  /** Qué mide la cifra, ya traducido. Va bajo ella en `--ui-text-secondary`. */
  label: string;
  /** Frase de contexto bajo la etiqueta, ya traducida. Va en `--ui-text`. */
  caption?: string;
  /** Antetítulo corto sobre la cifra, ya traducido. */
  eyebrow?: string;
  /**
   * Tendencia: icono decorativo + texto. El sentido nunca depende solo del
   * color (el componente no colorea la tendencia): lo dicen el icono y `label`.
   */
  trend?: StatHeroTrend;
  /** `md` ≈ 3 rem, `lg` ≈ 4 rem, `xl` ≈ 5,5 rem; todos con `clamp` para 390 px. */
  size?: StatHeroSize;
  /** `text`: cifra en `--ui-text`. `primary`: cifra en `--ui-primary-text`. */
  tone?: 'text' | 'primary';
  /** Alineación del bloque. */
  align?: 'start' | 'center';
  /**
   * Ranura junto a la cifra (p. ej. un anillo de progreso). En móvil va a su
   * derecha si cabe y baja debajo si no. Si es puramente decorativa, pásala con
   * `aria-hidden`; si informa (un `role="progressbar"`), dale su propio nombre.
   */
  visual?: ReactNode;
  /** Clases extra para el contenedor. */
  className?: string;
}

/* ─── Scales & maps ──────────────────────────────────────────────────── */

const valueFontSize: Record<StatHeroSize, string> = {
  md: 'clamp(2.25rem, 1.6rem + 2.8vw, 3rem)',
  lg: 'clamp(3rem, 2rem + 4.5vw, 4rem)',
  xl: 'clamp(3.5rem, 2.2rem + 7vw, 5.5rem)',
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

/* ─── StatHero ───────────────────────────────────────────────────────── */

/**
 * Cifra protagonista: un número enorme en tipografía de display
 * (`gu-display`, `tabular-nums`, `leading-none`) con su etiqueta y, si hace
 * falta, una frase, una tendencia y una ranura visual al lado.
 *
 * Todo el texto llega ya traducido y todo el color sale de tokens `--ui-*`.
 * Para una cifra más densa y sin display, ver `StatNumber`.
 */
export function StatHero({
  value,
  unit,
  label,
  caption,
  eyebrow,
  trend,
  size = 'lg',
  tone = 'text',
  align = 'start',
  visual,
  className = '',
}: StatHeroProps) {
  const centered = align === 'center';
  const TrendIcon = trend ? trendIcon[trend.direction] : null;

  // La escala viaja en una variable local y `font-size` la lee: el valor sigue
  // siendo un `clamp()` en el navegador, y es inspeccionable en jsdom, que
  // descarta un `clamp()` escrito directamente en `font-size`.
  const valueStyle = {
    '--gu-hero-size': valueFontSize[size],
    fontSize: 'var(--gu-hero-size)',
    // `gu-display` fija 1,05; una cifra sola necesita 1 y el orden de las hojas
    // de estilo no debe decidirlo, así que va en línea además de `leading-none`.
    lineHeight: 1,
    color: tone === 'primary' ? 'var(--ui-primary-text)' : 'var(--ui-text)',
  } as CSSProperties;

  return (
    <div
      data-size={size}
      data-tone={tone}
      className={`flex flex-col gap-2 ${centered ? 'items-center text-center' : 'items-start text-start'} ${className}`}
    >
      {eyebrow && (
        <p
          className="m-0 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ui-primary-text)' }}
        >
          {eyebrow}
        </p>
      )}

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${centered ? 'justify-center' : 'justify-start'}`}
      >
        <div
          data-slot="value"
          className="gu-display m-0 inline-flex min-w-0 items-baseline gap-2 leading-none tabular-nums"
          style={valueStyle}
        >
          <span data-slot="number">{value}</span>
          {unit && (
            <>
              {' '}
              <span data-slot="unit" style={{ fontSize: '0.4em' }}>
                {unit}
              </span>
            </>
          )}
        </div>
        {visual && (
          <div data-slot="visual" className="flex shrink-0 items-center">
            {visual}
          </div>
        )}
      </div>

      <p className="m-0 text-sm font-medium gu-text-text-secondary">{label}</p>

      {trend && TrendIcon && (
        <p
          data-slot="trend"
          data-direction={trend.direction}
          className="m-0 inline-flex items-center gap-1.5 text-sm font-medium gu-text-text"
        >
          <TrendIcon size={16} aria-hidden="true" className="shrink-0" />
          <span>{trend.label}</span>
        </p>
      )}

      {caption && <p className="m-0 text-base gu-text-text">{caption}</p>}
    </div>
  );
}
