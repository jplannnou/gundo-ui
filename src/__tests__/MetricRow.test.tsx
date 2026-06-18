import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricRow } from '../MetricRow';

describe('MetricRow', () => {
  it('renders name, value and status label', () => {
    render(<MetricRow name="Hemoglobina" value="13.5 g/dL" status="ok" statusLabel="Óptimo" />);
    expect(screen.getByText('Hemoglobina')).toBeInTheDocument();
    expect(screen.getByText('13.5 g/dL')).toBeInTheDocument();
    expect(screen.getByText('Óptimo')).toBeInTheDocument();
  });

  it('renders sub line when provided', () => {
    render(
      <MetricRow name="Glucosa" sub="En ayunas" value="92 mg/dL" status="warn" statusLabel="Atención" />,
    );
    expect(screen.getByText('En ayunas')).toBeInTheDocument();
  });

  it('renders an accessible range bar with optimal caption', () => {
    render(
      <MetricRow
        name="Ferritina"
        value="45 ng/mL"
        status="ok"
        statusLabel="Óptimo"
        range={{ low: 30, high: 100, current: 45, min: 0, max: 200, optimalLabel: 'Óptimo' }}
      />,
    );
    // role="img" with an aria-label describing value + optimal band
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('45 ng/mL'));
  });

  it('omits range bar when no range given', () => {
    render(<MetricRow name="X" value="1" status="bad" statusLabel="Fuera de rango" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
