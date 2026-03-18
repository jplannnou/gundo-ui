import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip text="Help"><button>Hover me</button></Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders tooltip text on hover (shown via AnimatePresence)', async () => {
    render(<Tooltip text="Help text"><button>Hover me</button></Tooltip>);
    // Tooltip is not in DOM until visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    const wrapper = screen.getByText('Hover me').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  it('renders with different positions', async () => {
    const { rerender } = render(<Tooltip text="Top" position="top"><span>A</span></Tooltip>);
    const wrapper = screen.getByText('A').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    rerender(<Tooltip text="Bottom" position="bottom"><span>A</span></Tooltip>);
    fireEvent.mouseEnter(wrapper);
    await waitFor(() => expect(screen.getByText('Bottom')).toBeInTheDocument());
  });

  it('shows tooltip on focus', async () => {
    render(<Tooltip text="Help info"><button>Focus me</button></Tooltip>);
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
  });

  it('hides tooltip on blur', async () => {
    render(<Tooltip text="Help info"><button>Focus me</button></Tooltip>);
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.blur(wrapper);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('has aria-describedby linking', async () => {
    render(<Tooltip text="Description"><button>Target</button></Tooltip>);
    const wrapper = screen.getByText('Target').closest('span')!;
    fireEvent.focus(wrapper);
    await waitFor(() => {
      const tooltipId = screen.getByRole('tooltip').id;
      expect(wrapper).toHaveAttribute('aria-describedby', tooltipId);
    });
  });
});
