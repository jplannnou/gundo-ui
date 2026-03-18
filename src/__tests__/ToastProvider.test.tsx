import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../ToastProvider';

function TestConsumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Success!')}>Show Success</button>
      <button onClick={() => toast.error('Error!')}>Show Error</button>
      <button onClick={() => toast.dismissAll()}>Dismiss All</button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(<ToastProvider><p>App</p></ToastProvider>);
    expect(screen.getByText('App')).toBeInTheDocument();
  });

  it('shows toast on success()', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>);
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('shows toast on error()', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>);
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('dismisses all toasts', async () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>);
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dismiss All'));
    await waitFor(() => expect(screen.queryByText('Success!')).not.toBeInTheDocument());
  });

  it('auto-dismisses after duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ToastProvider><TestConsumer /></ToastProvider>);
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    // Advance past the toast duration (4000ms) + exit animation time
    act(() => { vi.advanceTimersByTime(5000); });
    await waitFor(() => expect(screen.queryByText('Success!')).not.toBeInTheDocument());
    vi.useRealTimers();
  });

  it('throws when useToast used outside provider', () => {
    function BadConsumer() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow('useToast must be used within <ToastProvider>');
    spy.mockRestore();
  });
});
