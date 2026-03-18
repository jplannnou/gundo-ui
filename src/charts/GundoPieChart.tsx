import type { ReactNode } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { chartColors, chartThemeConfig } from '../ChartTheme';
import { resolveColor } from './utils';
import { GundoTooltip } from './GundoTooltip';
import type { SemanticColor } from './types';

export interface GundoPieChartProps {
  data: Array<{ name: string; value: number; color?: SemanticColor }>;
  height?: number;
  /** Set > 0 for donut chart */
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  tooltip?: ReactNode | false;
  className?: string;
}

export function GundoPieChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = false,
  showLabels = false,
  tooltip,
  className,
}: GundoPieChartProps) {
  const renderTooltip = () => {
    if (tooltip === false) return null;
    if (tooltip) return <Tooltip content={tooltip as never} />;
    return <Tooltip content={<GundoTooltip />} />;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
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
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={showLabels}
            labelLine={showLabels}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.color ? resolveColor(entry.color) : chartColors[i % chartColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
