import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Container } from '../Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container><p>Page content</p></Container>);
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
