import type { ReactNode, SVGProps } from 'react';

export type EmptyStateIllustrationType =
  | 'no-data'
  | 'no-results'
  | 'welcome'
  | 'error'
  | 'offline'
  | 'upload';

interface EmptyStateIllustrationProps extends SVGProps<SVGSVGElement> {
  /** Which empty state illustration to render */
  type: EmptyStateIllustrationType;
  /** Width and height of the SVG (default 120) */
  size?: number;
}

function NoDataIllustration() {
  return (
    <g>
      {/* Chart background */}
      <rect x="24" y="28" width="72" height="56" rx="4"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="1.5"
      />
      {/* Grid lines */}
      <line x1="36" y1="44" x2="84" y2="44" stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="36" y1="56" x2="84" y2="56" stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="36" y1="68" x2="84" y2="68" stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="0.75" strokeDasharray="2 2" />
      {/* Empty bars */}
      <rect x="38" y="52" width="8" height="24" rx="2" fill="var(--ui-primary, #10b981)" opacity="0.15" />
      <rect x="50" y="44" width="8" height="32" rx="2" fill="var(--ui-primary, #10b981)" opacity="0.15" />
      <rect x="62" y="60" width="8" height="16" rx="2" fill="var(--ui-primary, #10b981)" opacity="0.15" />
      <rect x="74" y="48" width="8" height="28" rx="2" fill="var(--ui-primary, #10b981)" opacity="0.15" />
      {/* Dashed flat line indicating no data */}
      <line x1="34" y1="58" x2="88" y2="58" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      {/* Small "empty" icon */}
      <circle cx="60" cy="18" r="7" fill="none" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" />
      <line x1="57" y1="18" x2="63" y2="18" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bottom axis */}
      <line x1="24" y1="84" x2="96" y2="84" stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="1" />
      <circle cx="42" cy="88" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.4" />
      <circle cx="54" cy="88" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.4" />
      <circle cx="66" cy="88" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.4" />
      <circle cx="78" cy="88" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.4" />
    </g>
  );
}

function NoResultsIllustration() {
  return (
    <g>
      {/* Magnifying glass */}
      <circle cx="52" cy="48" r="20" fill="none"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="2.5"
      />
      <circle cx="52" cy="48" r="14" fill="var(--ui-surface-raised, rgba(255,255,255,0.02))" />
      <line x1="66" y1="62" x2="80" y2="76"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="3" strokeLinecap="round"
      />
      {/* Inner "?" */}
      <text x="52" y="54" textAnchor="middle" fontSize="16" fontWeight="600"
        fill="var(--ui-primary, #10b981)" opacity="0.5"
        fontFamily="var(--ui-font-family, Inter, system-ui, sans-serif)"
      >?</text>
      {/* Small floating dots suggesting emptiness */}
      <circle cx="28" cy="36" r="2" fill="var(--ui-primary, #10b981)" opacity="0.2" />
      <circle cx="82" cy="32" r="1.5" fill="var(--ui-primary, #10b981)" opacity="0.15" />
      <circle cx="36" cy="78" r="1.5" fill="var(--ui-primary, #10b981)" opacity="0.2" />
      {/* X marks for "not found" */}
      <g stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
        <line x1="84" y1="40" x2="90" y2="46" />
        <line x1="90" y1="40" x2="84" y2="46" />
      </g>
      <g stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeLinecap="round" opacity="0.25">
        <line x1="22" y1="58" x2="28" y2="64" />
        <line x1="28" y1="58" x2="22" y2="64" />
      </g>
    </g>
  );
}

