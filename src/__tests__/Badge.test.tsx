import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    render(<Badge variant="error">Failed</Badge>);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders with dot', () => {
    const { container } = render(<Badge dot>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(container.querySelector('span span')).toBeTruthy();
  });
});
