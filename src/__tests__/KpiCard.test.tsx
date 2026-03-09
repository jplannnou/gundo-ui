import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCard } from '../KpiCard';

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Revenue" value="$12,345" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<KpiCard title="Revenue" value="$12,345" subtitle="vs last month" />);
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders positive trend', () => {
    render(<KpiCard title="Revenue" value="$12,345" trend={{ value: 12.5 }} />);
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(<KpiCard title="Revenue" value="$12,345" trend={{ value: -5, label: 'MoM' }} />);
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<KpiCard title="Revenue" value="100" icon={<span data-testid="icon">$</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
