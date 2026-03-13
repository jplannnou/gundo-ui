import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SparklineChart } from '../SparklineChart';

describe('SparklineChart', () => {
  it('renders an SVG', () => {
    render(<SparklineChart data={[1, 3, 2, 5, 4]} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has img role with aria-label', () => {
    render(<SparklineChart data={[1, 3, 2, 5, 4]} />);
    expect(screen.getByRole('img', { name: /Tendencia/ })).toBeInTheDocument();
  });

  it('shows last value in aria-label', () => {
    render(<SparklineChart data={[1, 3, 2, 5, 99]} />);
    expect(screen.getByRole('img', { name: 'Tendencia: 99' })).toBeInTheDocument();
  });

  it('renders nothing with fewer than 2 data points', () => {
    const { container } = render(<SparklineChart data={[42]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing with empty data', () => {
    const { container } = render(<SparklineChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('uses custom width and height', () => {
    render(<SparklineChart data={[1, 2, 3]} width={120} height={40} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '40');
  });
});
