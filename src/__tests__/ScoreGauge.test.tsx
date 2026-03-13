import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreGauge, ScoreGaugeMini } from '../ScoreGauge';

describe('ScoreGauge', () => {
  it('renders score value', () => {
    render(<ScoreGauge score={75} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('clamps score above 100 to 100', () => {
    render(<ScoreGauge score={150} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('clamps score below 0 to 0', () => {
    render(<ScoreGauge score={-10} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<ScoreGauge score={60} label="Salud" />);
    expect(screen.getByText('Salud')).toBeInTheDocument();
  });

  it('renders sublabel when provided', () => {
    render(<ScoreGauge score={60} sublabel="Basado en análisis" />);
    expect(screen.getByText('Basado en análisis')).toBeInTheDocument();
  });

  it('has meter role with correct aria values', () => {
    render(<ScoreGauge score={80} label="Score" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '80');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('hides value when showValue=false', () => {
    render(<ScoreGauge score={50} showValue={false} />);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('renders icon instead of value when icon is provided', () => {
    render(<ScoreGauge score={50} icon={<span data-testid="icon">★</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('ScoreGaugeMini', () => {
  it('renders score', () => {
    render(<ScoreGaugeMini score={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('has meter role', () => {
    render(<ScoreGaugeMini score={42} />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });
});
