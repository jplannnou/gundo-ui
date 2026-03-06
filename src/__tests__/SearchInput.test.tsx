import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SearchInput } from '../SearchInput';

afterEach(cleanup);

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows clear button when value is present and onClear is provided', () => {
    render(<SearchInput value="hello" onChange={() => {}} onClear={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} onClear={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    render(<SearchInput value="hello" onChange={() => {}} onClear={onClear} />);
    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
