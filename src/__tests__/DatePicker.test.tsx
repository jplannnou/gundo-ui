import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from '../DatePicker';

describe('DatePicker', () => {
  it('renders trigger button', () => {
    render(<DatePicker onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(<DatePicker onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('opens calendar on click', () => {
    render(<DatePicker onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays formatted date when value set', () => {
    render(<DatePicker value={new Date(2026, 2, 10)} onChange={() => {}} locale="en-US" />);
    expect(screen.getByText('Mar 10, 2026')).toBeInTheDocument();
  });

  it('calls onChange when day is selected', () => {
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 2, 10)} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }));
    expect(onChange).toHaveBeenCalledOnce();
    const selected: Date = onChange.mock.calls[0][0];
    expect(selected.getDate()).toBe(15);
  });

  it('closes on Escape', () => {
    render(<DatePicker onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates months', () => {
    render(<DatePicker value={new Date(2026, 0, 15)} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('January 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('is disabled when disabled prop set', () => {
    render(<DatePicker onChange={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
