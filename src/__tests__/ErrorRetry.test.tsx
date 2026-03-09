import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorRetry } from '../ErrorRetry';

describe('ErrorRetry', () => {
  it('renders default error message', () => {
    render(<ErrorRetry />);
    expect(screen.getByText(/error|something went wrong/i)).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ErrorRetry message="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders detail text', () => {
    render(<ErrorRetry message="Error" detail="Check connection" />);
    expect(screen.getByText('Check connection')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorRetry onRetry={onRetry} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalled();
  });
});