function WelcomeIllustration() {
  return (
    <g>
      {/* Rocket body */}
      <path d="M60 22 C60 22 72 36 72 56 C72 64 66 70 60 72 C54 70 48 64 48 56 C48 36 60 22 60 22Z"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-primary, #10b981)" strokeWidth="2"
      />
      {/* Rocket window */}
      <circle cx="60" cy="46" r="6" fill="var(--ui-primary, #10b981)" opacity="0.2"
        stroke="var(--ui-primary, #10b981)" strokeWidth="1.5"
      />
      <circle cx="60" cy="46" r="3" fill="var(--ui-primary, #10b981)" opacity="0.4" />
      {/* Fins */}
      <path d="M48 58 L38 68 L48 66Z" fill="var(--ui-primary, #10b981)" opacity="0.3" />
      <path d="M72 58 L82 68 L72 66Z" fill="var(--ui-primary, #10b981)" opacity="0.3" />
      {/* Exhaust flames */}
      <path d="M54 72 Q57 84 60 78 Q63 84 66 72" fill="none"
        stroke="var(--ui-warning, #f59e0b)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
      />
      <path d="M56 72 Q58 80 60 76 Q62 80 64 72" fill="none"
        stroke="var(--ui-error, #ef4444)" strokeWidth="1" strokeLinecap="round" opacity="0.4"
      />
      {/* Sparkles */}
      <g fill="var(--ui-primary, #10b981)" opacity="0.5">
        <path d="M30 30 L32 34 L34 30 L32 26Z" />
        <path d="M86 44 L87.5 47 L89 44 L87.5 41Z" />
        <path d="M24 54 L25 56 L26 54 L25 52Z" />
      </g>
      {/* Small stars */}
      <circle cx="88" cy="28" r="1" fill="var(--ui-text-muted, #6b7280)" opacity="0.5" />
      <circle cx="34" cy="42" r="1" fill="var(--ui-text-muted, #6b7280)" opacity="0.4" />
      <circle cx="92" cy="56" r="0.8" fill="var(--ui-text-muted, #6b7280)" opacity="0.3" />
      <circle cx="26" cy="68" r="0.8" fill="var(--ui-text-muted, #6b7280)" opacity="0.3" />
    </g>
  );
}

function ErrorIllustration() {
  return (
    <g>
      {/* Warning triangle */}
      <path d="M60 24 L88 76 L32 76Z"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-error, #ef4444)" strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Inner glow */}
      <path d="M60 34 L80 72 L40 72Z" fill="var(--ui-error, #ef4444)" opacity="0.06" />
      {/* Exclamation mark */}
      <line x1="60" y1="44" x2="60" y2="60"
        stroke="var(--ui-error, #ef4444)" strokeWidth="3" strokeLinecap="round"
      />
      <circle cx="60" cy="67" r="2" fill="var(--ui-error, #ef4444)" />
      {/* Small impact lines */}
      <g stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" strokeLinecap="round" opacity="0.35">
        <line x1="24" y1="36" x2="18" y2="30" />
        <line x1="22" y1="42" x2="16" y2="42" />
        <line x1="96" y1="36" x2="102" y2="30" />
        <line x1="98" y1="42" x2="104" y2="42" />
      </g>
      {/* Scattered dots */}
      <circle cx="26" cy="80" r="1.5" fill="var(--ui-error, #ef4444)" opacity="0.2" />
      <circle cx="94" cy="80" r="1.5" fill="var(--ui-error, #ef4444)" opacity="0.2" />
      <circle cx="44" cy="86" r="1" fill="var(--ui-text-muted, #6b7280)" opacity="0.3" />
      <circle cx="76" cy="86" r="1" fill="var(--ui-text-muted, #6b7280)" opacity="0.3" />
    </g>
  );
}

