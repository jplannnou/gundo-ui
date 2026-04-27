import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MatchScoreRing } from '../MatchScoreRing';

describe('MatchScoreRing', () => {
  it('renders with meter role', () => {
    render(<MatchScoreRing score={72} label="Match" disableAnimation />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '72');
  });

  it('renders label when provided', () => {
    render(<MatchScoreRing score={50} label="Compatibilidad" disableAnimation />);
    expect(screen.getByText('Compatibilidad')).toBeInTheDocument();
  });

  it('clamps score to 0-100', () => {
    render(<MatchScoreRing score={150} disableAnimation />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('supports all sizes', () => {
    const { rerender } = render(<MatchScoreRing score={50} size="sm" disableAnimation />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
    rerender(<MatchScoreRing score={50} size="md" disableAnimation />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
    rerender(<MatchScoreRing score={50} size="lg" disableAnimation />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });
});
