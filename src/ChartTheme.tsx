import './ui-classes.css';
import type { ReactNode } from 'react';

/**
 * Chart color palette derived from GUNDO brand.
 * 8 colors for data series — works on dark and light themes.
 */
export const chartColors = [
  '#67C728', // primary green
  '#3b82f6', // info blue
  '#f59e0b', // warning amber
  '#08563E', // secondary deep green
  '#ef4444', // error red
  '#24495A', // tertiary teal
  '#22c55e', // success green
  '#8b5cf6', // violet
] as const;

/**
 * Plain config object for Recharts / any charting library.
 * No runtime dependency on Recharts — consumers spread as needed.
 */
export const chartThemeConfig = {
  colors: chartColors,
  grid: {
    stroke: 'var(--ui-border)',
    strokeDasharray: '3 3',
  },
  axis: {
    tick: {
      // text-secondary, NOT text-muted. Axis ticks are 12px (small text) so they
      // need >=4.5:1. text-muted (#6b7280) is only 2.82:1 on the dark surface
      // (theme.css flags it "large text only"); text-secondary (#9ca3af) is
      // 5.38:1 dark / 6.84:1 light — passes AA for small text in both themes.
      fill: 'var(--ui-text-secondary)',
      fontSize: 12,
      fontFamily: 'var(--ui-font-family)',
    },
    line: {
      stroke: 'var(--ui-border)',
    },
  },
  tooltip: {
    backgroundColor: 'var(--ui-surface)',
    borderColor: 'var(--ui-border)',
    borderRadius: 'var(--ui-radius-md)',
    color: 'var(--ui-text)',
    fontSize: '13px',
    fontFamily: 'var(--ui-font-family)',
    boxShadow: 'var(--ui-shadow-md)',
  },
  legend: {
    fontSize: 13,
    fontFamily: 'var(--ui-font-family)',
    color: 'var(--ui-text-secondary)',
  },
} as const;

/**
 * Pre-styled tooltip wrapper — consumers can use this directly
 * or use chartThemeConfig.tooltip for custom implementations.
 */
interface ChartTooltipProps {
  children: ReactNode;
  className?: string;
}

export function ChartTooltip({ children, className = '' }: ChartTooltipProps) {
  return (
    <div
      className={`gu-rounded-radius-md border gu-border-border gu-bg-surface px-3 py-2 text-sm gu-text-text gu-shadow-shadow-md gu-font-font-family ${className}`}
    >
      {children}
    </div>
  );
}
