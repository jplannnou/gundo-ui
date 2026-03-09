import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SegmentedControl } from '../SegmentedControl';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="day" onChange={() => {}} />);
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('marks active option with aria-checked', () => {
    render(<SegmentedControl options={options} value="week" onChange={() => {}} />);
    const allRadios = screen.getAllByRole('radio');
    const weekRadio = allRadios.find(r => r.textContent === 'Week');
    expect(weekRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="day" onChange={onChange} />);
    const allRadios = screen.getAllByRole('radio');
    const monthRadio = allRadios.find(r => r.textContent === 'Month')!;
    fireEvent.click(monthRadio);
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('has radiogroup role', () => {
    render(<SegmentedControl options={options} value="day" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('disables individual options', () => {
    const opts = [...options, { value: 'year', label: 'Year', disabled: true }];
    render(<SegmentedControl options={opts} value="day" onChange={() => {}} />);
    expect(screen.getByText('Year')).toBeDisabled();
  });

  it('navigates options with ArrowRight/ArrowLeft', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="day" onChange={onChange} />);
    const dayRadio = screen.getAllByRole('radio').find(r => r.textContent === 'Day')!;
    fireEvent.keyDown(dayRadio, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('week');
    onChange.mockClear();
    fireEvent.keyDown(dayRadio, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('navigates to first with Home', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="month" onChange={onChange} />);
    const monthRadio = screen.getAllByRole('radio').find(r => r.textContent === 'Month')!;
    fireEvent.keyDown(monthRadio, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('navigates to last with End', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="day" onChange={onChange} />);
    const dayRadio = screen.getAllByRole('radio').find(r => r.textContent === 'Day')!;
    fireEvent.keyDown(dayRadio, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('implements roving tabindex', () => {
    render(<SegmentedControl options={options} value="week" onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    const dayRadio = radios.find(r => r.textContent === 'Day')!;
    const weekRadio = radios.find(r => r.textContent === 'Week')!;
    const monthRadio = radios.find(r => r.textContent === 'Month')!;
    expect(weekRadio).toHaveAttribute('tabindex', '0');
    expect(dayRadio).toHaveAttribute('tabindex', '-1');
    expect(monthRadio).toHaveAttribute('tabindex', '-1');
  });
});
