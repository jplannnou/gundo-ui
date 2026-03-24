'use client';
import type { ReactNode, CSSProperties } from 'react';

/**
 * Brand color definition for multi-tenant theming.
 * Maps a brand's visual identity to @gundo/ui CSS custom properties.
 */
export interface BrandColors {
  /** Primary theme (buttons, active states, brand accent) */
  primary: {
    bg: string;
    text: string;
    hover: string;
    muted: string;
  };
  /** Secondary theme (headers, sidebar, deep accents) */
  secondary: {
    bg: string;
    text: string;
    hover: string;
    muted: string;
  };
  /** Tertiary theme (subtle accents, borders, tags) */
  tertiary: {
    bg: string;
    text: string;
    hover: string;
    muted: string;
  };
}

export interface BrandThemeProviderProps {
  brand: BrandColors;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps children with brand-specific CSS custom properties that override
 * the default @gundo/ui theme tokens. All @gundo/ui components inside
 * this provider automatically adapt to the brand colors.
 *
 * @example
 * ```tsx
 * <BrandThemeProvider brand={{
 *   primary: { bg: '#67C728', text: '#FDFDF8', hover: '#85d253', muted: '#9DC781' },
 *   secondary: { bg: '#08563E', text: '#FDFDF8', hover: '#A7D589', muted: '#9DC781' },
 *   tertiary: { bg: '#24495A', text: '#171717', hover: '#A7D589', muted: '#f2f4f3' },
 * }}>
 *   <RetailerDashboard />
 * </BrandThemeProvider>
 * ```
 */
export function BrandThemeProvider({ brand, children, className }: BrandThemeProviderProps) {
  const style: CSSProperties & Record<string, string> = {
    '--ui-primary': brand.primary.bg,
    '--ui-primary-hover': brand.primary.hover,
    '--ui-primary-soft': `${brand.primary.bg}26`, // ~15% opacity
    '--ui-secondary': brand.secondary.bg,
    '--ui-secondary-hover': brand.secondary.hover,
    '--ui-secondary-soft': `${brand.secondary.bg}26`,
    '--ui-tertiary': brand.tertiary.bg,
    '--ui-tertiary-hover': brand.tertiary.hover,
    '--ui-tertiary-soft': `${brand.tertiary.bg}26`,
    '--ui-text': brand.primary.text,
    '--ui-text-secondary': brand.tertiary.muted,
    '--ui-surface': brand.tertiary.bg,
  };

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
