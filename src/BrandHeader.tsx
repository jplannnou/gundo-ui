'use client';
import type { ReactNode, HTMLAttributes } from 'react';

/**
 * `<BrandHeader>` — co-brand header pattern for white-label / partner surfaces.
 *
 * Standardizes the "Partner × GUNDO" header used by Datacenter (B2B genie) and
 * Ametller (retail co-brand), and generalizes for future partners (Consum,
 * Eroski, HEB, etc).
 *
 * Renders a partner logo/wordmark on the left and the GUNDO mark on the right
 * with an optional "Powered by" label between them. Theme tokens flow from the
 * surrounding `<BrandThemeProvider>` (if any) — so the GUNDO mark adapts to the
 * partner's color overrides without needing extra props.
 */

export type BrandHeaderVariant = 'inline' | 'stacked' | 'minimal';
export type BrandHeaderSize = 'sm' | 'md' | 'lg';

export interface BrandPartner {
  /** Partner display name — used as text fallback and for screen readers */
  name: string;
  /** URL to the partner logo image (PNG/SVG). If absent, renders the name as a wordmark */
  logoUrl?: string;
  /** Optional alt text for the logo (defaults to `${name} logo`) */
  logoAlt?: string;
  /** Optional URL — makes the whole partner side clickable */
  href?: string;
}

export interface BrandHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Partner brand on the left side of the header */
  partner: BrandPartner;
  /**
   * "Powered by" label shown between the partner and the GUNDO mark.
   * Pass an empty string to suppress, or a translated string for i18n consumers.
   * @default 'Powered by'
   */
  poweredByLabel?: string;
  /** Render the GUNDO mark on the right. @default true */
  showGundoMark?: boolean;
  /** Visual layout. @default 'inline' */
  variant?: BrandHeaderVariant;
  /** Size scale. @default 'md' */
  size?: BrandHeaderSize;
  /** Optional tagline rendered below in `stacked` variant */
  tagline?: ReactNode;
  /** Optional URL for the GUNDO mark (e.g. https://gundo.life) */
  gundoHref?: string;
}

const SIZE_CONFIG: Record<BrandHeaderSize, { logoH: number; gundoH: number; gap: string; padY: string }> = {
  sm: { logoH: 24, gundoH: 18, gap: 'gap-3', padY: 'py-2' },
  md: { logoH: 32, gundoH: 22, gap: 'gap-4', padY: 'py-3' },
  lg: { logoH: 44, gundoH: 28, gap: 'gap-5', padY: 'py-4' },
};

function GundoMark({ height }: { height: number }) {
  // Inline SVG wordmark — no external assets so the component works in any consumer
  // (Datacenter, Ametller, future partners) without bundling images.
  // Uses --ui-primary so partner ThemeProvider overrides flow through automatically.
  const width = Math.round(height * 3.4);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 170 50"
      role="img"
      aria-label="GUNDO"
      style={{ display: 'block' }}
    >
      <text
        x="0"
        y="38"
        fontFamily="var(--ui-font-display, 'Quicksand', system-ui, sans-serif)"
        fontWeight="700"
        fontSize="40"
        letterSpacing="-1"
        fill="var(--ui-primary)"
      >
        gundo
      </text>
    </svg>
  );
}

function PartnerMark({ partner, height }: { partner: BrandPartner; height: number }) {
  if (partner.logoUrl) {
    return (
      <img
        src={partner.logoUrl}
        alt={partner.logoAlt ?? `${partner.name} logo`}
        height={height}
        style={{ height, width: 'auto', display: 'block' }}
      />
    );
  }
  return (
    <span
      className="font-semibold tracking-tight"
      style={{
        fontFamily: 'var(--ui-font-display, system-ui, sans-serif)',
        fontSize: height * 0.6,
        color: 'var(--ui-text)',
        lineHeight: 1,
      }}
    >
      {partner.name}
    </span>
  );
}

export function BrandHeader({
  partner,
  poweredByLabel = 'Powered by',
  showGundoMark = true,
  variant = 'inline',
  size = 'md',
  tagline,
  gundoHref,
  className = '',
  ...props
}: BrandHeaderProps) {
  const cfg = SIZE_CONFIG[size];

  // Partner mark — the inner img/span carries the accessible name (alt or text);
  // the wrapping anchor inherits it via the accessible-name calculation, so we
  // do NOT duplicate aria-label on <a> (would create two elements with the same
  // accessible name in the a11y tree).
  const partnerNode = <PartnerMark partner={partner} height={cfg.logoH} />;
  const wrappedPartner = partner.href ? (
    <a
      href={partner.href}
      className="ui-focus-ring inline-flex items-center rounded"
    >
      {partnerNode}
    </a>
  ) : (
    partnerNode
  );

  const gundoMark = showGundoMark ? (
    gundoHref ? (
      <a
        href={gundoHref}
        className="ui-focus-ring inline-flex items-center rounded"
      >
        <GundoMark height={cfg.gundoH} />
      </a>
    ) : (
      <GundoMark height={cfg.gundoH} />
    )
  ) : null;

  const showPoweredBy = showGundoMark && variant !== 'minimal' && poweredByLabel.length > 0;

  if (variant === 'stacked') {
    return (
      <header
        className={`flex flex-col items-start ${cfg.padY} ${className}`}
        {...props}
      >
        <div className={`flex items-center ${cfg.gap}`}>
          {wrappedPartner}
          {showPoweredBy && (
            <>
              <span
                className="text-xs"
                style={{ color: 'var(--ui-text-muted)' }}
              >
                {poweredByLabel}
              </span>
              {gundoMark}
            </>
          )}
          {!showPoweredBy && gundoMark}
        </div>
        {tagline && (
          <div
            className="mt-1 text-sm"
            style={{ color: 'var(--ui-text-secondary)' }}
          >
            {tagline}
          </div>
        )}
      </header>
    );
  }

  // inline + minimal share the same row layout; minimal omits the "Powered by" label
  return (
    <header
      className={`flex items-center justify-between ${cfg.padY} ${className}`}
      {...props}
    >
      <div className={`flex items-center ${cfg.gap}`}>{wrappedPartner}</div>
      <div className={`flex items-center ${cfg.gap}`}>
        {showPoweredBy && (
          <span
            className="text-xs"
            style={{ color: 'var(--ui-text-muted)' }}
          >
            {poweredByLabel}
          </span>
        )}
        {gundoMark}
      </div>
    </header>
  );
}
