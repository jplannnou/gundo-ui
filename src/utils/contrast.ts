/**
 * WCAG 2.1 contrast ratio utilities for ensuring accessible color combinations.
 */

/** Parse a hex color string to RGB values */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Calculate relative luminance per WCAG 2.1 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * @returns Ratio between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(...hexToRgb(color1));
  const l2 = relativeLuminance(...hexToRgb(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure a foreground color has sufficient contrast against a background.
 * If contrast is below the minimum ratio, returns white or black (whichever has better contrast).
 *
 * @param fg - Foreground hex color
 * @param bg - Background hex color
 * @param minRatio - Minimum WCAG contrast ratio (default 4.5 for AA normal text)
 * @returns The original fg if contrast is sufficient, otherwise '#FFFFFF' or '#000000'
 */
export function ensureContrast(fg: string, bg: string, minRatio = 4.5): string {
  if (getContrastRatio(fg, bg) >= minRatio) return fg;

  const whiteRatio = getContrastRatio('#FFFFFF', bg);
  const blackRatio = getContrastRatio('#000000', bg);
  return whiteRatio >= blackRatio ? '#FFFFFF' : '#000000';
}
