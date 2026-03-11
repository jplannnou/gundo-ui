import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timeline } from '../Timeline';

const items = [
  { id: '1', title: 'Project created', time: '2 hours ago', status: 'success' as const },
  { id: '2', title: 'Build started', description: 'Running CI pipeline', time: '1 hour ago', status: 'info' as const },
  { id: '3', title: 'Deploy failed', description: 'Timeout on health check', time: '30 min ago', status: 'error' as const },
];

describe('Timeline', () => {
  it('renders all items', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('Project created')).toBeInTheDocument();
    expect(screen.getByText('Build started')).toBeInTheDocument();
    expect(screen.getByText('Deploy failed')).toBeInTheDocument();
  });

  it('renders descriptions', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('Running CI pipeline')).toBeInTheDocument();
  });

  it('renders time values', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('has list role', () => {
    render(<Timeline items={items} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders custom icons', () => {
    const customItems = [{ id: '1', title: 'Test', icon: <span data-testid="icon">★</span> }];
    render(<Timeline items={customItems} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with sm size', () => {
    const { container } = render(<Timeline items={items} size="sm" />);
    expect(container.querySelector('.w-2')).toBeInTheDocument();
  });
});
