import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RangeBar } from '../RangeBar';

describe('RangeBar', () => {
  it('exposes an accessible label on the track', () => {
    render(<RangeBar min={0} max={100} value={72} ariaLabel="Valor 72 de 100" />);
    expect(screen.getByRole('img', { name: 'Valor 72 de 100' })).toBeInTheDocument();
  });

  it('builds a numeric fallback label when none is given', () => {
    render(<RangeBar min={0} max={10} value={4} />);
    expect(screen.getByRole('img', { name: '4 (0–10)' })).toBeInTheDocument();
  });

  it('renders bound labels when showBounds is set', () => {
    render(<RangeBar min={0} max={200} value={90} showBounds />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders a labelled band caption', () => {
    render(
      <RangeBar min={0} max={100} value={50} bands={[{ from: 40, to: 80, tone: 'optimal', label: 'Óptimo' }]} />,
    );
    expect(screen.getByText(/Óptimo/)).toBeInTheDocument();
    expect(screen.getByText(/40–80/)).toBeInTheDocument();
  });

  it('trims raw float bounds to 2 decimals', () => {
    render(<RangeBar min={0.9924999999999998} max={5} value={2} showBounds />);
    expect(screen.getByText('0.99')).toBeInTheDocument();
  });
});
