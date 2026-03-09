import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows tooltip on focus', () => {
    render(<Tooltip text="Help info"><button>Focus me</button></Tooltip>);
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    // After focus, the tooltip should become visible (opacity change)
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('opacity-100');
  });

  it('hides tooltip on blur', () => {
    render(<Tooltip text="Help info"><button>Focus me</button></Tooltip>);
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    expect(screen.getByRole('tooltip').className).toContain('opacity-100');
    fireEvent.blur(wrapper);
    expect(screen.getByRole('tooltip').className).toContain('opacity-0');
  });

  it('has aria-describedby linking', () => {
    render(<Tooltip text="Description"><button>Target</button></Tooltip>);
    const wrapper = screen.getByText('Target').closest('span')!;
    fireEvent.focus(wrapper);
    const tooltipId = screen.getByRole('tooltip').id;
    expect(wrapper).toHaveAttribute('aria-describedby', tooltipId);
  });
});
