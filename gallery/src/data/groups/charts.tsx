import type { ComponentDef } from '../types';
import {
  GundoLineChart,
  GundoAreaChart,
  GundoBarChart,
  GundoPieChart,
  GundoComposedChart,
} from '../../../../src/charts/index';

/* ─── Shared sample data ──────────────────────────────────────────────── */

const SAMPLE_DATA = [
  { month: 'Jan', revenue: 4000, users: 2400, cost: 2400 },
  { month: 'Feb', revenue: 3000, users: 1398, cost: 2210 },
  { month: 'Mar', revenue: 5000, users: 3800, cost: 2900 },
  { month: 'Apr', revenue: 4500, users: 3200, cost: 2600 },
  { month: 'May', revenue: 6000, users: 4800, cost: 3100 },
  { month: 'Jun', revenue: 5500, users: 4200, cost: 2800 },
];

const PIE_DATA = [
  { name: 'Proteinas', value: 35, color: 'primary' as const },
  { name: 'Carbohidratos', value: 40, color: 'warning' as const },
  { name: 'Grasas', value: 25, color: 'info' as const },
];

/* ─── Demo wrappers ───────────────────────────────────────────────────── */

function LineChartDemo() {
  return (
    <GundoLineChart
      data={SAMPLE_DATA}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: 'primary' },
        { key: 'users', label: 'Users', color: 'info', dashed: true },
      ]}
      height={280}
      showLegend
    />
  );
}

function AreaChartDemo() {
  return (
    <GundoAreaChart
      data={SAMPLE_DATA}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: 'primary' },
        { key: 'cost', label: 'Cost', color: 'warning' },
      ]}
      height={280}
      showLegend
    />
  );
}

function BarChartDemo() {
  return (
    <GundoBarChart
      data={SAMPLE_DATA}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: 'primary', radius: [4, 4, 0, 0] },
        { key: 'cost', label: 'Cost', color: 'error', radius: [4, 4, 0, 0] },
      ]}
      height={280}
      showLegend
    />
  );
}

function PieChartDemo() {
  return (
    <GundoPieChart
      data={PIE_DATA}
      height={280}
      innerRadius={50}
      outerRadius={90}
      showLegend
      showLabels
    />
  );
}

function ComposedChartDemo() {
  return (
    <GundoComposedChart
      data={SAMPLE_DATA}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: 'primary', type: 'bar', radius: [4, 4, 0, 0] },
        { key: 'users', label: 'Users', color: 'info', type: 'line' },
        { key: 'cost', label: 'Cost', color: 'warning', type: 'area' },
      ]}
      height={280}
      showLegend
    />
  );
}

/* ─── Shared chart base props ─────────────────────────────────────────── */

const BASE_CHART_PROPS = [
  { name: 'data', type: 'Record<string, unknown>[]', required: true, description: 'Chart data array' },
  { name: 'xKey', type: 'string', required: true, description: 'X-axis data key' },
  { name: 'height', type: 'number', required: false, default: '300', description: 'Chart height in px' },
  { name: 'showLegend', type: 'boolean', required: false, default: 'false', description: 'Show chart legend' },
  { name: 'showGrid', type: 'boolean', required: false, default: 'true', description: 'Show cartesian grid' },
  { name: 'formatX', type: '(value: string | number) => string', required: false, description: 'Format X-axis tick labels' },
  { name: 'formatY', type: '(value: number) => string', required: false, description: 'Format Y-axis tick labels' },
  { name: 'tooltip', type: 'ReactNode | false', required: false, description: 'Custom tooltip renderer (false to disable)' },
  { name: 'margin', type: '{ top?: number; right?: number; bottom?: number; left?: number }', required: false, description: 'Chart margins override' },
];

/* ─── Group ───────────────────────────────────────────────────────────── */

export const chartsGroup: ComponentDef[] = [
  {
    name: 'GundoLineChart',
    description: 'Line chart with multiple series, dashed lines for projections, and themed tooltip.',
    file: 'charts/GundoLineChart.tsx',
    demo: LineChartDemo,
    props: [
      ...BASE_CHART_PROPS,
      { name: 'series', type: 'ChartSeries[]', required: true, description: 'Line series definitions (key, label, color, dashed)' },
    ],
  },
  {
    name: 'GundoAreaChart',
    description: 'Area chart with gradient fills, multiple series, and themed tooltip.',
    file: 'charts/GundoAreaChart.tsx',
    demo: AreaChartDemo,
    props: [
      ...BASE_CHART_PROPS,
      { name: 'series', type: 'ChartSeries[]', required: true, description: 'Area series definitions (key, label, color, dashed)' },
    ],
  },
  {
    name: 'GundoBarChart',
    description: 'Bar chart with stacking, radius, horizontal/vertical layout, and themed tooltip.',
    file: 'charts/GundoBarChart.tsx',
    demo: BarChartDemo,
    props: [
      ...BASE_CHART_PROPS,
      { name: 'series', type: 'BarChartSeries[]', required: true, description: 'Bar series definitions (key, label, color, stackId, radius)' },
      { name: 'layout', type: "'horizontal' | 'vertical'", required: false, default: "'horizontal'", description: 'Bar layout direction' },
    ],
  },
  {
    name: 'GundoPieChart',
    description: 'Pie/donut chart with semantic colors, labels, and themed tooltip.',
    file: 'charts/GundoPieChart.tsx',
    demo: PieChartDemo,
    props: [
      { name: 'data', type: 'Array<{ name: string; value: number; color?: SemanticColor }>', required: true, description: 'Pie data (name/value pairs with optional color)' },
      { name: 'height', type: 'number', required: false, default: '300', description: 'Chart height in px' },
      { name: 'innerRadius', type: 'number', required: false, default: '0', description: 'Inner radius (> 0 for donut)' },
      { name: 'outerRadius', type: 'number', required: false, default: '80', description: 'Outer radius' },
      { name: 'showLegend', type: 'boolean', required: false, default: 'false', description: 'Show chart legend' },
      { name: 'showLabels', type: 'boolean', required: false, default: 'false', description: 'Show slice labels' },
      { name: 'tooltip', type: 'ReactNode | false', required: false, description: 'Custom tooltip renderer (false to disable)' },
    ],
  },
  {
    name: 'GundoComposedChart',
    description: 'Composed chart mixing line, area, and bar series in a single chart.',
    file: 'charts/GundoComposedChart.tsx',
    demo: ComposedChartDemo,
    props: [
      ...BASE_CHART_PROPS,
      { name: 'series', type: 'ComposedSeries[]', required: true, description: 'Mixed series definitions (type: line/area/bar, plus ChartSeries props)' },
    ],
  },
];
