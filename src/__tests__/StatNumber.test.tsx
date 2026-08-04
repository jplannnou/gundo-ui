import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatNumber } from '../StatNumber';

describe('StatNumber', () => {
  it('renders value, unit and label', () => {
    render(<StatNumber value="1.980" unit="kcal" label="por día" />);
    expect(screen.getByText('1.980')).toBeInTheDocument();
    expect(screen.getByText('kcal')).toBeInTheDocument();
    expect(screen.getByText('por día')).toBeInTheDocument();
  });

  it('renders without unit or label', () => {
    render(<StatNumber value={28} />);
    expect(screen.getByText('28')).toBeInTheDocument();
  });

  it('renders a decorative icon', () => {
    render(<StatNumber value={140} icon={<span data-testid="ic">🍽️</span>} />);
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });
});
