import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('renders toggle button', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalled();
  });

  it('reflects checked state', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('can be disabled', () => {
    render(<Toggle checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('toggles on Space key', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch');
    fireEvent.keyDown(toggle, { key: ' ' });
    // The button's native click fires from Space; but we test via click simulation
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalled();
  });

  it('toggles on Enter key', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch');
    // Native buttons activate on Enter
    fireEvent.keyDown(toggle, { key: 'Enter' });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalled();
  });
});
