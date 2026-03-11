import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { chartColors, chartThemeConfig, ChartTooltip } from '../ChartTheme';

describe('ChartTheme', () => {
  it('exports 8 chart colors', () => {
    expect(chartColors).toHaveLength(8);
  });

  it('first color is brand green', () => {
    expect(chartColors[0]).toBe('#67C728');
  });

  it('exports theme config with grid, axis, tooltip, legend', () => {
    expect(chartThemeConfig.grid).toBeDefined();
    expect(chartThemeConfig.axis).toBeDefined();
    expect(chartThemeConfig.tooltip).toBeDefined();
    expect(chartThemeConfig.legend).toBeDefined();
  });

  it('config uses CSS custom properties', () => {
    expect(chartThemeConfig.grid.stroke).toBe('var(--ui-border)');
    expect(chartThemeConfig.tooltip.backgroundColor).toBe('var(--ui-surface)');
  });

  it('ChartTooltip renders children', () => {
    render(<ChartTooltip>Revenue: $1,000</ChartTooltip>);
    expect(screen.getByText('Revenue: $1,000')).toBeInTheDocument();
  });
});
