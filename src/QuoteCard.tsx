import './ui-classes.css';
import type { CSSProperties, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type QuoteCardTone = 'default' | 'primary';
export type QuoteCardSize = 'md' | 'lg';

export interface QuoteCardProps {
  /**
   * La frase, ya traducida. Va tal cual dentro del `<blockquote>`: si tu
   * idioma lleva comillas, inclúyelas en el texto (el componente no añade
   * ninguna para no fijar una tipografía de comillas por idioma).
   */
  quote: string;
  /** Autor o fuente, ya traducido. Si falta no se pinta `<figcaption>`. */
  author?: string;
  /** Antetítulo corto sobre la frase (p. ej. «Frase del día»), ya traducido. */
  eyebrow?: string;
  /**
   * `default`: superficie elevada con texto `--ui-text`.
   * `primary`: relleno `--ui-primary-fill` con la tinta `--ui-primary-ink`.
   */
  tone?: QuoteCardTone;
  /** `md` ≈ 1,75 rem; `lg` ≈ 2,5 rem. Ambos con `clamp` para 390 px. */
  size?: QuoteCardSize;
  /** Alineación del texto dentro de la tarjeta. */
  align?: 'start' | 'center';
  /**
   * Ranura para un trazo decorativo (SVG, ilustración). Se envuelve en
   * `aria-hidden`, va absoluta en la esquina superior del final de línea y no
   * recibe punteros, así que nunca tapa el texto ni lo hace inaccesible.
   */
  decoration?: ReactNode;
  /** Clases extra para el `<figure>`. */
  className?: string;
}

/* ─── Scales ─────────────────────────────────────────────────────────── */

const quoteFontSize: Record<QuoteCardSize, string> = {
  md: 'clamp(1.5rem, 1.25rem + 1.2vw, 1.75rem)',
  lg: 'clamp(1.875rem, 1.2rem + 3.4vw, 2.5rem)',
};

/* ─── QuoteCard ──────────────────────────────────────────────────────── */

/**
 * Tarjeta de frase: `<figure>` con la cita en tipografía de display
 * (`gu-display`) y, si hay autor, `<figcaption>`. Todo el color sale de
 * tokens `--ui-*`; la frase y las etiquetas llegan ya traducidas.
 *
 * Sobre el tono `primary`: el texto usa `--ui-primary-ink` (con `--ui-surface`
 * de respaldo) sobre `--ui-primary-fill`, el mismo par que un botón primario.
 */
export function QuoteCard({
  quote,
  author,
  eyebrow,
  tone = 'default',
  size = 'md',
  align = 'start',
  decoration,
  className = '',
}: QuoteCardProps) {
  const isPrimary = tone === 'primary';

  const figureStyle: CSSProperties = {
    margin: 0,
    borderRadius: 'var(--ui-radius-xl)',
    ...(isPrimary
      ? {
          backgroundColor: 'var(--ui-primary-fill)',
          color: 'var(--ui-primary-ink, var(--ui-surface))',
        }
      : {}),
  };

  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-start';
  const toneClass = isPrimary ? '' : 'gu-bg-surface-raised gu-text-text border gu-border-border';

  return (
    <figure
      data-tone={tone}
      className={`relative flex flex-col gap-4 overflow-hidden p-6 ${alignClass} ${toneClass} ${className}`}
      style={figureStyle}
    >
      {decoration && (
        <div
          aria-hidden="true"
          data-slot="decoration"
          className="pointer-events-none absolute end-0 top-0"
        >
          {decoration}
        </div>
      )}

      {eyebrow && (
        <p
          className="relative m-0 text-xs font-semibold uppercase tracking-widest"
          style={isPrimary ? undefined : { color: 'var(--ui-primary-text)' }}
        >
          {eyebrow}
        </p>
      )}

      <blockquote
        className="gu-display relative m-0"
        // La escala viaja en una variable local y `font-size` la lee: sigue
        // siendo un `clamp()` en el navegador y es inspeccionable en jsdom, que
        // descarta un `clamp()` escrito directamente en `font-size`.
        style={
          {
            '--gu-quote-size': quoteFontSize[size],
            fontSize: 'var(--gu-quote-size)',
            textWrap: 'balance',
          } as CSSProperties
        }
      >
        {quote}
      </blockquote>

      {author && (
        <figcaption
          className={`relative flex items-center gap-3 text-sm font-medium ${isPrimary ? '' : 'gu-text-text-secondary'}`}
        >
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-6 shrink-0"
            style={{ backgroundColor: isPrimary ? 'currentColor' : 'var(--ui-primary)' }}
          />
          <span>{author}</span>
        </figcaption>
      )}
    </figure>
  );
}
