import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from '../Divider';

describe('Divider', () => {
  it('renders horizontal divider', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with label', () => {
    render(<Divider label="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
