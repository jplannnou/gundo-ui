import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagsInput } from '../TagsInput';

describe('TagsInput', () => {
  it('renders existing tags', () => {
    render(<TagsInput value={['react', 'vue']} onChange={() => {}} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('adds tag on Enter', () => {
    const onChange = vi.fn();
    render(<TagsInput value={['react']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'angular' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['react', 'angular']);
  });

  it('adds tag on comma', () => {
    const onChange = vi.fn();
    render(<TagsInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'svelte' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenCalledWith(['svelte']);
  });

  it('removes tag on backspace when input is empty', () => {
    const onChange = vi.fn();
    render(<TagsInput value={['react', 'vue']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('removes tag via remove button', () => {
    const onChange = vi.fn();
    render(<TagsInput value={['react', 'vue']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Remove react'));
    expect(onChange).toHaveBeenCalledWith(['vue']);
  });

  it('prevents duplicates', () => {
    const onChange = vi.fn();
    render(<TagsInput value={['react']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects maxTags', () => {
    render(<TagsInput value={['a', 'b']} onChange={() => {}} maxTags={2} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