function OfflineIllustration() {
  return (
    <g>
      {/* Left cable end */}
      <path d="M20 50 C32 50 36 50 42 50"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="3" strokeLinecap="round" fill="none"
      />
      <rect x="42" y="44" width="10" height="12" rx="2"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5"
      />
      <line x1="46" y1="47" x2="46" y2="53" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" />
      <line x1="49" y1="47" x2="49" y2="53" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" />
      {/* Right cable end */}
      <path d="M78 50 C88 50 92 50 100 50"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="3" strokeLinecap="round" fill="none"
      />
      <rect x="68" y="44" width="10" height="12" rx="2"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5"
      />
      <line x1="71" y1="47" x2="71" y2="53" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" />
      <line x1="74" y1="47" x2="74" y2="53" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" />
      {/* Gap / disconnect spark */}
      <path d="M52 50 L56 44 L58 52 L62 46 L66 50"
        fill="none" stroke="var(--ui-warning, #f59e0b)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
      />
      {/* "No signal" waves */}
      <path d="M48 28 C52 24 68 24 72 28" fill="none"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"
      />
      <path d="M44 22 C50 16 70 16 76 22" fill="none"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"
      />
      {/* Slash through signal */}
      <line x1="54" y1="18" x2="66" y2="32"
        stroke="var(--ui-error, #ef4444)" strokeWidth="2" strokeLinecap="round" opacity="0.5"
      />
      {/* Bottom dots */}
      <circle cx="40" cy="72" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.25" />
      <circle cx="60" cy="68" r="1" fill="var(--ui-primary, #10b981)" opacity="0.2" />
      <circle cx="80" cy="72" r="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.25" />
      {/* Status text line */}
      <rect x="40" y="78" width="40" height="3" rx="1.5" fill="var(--ui-text-muted, #6b7280)" opacity="0.15" />
    </g>
  );
}

function UploadIllustration() {
  return (
    <g>
      {/* Cloud shape */}
      <path d="M34 56 C26 56 20 50 20 44 C20 38 26 32 34 32 C36 26 42 22 50 22 C60 22 68 28 70 36 C76 36 82 40 82 48 C82 54 78 58 72 58"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="2" strokeLinecap="round"
      />
      {/* Bottom of cloud (hidden by arrow area) */}
      <path d="M34 56 L72 58" fill="none"
        stroke="var(--ui-text-muted, #6b7280)" strokeWidth="2" strokeDasharray="3 4" opacity="0.4"
      />
      {/* Upload arrow */}
      <line x1="53" y1="78" x2="53" y2="52"
        stroke="var(--ui-primary, #10b981)" strokeWidth="2.5" strokeLinecap="round"
      />
      <polyline points="43,60 53,48 63,60"
        fill="none" stroke="var(--ui-primary, #10b981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Document icon at base */}
      <rect x="44" y="78" width="18" height="14" rx="2"
        fill="var(--ui-surface-raised, rgba(255,255,255,0.02))"
        stroke="var(--ui-border, rgba(255,255,255,0.1))" strokeWidth="1.5"
      />
      <line x1="48" y1="83" x2="58" y2="83" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" opacity="0.5" />
      <line x1="48" y1="87" x2="55" y2="87" stroke="var(--ui-text-muted, #6b7280)" strokeWidth="1" opacity="0.5" />
      {/* Sparkle accents */}
      <path d="M82 26 L83.5 30 L85 26 L83.5 22Z" fill="var(--ui-primary, #10b981)" opacity="0.4" />
      <path d="M26 24 L27 27 L28 24 L27 21Z" fill="var(--ui-primary, #10b981)" opacity="0.3" />
      {/* Plus sign */}
      <g stroke="var(--ui-primary, #10b981)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
        <line x1="88" y1="60" x2="88" y2="68" />
        <line x1="84" y1="64" x2="92" y2="64" />
      </g>
    </g>
  );
}

const illustrations: Record<EmptyStateIllustrationType, () => ReactNode> = {
  'no-data': NoDataIllustration,
  'no-results': NoResultsIllustration,
  'welcome': WelcomeIllustration,
  'error': ErrorIllustration,
  'offline': OfflineIllustration,
  'upload': UploadIllustration,
};

/**
 * Inline SVG empty state illustrations.
 * Uses CSS custom properties from the @gundo/ui theme for colors.
 * Looks good at 120x120 and 200x200.
 *
 * @example
 * <EmptyStateIllustration type="no-data" />
 * <EmptyStateIllustration type="welcome" size={200} />
 */
export function EmptyStateIllustration({ type, size = 120, ...svgProps }: EmptyStateIllustrationProps) {
  const Illustration = illustrations[type];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      role="img"
      aria-label={`${type} illustration`}
      {...svgProps}
    >
      <Illustration />
    </svg>
  );
}
