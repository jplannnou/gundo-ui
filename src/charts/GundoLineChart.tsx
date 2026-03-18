import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { chartThemeConfig } from '../ChartTheme';
import { resolveColor, defaultMargin } from './utils';
import { GundoTooltip } from './GundoTooltip';
import type { BaseChartProps, ChartSeries } from './types';

export interface GundoLineChartProps extends BaseChartProps {
  series: ChartSeries[];
}

export function GundoLineChart({
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
}: GundoLineChartProps) {
  const renderTooltip = () => {
    if (tooltip === false) return null;
    if (tooltip) return <Tooltip content={tooltip as never} />;
    return <Tooltip content={<GundoTooltip />} />;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={margin ?? defaultMargin}>
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
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={resolveColor(s.color)}
              strokeWidth={2}
              dot={false}
              strokeDasharray={s.dashed ? '6 3' : undefined}
              hide={s.hideLegend}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
