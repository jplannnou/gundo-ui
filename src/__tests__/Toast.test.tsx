import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders children', () => {
    render(<Toast>Hello toast</Toast>);
    expect(screen.getByText('Hello toast')).toBeInTheDocument();
  });

  it('has role=alert', () => {
    render(<Toast>Test</Toast>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live=polite', () => {
    render(<Toast>Test</Toast>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders close button when onClose provided', () => {
    render(<Toast onClose={() => {}}>Test</Toast>);
    expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Toast onClose={onClose}>Test</Toast>);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast onClose={onClose} duration={2000}>Test</Toast>);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('pauses auto-dismiss on hover', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast onClose={onClose} duration={2000}>Test</Toast>);
    fireEvent.mouseEnter(screen.getByRole('alert'));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
