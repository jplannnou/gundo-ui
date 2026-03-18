import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { chartThemeConfig } from '../ChartTheme';
import { resolveColor, defaultMargin } from './utils';
import { GundoTooltip } from './GundoTooltip';
import type { BaseChartProps, BarChartSeries } from './types';

export interface GundoBarChartProps extends BaseChartProps {
  series: BarChartSeries[];
  layout?: 'horizontal' | 'vertical';
}

export function GundoBarChart({
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
  layout = 'horizontal',
}: GundoBarChartProps) {
  const isVertical = layout === 'vertical';

  const renderTooltip = () => {
    if (tooltip === false) return null;
    if (tooltip) return <Tooltip content={tooltip as never} />;
    return <Tooltip content={<GundoTooltip />} />;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout} margin={margin ?? defaultMargin}>
          {showGrid && (
            <CartesianGrid
              stroke={chartThemeConfig.grid.stroke}
              strokeDasharray={chartThemeConfig.grid.strokeDasharray}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={chartThemeConfig.axis.tick}
                axisLine={chartThemeConfig.axis.line}
                tickLine={false}
                tickFormatter={formatY}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                tick={chartThemeConfig.axis.tick}
                axisLine={chartThemeConfig.axis.line}
                tickLine={false}
                tickFormatter={formatX}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={resolveColor(s.color)}
              radius={s.radius}
              stackId={s.stackId}
              hide={s.hideLegend}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
