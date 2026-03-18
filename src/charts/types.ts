import type { ReactNode } from 'react';

/** Semantic color names mapping to chartColors indices or CSS variables */
export type SemanticColor =
  | 'primary' | 'info' | 'warning' | 'secondary' | 'error' | 'tertiary' | 'success' | 'violet'
  | (string & {});

/** Series definition for line/area/bar charts */
export interface ChartSeries {
  /** Data key in the data objects */
  key: string;
  /** Display label */
  label: string;
  /** Color — semantic name, chartColors index, or hex string */
  color: SemanticColor;
  /** Dashed line (for projected/forecast data) */
  dashed?: boolean;
  /** Hide from legend */
  hideLegend?: boolean;
}

/** Shared props for all chart wrappers */
export interface BaseChartProps {
  /** Chart data array */
  data: Record<string, unknown>[];
  /** Chart height in px (default 300) */
  height?: number;
  /** Show legend (default false) */
  showLegend?: boolean;
  /** Show grid (default true) */
  showGrid?: boolean;
  /** X-axis data key */
  xKey: string;
  /** Format X-axis tick labels */
  formatX?: (value: string | number) => string;
  /** Format Y-axis tick labels */
  formatY?: (value: number) => string;
  /** Custom tooltip renderer */
  tooltip?: ReactNode | false;
  /** Additional className on the container */
  className?: string;
  /** Chart margins override */
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

/** Props for bar-specific charts */
export interface BarChartSeries extends ChartSeries {
  /** Stack ID for stacked bars */
  stackId?: string;
  /** Bar radius [topLeft, topRight, bottomLeft, bottomRight] */
  radius?: [number, number, number, number];
}
