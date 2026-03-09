import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stack } from '../Stack';

describe('Stack', () => {
  it('renders children', () => {
    render(<Stack><p>Item 1</p><p>Item 2</p></Stack>);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies gap class', () => {
    const { container } = render(<Stack gap="4"><p>A</p></Stack>);
    expect(container.firstChild).toHaveClass('gap-4');
  });
});
