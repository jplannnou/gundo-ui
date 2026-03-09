import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeTruthy();
  });

  it('accepts className', () => {
    const { container } = render(<Spinner className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
