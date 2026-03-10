import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateRangePicker } from '../DateRangePicker';

describe('DateRangePicker', () => {
  const empty = { from: null, to: null };

  it('renders trigger button', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows placeholder when no range', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} placeholder="Choose dates" />);
    expect(screen.getByText('Choose dates')).toBeInTheDocument();
  });

  it('opens panel on click', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows presets', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('selects preset', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={empty} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Last 7 days'));
    expect(onChange).toHaveBeenCalledOnce();
    const range = onChange.mock.calls[0][0];
    expect(range.from).toBeInstanceOf(Date);
    expect(range.to).toBeInstanceOf(Date);
  });

  it('displays two calendar grids', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const grids = screen.getAllByRole('grid');
    expect(grids).toHaveLength(2);
  });

  it('shows formatted range', () => {
    const range = { from: new Date(2026, 2, 1), to: new Date(2026, 2, 15) };
    render(<DateRangePicker value={range} onChange={() => {}} locale="en-US" />);
    expect(screen.getByText(/Mar 1 — Mar 15/)).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<DateRangePicker value={empty} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('dialog').parentElement!, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
