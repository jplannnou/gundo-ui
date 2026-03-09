import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EmptyState title="No data" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders action', () => {
    render(<EmptyState title="No data" action={<button>Add item</button>} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<EmptyState title="No data" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
