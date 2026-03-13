import type { HTMLAttributes } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SparklineChartProps extends HTMLAttributes<SVGSVGElement> {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Fill area under the line */
  fill?: boolean;
  /** Show a dot on the last data point */
  showLastDot?: boolean;
  /** Stroke width (default: 1.5) */
  strokeWidth?: number;
}

/* ─── SparklineChart ──────────────────────────────────────────────────── */

export function SparklineChart({
  data,
  width = 80,
  height = 30,
  color = 'var(--ui-primary)',
  fill = true,
  showLastDot = true,
  strokeWidth = 1.5,
  className = '',
  ...props
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const padding = showLastDot ? 3 : 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const x = (i: number) => padding + (i / (data.length - 1)) * w;
  const y = (v: number) => padding + h - ((v - min) / range) * h;

  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  const linePath = `M ${data.map((v, i) => `${x(i)} ${y(v)}`).join(' L ')}`;
  const fillPath = `${linePath} L ${x(data.length - 1)} ${height} L ${x(0)} ${height} Z`;

  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Tendencia: ${data[data.length - 1]}`}
      className={className}
      {...props}
    >
      {fill && (
        <path
          d={fillPath}
          fill={color}
          fillOpacity={0.12}
          strokeWidth={0}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showLastDot && (
        <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
      )}
    </svg>
  );
}
