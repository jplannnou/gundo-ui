// Real-browser test (Chromium): the toast stack must render ABOVE a showModal()
// <dialog>. With z-index alone it cannot: the modal sits in the top layer.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Modal } from '../Modal';
import { ToastProvider, useToast } from '../ToastProvider';

function Harness() {
  const [open, setOpen] = useState(false);
  const { success } = useToast();
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>open-modal</button>
      <button type="button" onClick={() => success('Saved ok', 60_000)}>make-toast</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Dialog">
        <button type="button" onClick={() => success('Saved ok', 60_000)}>toast-inside</button>
      </Modal>
    </div>
  );
}

// Known platform limit: everything outside a showModal() <dialog> is inert, a
// toast layer included. A toast is therefore VISIBLE above an open modal but not
// clickable until the modal closes (it still auto-dismisses). These tests pin
// what we do guarantee: the layer is in the top layer, and it is re-entered
// above a modal that opens after it.
const layerOf = (alert: HTMLElement) => alert.closest('.gu-toast-layer') as HTMLElement;

describe('Toast stack (top layer)', () => {
  it('lives in the top layer while there are toasts', async () => {
    render(<ToastProvider><Harness /></ToastProvider>);
    fireEvent.click(screen.getByText('make-toast'));
    const alert = await screen.findByRole('alert');
    expect(layerOf(alert).matches(':popover-open')).toBe(true);
  });

  it('re-enters the top layer for a toast raised while a modal is open', async () => {
    render(<ToastProvider><Harness /></ToastProvider>);
    await userEvent.click(screen.getByText('open-modal'));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByText('toast-inside'));
    const alert = await screen.findByRole('alert');
    expect(layerOf(alert).matches(':popover-open')).toBe(true);
  });

  it('stays open when a modal opens after the toast (it is lifted above it)', async () => {
    render(<ToastProvider><Harness /></ToastProvider>);
    fireEvent.click(screen.getByText('make-toast'));
    const alert = await screen.findByRole('alert');
    await userEvent.click(screen.getByText('open-modal'));
    await screen.findByRole('dialog');
    expect(layerOf(alert).matches(':popover-open')).toBe(true);
  });

  it('is pinned to the bottom-right corner by default', async () => {
    render(<ToastProvider><Harness /></ToastProvider>);
    fireEvent.click(screen.getByText('make-toast'));
    const toast = await screen.findByRole('alert');
    await waitFor(() => {
      const r = toast.getBoundingClientRect();
      expect(Math.abs(r.right - (window.innerWidth - 16))).toBeLessThan(3);
      expect(Math.abs(r.bottom - (window.innerHeight - 16))).toBeLessThan(3);
    });
  });
});
