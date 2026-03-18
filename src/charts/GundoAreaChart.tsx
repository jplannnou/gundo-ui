import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export interface GundoAreaChartProps extends BaseChartProps {
  series: ChartSeries[];
}

export function GundoAreaChart({
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
}: GundoAreaChartProps) {
  const gradientIds = series.map((s) => ({
    key: s.key,
    id: gradientId(s.key),
    color: resolveColor(s.color),
  }));

  const renderTooltip = () => {
    if (tooltip === false) return null;
    if (tooltip) return <Tooltip content={tooltip as never} />;
    return <Tooltip content={<GundoTooltip />} />;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={margin ?? defaultMargin}>
          <defs>
            {gradientIds.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={g.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={gradientIds[i].color}
              strokeWidth={2}
              fill={`url(#${gradientIds[i].id})`}
              strokeDasharray={s.dashed ? '6 3' : undefined}
              hide={s.hideLegend}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
