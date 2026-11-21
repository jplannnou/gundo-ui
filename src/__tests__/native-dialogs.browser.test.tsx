// Real-browser tests (Chromium) for the <dialog>-based Modal and Drawer. jsdom has
// no showModal(), top layer, inert background or ::backdrop. Run: pnpm test:browser
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Modal } from '../Modal';
import { Drawer } from '../Drawer';

function ModalHarness({ placement }: { placement?: 'center' | 'bottom-sheet' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      <button type="button">behind</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Title" placement={placement}>
        <button type="button">inside-a</button>
        <button type="button">inside-b</button>
      </Modal>
    </div>
  );
}

function DrawerHarness({ side }: { side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Panel" side={side}>
        <button type="button">inside</button>
      </Drawer>
    </div>
  );
}

// Los overlays entran con una transición: la geometría se mide con ella terminada.
const settled = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

const openModal = async () => {
  render(<ModalHarness />);
  // A real click: it focuses the opener, which is what focus must return to.
  await userEvent.click(screen.getByText('opener'));
  return screen.findByRole('dialog');
};

describe('Modal (native <dialog>)', () => {
  it('opens as a real modal in the top layer', async () => {
    const dialog = await openModal();
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog.matches(':modal')).toBe(true);
  });

  it('is centred in the viewport', async () => {
    const dialog = await openModal();
    await settled(dialog);
    const r = dialog.getBoundingClientRect();
    expect(Math.abs(r.left + r.width / 2 - window.innerWidth / 2)).toBeLessThan(2);
    expect(Math.abs(r.top + r.height / 2 - window.innerHeight / 2)).toBeLessThan(2);
  });

  it('closes on a real Escape key press', async () => {
    await openModal();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('never lets Tab reach the page behind (it is inert)', async () => {
    const dialog = await openModal();
    const behind = screen.getByText('behind');
    let reachedInside = 0;
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      expect(document.activeElement).not.toBe(behind);
      expect(document.activeElement).not.toBe(screen.getByText('opener'));
      // Focus is either inside the dialog or has left the document for the
      // browser UI (activeElement = body) — the native wrap-around.
      if (dialog.contains(document.activeElement)) reachedInside++;
      else expect(document.activeElement).toBe(document.body);
    }
    expect(reachedInside).toBeGreaterThan(0);
  });

  it('returns focus to the opener on close', async () => {
    const dialog = await openModal();
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(screen.getByText('opener'));
  });

  it('closes when the backdrop is clicked, not when the panel is', async () => {
    const dialog = await openModal();
    const r = dialog.getBoundingClientRect();
    // The point just outside the panel resolves to the <dialog> (its ::backdrop).
    expect(document.elementFromPoint(2, 2)).toBe(dialog);
    fireEvent.click(dialog, { clientX: r.left + 10, clientY: r.top + 10 });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(dialog, { clientX: 2, clientY: 2 });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('locks page scroll while open and restores it', async () => {
    await openModal();
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.style.overflow).toBe(''), { timeout: 1500 });
  });

  it('paints text with the design-system colour, not the UA CanvasText', async () => {
    const dialog = await openModal();
    document.documentElement.style.setProperty('--ui-text', 'rgb(1, 2, 3)');
    expect(getComputedStyle(dialog).color).toBe('rgb(1, 2, 3)');
    document.documentElement.style.removeProperty('--ui-text');
  });
});

describe('Drawer (native <dialog>)', () => {
  it('is a real modal pinned to the right edge, full height', async () => {
    render(<DrawerHarness />);
    fireEvent.click(screen.getByText('opener'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.matches(':modal')).toBe(true);
    // Let the slide-in settle.
    await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().right)).toBe(window.innerWidth));
    const r = dialog.getBoundingClientRect();
    expect(Math.round(r.height)).toBe(window.innerHeight);
  });

  it('pins to the left edge with side="left"', async () => {
    render(<DrawerHarness side="left" />);
    fireEvent.click(screen.getByText('opener'));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().left)).toBe(0));
  });

  it('closes on a real Escape key press', async () => {
    render(<DrawerHarness />);
    fireEvent.click(screen.getByText('opener'));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });
});
