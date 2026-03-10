import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup } from '../RadioGroup';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('RadioGroup', () => {
  it('renders all options', () => {
    render(<RadioGroup options={options} value="a" onChange={() => {}} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('marks selected option with aria-checked', () => {
    render(<RadioGroup options={options} value="b" onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<RadioGroup options={options} value="a" onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('has radiogroup role', () => {
    render(<RadioGroup options={options} value="a" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('navigates with ArrowDown/ArrowUp in vertical mode', () => {
    const onChange = vi.fn();
    render(<RadioGroup options={options} value="a" onChange={onChange} />);
    fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('implements roving tabindex', () => {
    render(<RadioGroup options={options} value="b" onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('tabindex', '0');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[2]).toHaveAttribute('tabindex', '-1');
  });

  it('renders descriptions', () => {
    const opts = [{ value: 'x', label: 'Premium', description: 'Best value' }];
    render(<RadioGroup options={opts} value="x" onChange={() => {}} />);
    expect(screen.getByText('Best value')).toBeInTheDocument();
  });

  it('supports horizontal orientation', () => {
    render(<RadioGroup options={options} value="a" onChange={() => {}} orientation="horizontal" />);
    expect(screen.getByRole('radiogroup').className).toContain('flex-row');
  });

  it('disables all options when disabled', () => {
    render(<RadioGroup options={options} value="a" onChange={() => {}} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(r => expect(r).toBeDisabled());
  });
});
