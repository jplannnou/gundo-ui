import './ui-classes.css';
import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ShareSummaryStat {
  /** Already localized. */
  label: string;
  /** Already formatted and localized. */
  value: string;
}

export interface ShareSummaryProps {
  /** Small line over the title (already localized), e.g. the programme name. */
  eyebrow?: string;
  /** What was achieved (already localized), e.g. "Semana completada". */
  title: string;
  /** Heading level of `title`. */
  headingLevel?: 2 | 3;
  /** The one big figure, already formatted, e.g. "4". */
  figure: string;
  /** What the figure counts (already localized), e.g. "entrenos esta semana". */
  figureLabel: string;
  /** Up to three supporting stats. */
  stats?: readonly ShareSummaryStat[];
  /** Brand mark slot (logo or wordmark). */
  brand?: ReactNode;
  /** Small closing line (already localized), e.g. a date range. */
  footnote?: string;
  /** Shape of the card: portrait for stories, square for feeds. */
  aspect?: '4/5' | '1/1' | '9/16';
  /** Share button label (already localized). Shown only with `onShare`. */
  shareLabel?: string;
  onShare?: () => void;
  className?: string;
}

/* ─── ShareSummary ───────────────────────────────────────────────────── */

/**
 * Resumen para compartir: una tarjeta con forma de imagen (una cifra grande,
 * hasta tres datos y la marca) y, debajo, el botón de compartir. La tarjeta no
 * genera la imagen ni abre el diálogo del sistema: eso lo hace quien la usa en
 * `onShare`. El botón queda fuera de la tarjeta para que no salga en la captura.
 */
export function ShareSummary({
  eyebrow,
  title,
  headingLevel = 2,
  figure,
  figureLabel,
  stats = [],
  brand,
  footnote,
  aspect = '4/5',
  shareLabel,
  onShare,
  className = '',
}: ShareSummaryProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const shown = stats.slice(0, 3);
  return (
    <div className={className}>
      <article
        data-share-card
        className="border gu-border-border"
        style={{
          aspectRatio: aspect,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
          padding: 24,
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: 'var(--ui-radius-2xl)',
          background: 'var(--ui-surface-raised)',
          color: 'var(--ui-text)',
        }}
      >
        <header>
          {eyebrow && (
            <p
              className="text-xs font-semibold uppercase"
              style={{ margin: 0, letterSpacing: '0.08em', color: 'var(--ui-primary-text)' }}
            >
              {eyebrow}
            </p>
          )}
          <Heading className="text-lg font-semibold" style={{ margin: eyebrow ? '4px 0 0' : 0 }}>
            {title}
          </Heading>
        </header>

        <p style={{ margin: 0 }}>
          <span
            className="gu-display"
            style={{ display: 'block', fontSize: 'clamp(4rem, 28vw, 7.5rem)', lineHeight: 0.9 }}
          >
            {figure}
          </span>
          <span className="block text-base gu-text-text-secondary" style={{ marginTop: 8 }}>
            {figureLabel}
          </span>
        </p>

        <footer>
          {shown.length > 0 && (
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))`,
                gap: 12,
                margin: 0,
                paddingTop: 16,
                borderTop: '1px solid var(--ui-border)',
              }}
            >
              {shown.map((stat) => (
                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                  <dt className="text-xs gu-text-text-secondary">{stat.label}</dt>
                  <dd className="text-lg font-semibold" style={{ margin: 0 }}>
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {(brand || footnote) && (
            <div
              className="flex items-center justify-between gap-3"
              style={{ marginTop: shown.length > 0 ? 16 : 0 }}
            >
              {brand ? <span data-share-brand>{brand}</span> : <span />}
              {footnote && <span className="text-xs gu-text-text-muted">{footnote}</span>}
            </div>
          )}
        </footer>
      </article>

      {shareLabel && onShare && (
        <button
          type="button"
          onClick={onShare}
          className="w-full text-base font-semibold focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
          style={{
            minHeight: 48,
            marginTop: 12,
            border: 0,
            cursor: 'pointer',
            borderRadius: 'var(--ui-radius-full)',
            background: 'var(--ui-primary-fill)',
            color: 'var(--ui-primary-ink)',
          }}
        >
          {shareLabel}
        </button>
      )}
    </div>
  );
}
