import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip text="Help"><button>Hover me</button></Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders tooltip text in DOM (shown via CSS hover)', () => {
    render(<Tooltip text="Help text"><button>Hover me</button></Tooltip>);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Help text')).toBeInTheDocument();
  });

  it('renders with different positions', () => {
    const { rerender } = render(<Tooltip text="Top" position="top"><span>A</span></Tooltip>);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    rerender(<Tooltip text="Bottom" position="bottom"><span>A</span></Tooltip>);
    expect(screen.getByText('Bottom')).toBeInTheDocument();
  });
});
