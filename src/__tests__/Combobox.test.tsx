import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Combobox } from '../Combobox';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Combobox', () => {
  it('renders input with placeholder', () => {
    render(<Combobox options={options} placeholder="Select fruit" />);
    expect(screen.getByPlaceholderText('Select fruit')).toBeInTheDocument();
  });

  it('opens dropdown on focus', () => {
    render(<Combobox options={options} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('filters options on input', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ban' } });
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('calls onChange when option selected', () => {
    const onChange = vi.fn();
    render(<Combobox options={options} onChange={onChange} />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Cherry'));
    expect(onChange).toHaveBeenCalledWith('cherry');
  });

  it('shows empty message when no results', () => {
    render(<Combobox options={options} emptyMessage="Nothing found" />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('has combobox role with aria-expanded', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('navigates options with ArrowDown', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // After ArrowDown from index 0, highlight moves to index 1
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('selects option with Enter', () => {
    const onChange = vi.fn();
    render(<Combobox options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    // First option is highlighted by default
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('closes dropdown on Escape', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown on ArrowDown when closed', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    // Initially, just click without focus to keep closed state
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });
});
