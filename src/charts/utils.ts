import { chartColors } from '../ChartTheme';
import type { SemanticColor } from './types';

const semanticMap: Record<string, number> = {
  primary: 0,
  info: 1,
  warning: 2,
  secondary: 3,
  error: 4,
  tertiary: 5,
  success: 6,
  violet: 7,
};

/** Resolve a semantic color name or index to a hex string */
export function resolveColor(color: SemanticColor): string {
  if (color in semanticMap) return chartColors[semanticMap[color]];
  const idx = Number(color);
  if (!isNaN(idx) && idx >= 0 && idx < chartColors.length) return chartColors[idx];
  return color; // assume hex/rgb string
}

/** Generate a unique gradient ID */
let gradientCounter = 0;
export function gradientId(prefix: string): string {
  return `gundo-${prefix}-${++gradientCounter}`;
}

/** Default margins for charts */
export const defaultMargin = { top: 8, right: 12, left: 0, bottom: 4 };
