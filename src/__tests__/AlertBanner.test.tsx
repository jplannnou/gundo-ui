import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { AlertBanner } from '../AlertBanner';

afterEach(cleanup);

describe('AlertBanner', () => {
  it('renders children', () => {
    render(<AlertBanner>Something happened</AlertBanner>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    const { container } = render(<AlertBanner type="error">Error!</AlertBanner>);
    expect(container.firstChild).toHaveClass('border-[var(--ui-error)]');
  });

  it('defaults to info type', () => {
    const { container } = render(<AlertBanner>Info message</AlertBanner>);
    expect(container.firstChild).toHaveClass('border-[var(--ui-info)]');
  });
});
