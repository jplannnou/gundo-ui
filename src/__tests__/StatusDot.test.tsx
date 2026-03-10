import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusDot } from '../StatusDot';

describe('StatusDot', () => {
  it('renders with default status', () => {
    render(<StatusDot />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<StatusDot label="Online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('applies pulse animation', () => {
    const { container } = render(<StatusDot pulse status="success" />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('uses aria-label for accessibility', () => {
    render(<StatusDot status="error" label="Connection lost" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Connection lost');
  });

  it('renders different sizes', () => {
    const { container: c1 } = render(<StatusDot size="sm" />);
    const { container: c2 } = render(<StatusDot size="lg" />);
    expect(c1.querySelector('.w-2')).toBeInTheDocument();
    expect(c2.querySelector('.w-3')).toBeInTheDocument();
  });
});
