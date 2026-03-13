import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InlineEdit } from '../InlineEdit';

describe('InlineEdit', () => {
  it('renders value in display mode', () => {
    render(<InlineEdit value="Texto inicial" onChange={() => {}} />);
    expect(screen.getByText('Texto inicial')).toBeInTheDocument();
  });

  it('shows placeholder when value is empty', () => {
    render(<InlineEdit value="" onChange={() => {}} placeholder="Haz clic aquí" />);
    expect(screen.getByText('Haz clic aquí')).toBeInTheDocument();
  });

  it('enters edit mode on click', () => {
    render(<InlineEdit value="Texto" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('enters edit mode on Enter key', () => {
    render(<InlineEdit value="Texto" onChange={() => {}} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange on Enter confirm', () => {
    const onChange = vi.fn();
    render(<InlineEdit value="Original" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Nuevo texto' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('Nuevo texto');
  });

  it('cancels on Escape', () => {
    const onChange = vi.fn();
    render(<InlineEdit value="Original" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Cambio' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('shows error from validate function', () => {
    render(
      <InlineEdit
        value="Test"
        onChange={() => {}}
        validate={(v) => (v.length < 5 ? 'Muy corto' : null)}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('alert')).toHaveTextContent('Muy corto');
  });

  it('does not call onChange when value unchanged', () => {
    const onChange = vi.fn();
    render(<InlineEdit value="Mismo" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<InlineEdit value="Texto" onChange={() => {}} disabled />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
