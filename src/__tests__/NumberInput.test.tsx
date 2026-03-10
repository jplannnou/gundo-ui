import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NumberInput } from '../NumberInput';

describe('NumberInput', () => {
  it('renders with value', () => {
    render(<NumberInput value={5} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('5');
  });

  it('increments on + button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements on - button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('respects max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} max={10} />);
    expect(screen.getByLabelText('Increase')).toBeDisabled();
  });

  it('respects min', () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} min={0} />);
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
  });

  it('handles ArrowUp key', () => {
    const onChange = vi.fn();
    render(<NumberInput value={3} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('handles ArrowDown key', () => {
    const onChange = vi.fn();
    render(<NumberInput value={3} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('renders prefix and suffix', () => {
    render(<NumberInput value={100} onChange={() => {}} prefix="$" suffix="USD" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('uses custom step', () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} step={5} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
