import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { chartThemeConfig } from '../ChartTheme';
import { resolveColor, defaultMargin, gradientId } from './utils';
import { GundoTooltip } from './GundoTooltip';
import type { BaseChartProps, ChartSeries } from './types';

export interface ComposedSeries extends ChartSeries {
  type: 'line' | 'area' | 'bar';
  stackId?: string;
  radius?: [number, number, number, number];
}

export interface GundoComposedChartProps extends BaseChartProps {
  series: ComposedSeries[];
}

export function GundoComposedChart({
  data,
  series,
  height = 300,
  xKey,
  formatX,
  formatY,
  showGrid = true,
  showLegend = false,
  tooltip,
  className,
  margin,
}: GundoComposedChartProps) {
  const areaGradients = series
    .filter((s) => s.type === 'area')
    .map((s) => ({
      key: s.key,
      id: gradientId(s.key),
      color: resolveColor(s.color),
    }));

  const renderTooltip = () => {
    if (tooltip === false) return null;
    if (tooltip) return <Tooltip content={tooltip as never} />;
    return <Tooltip content={<GundoTooltip />} />;
  };

  const renderSeries = (s: ComposedSeries) => {
    const color = resolveColor(s.color);

    switch (s.type) {
      case 'line':
        return (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={color}
            strokeWidth={2}
            dot={false}
            strokeDasharray={s.dashed ? '6 3' : undefined}
          />
        );
      case 'area': {
        const gradient = areaGradients.find((g) => g.key === s.key);
        return (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#${gradient.id})` : color}
            strokeDasharray={s.dashed ? '6 3' : undefined}
          />
        );
      }
      case 'bar':
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={color}
            stackId={s.stackId}
            radius={s.radius}
          />
        );
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={margin ?? defaultMargin}>
          {areaGradients.length > 0 && (
            <defs>
              {areaGradients.map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
          )}
          {showGrid && (
            <CartesianGrid
              stroke={chartThemeConfig.grid.stroke}
              strokeDasharray={chartThemeConfig.grid.strokeDasharray}
            />
          )}
          <XAxis
            dataKey={xKey}
            tick={chartThemeConfig.axis.tick}
            axisLine={chartThemeConfig.axis.line}
            tickLine={false}
            tickFormatter={formatX}
          />
          <YAxis
            tick={chartThemeConfig.axis.tick}
            axisLine={chartThemeConfig.axis.line}
            tickLine={false}
            tickFormatter={formatY}
          />
          {renderTooltip()}
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: chartThemeConfig.legend.fontSize,
                fontFamily: chartThemeConfig.legend.fontFamily,
                color: chartThemeConfig.legend.color,
              }}
            />
          )}
          {series.map(renderSeries)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
