// Real-browser test (Chromium): the contract consumers rely on that is NOT part
// of the platform. Native <dialog> has an implicit role, so `[role="dialog"]`
// CSS selectors and `querySelectorAll('[role="dialog"]')` (e.g. a Capacitor
// back-button handler) match nothing unless the role is written out. And the
// panels must keep clear of the notch / home indicator on mobile.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { Modal } from '../Modal';
import { Drawer } from '../Drawer';
import { Sheet } from '../Sheet';

function Harness({ kind, placement }: { kind: 'modal' | 'drawer' | 'sheet'; placement?: 'center' | 'bottom-sheet' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      {kind === 'modal' && (
        <Modal open={open} onClose={() => setOpen(false)} title="T" placement={placement}>
          <p>body</p>
        </Modal>
      )}
      {kind === 'drawer' && (
        <Drawer open={open} onClose={() => setOpen(false)} title="T">
          <p>body</p>
        </Drawer>
      )}
      {kind === 'sheet' && (
        <Sheet open={open} onClose={() => setOpen(false)} title="T">
          <p>body</p>
        </Sheet>
      )}
    </div>
  );
}

async function openDialog(kind: 'modal' | 'drawer' | 'sheet', placement?: 'center' | 'bottom-sheet') {
  render(<Harness kind={kind} placement={placement} />);
  fireEvent.click(screen.getByText('opener'));
  const dialog = await screen.findByRole('dialog');
  // Past the entry transition so computed values are the resting ones.
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'));
  return dialog;
}

const root = document.documentElement;
afterEach(() => {
  root.style.removeProperty('--ui-safe-area-top');
  root.style.removeProperty('--ui-safe-area-bottom');
});

describe('native dialogs keep the contract the consumers depend on', () => {
  it.each(['modal', 'drawer', 'sheet'] as const)('%s carries an explicit role="dialog" and aria-modal', async (kind) => {
    const dialog = await openDialog(kind);
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    // The selector a back-button handler / CSS override would use.
    expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBe(dialog);
  });

  it.each(['drawer', 'sheet'] as const)('%s pads its content by the safe-area insets', async (kind) => {
    const dialog = await openDialog(kind);
    const before = getComputedStyle(dialog);
    const [top0, bottom0] = [parseFloat(before.paddingTop), parseFloat(before.paddingBottom)];
    root.style.setProperty('--ui-safe-area-top', '47px');
    root.style.setProperty('--ui-safe-area-bottom', '34px');
    await waitFor(() => expect(parseFloat(getComputedStyle(dialog).paddingTop)).toBe(47));
    expect(parseFloat(getComputedStyle(dialog).paddingBottom)).toBe(34);
    // Full height is unchanged: the inset eats into the content box, not the viewport.
    expect(Math.round(dialog.getBoundingClientRect().height)).toBe(window.innerHeight);
    expect([top0, bottom0]).toEqual([0, 0]);
  });

  it('a centred modal never grows taller than the viewport minus the insets', async () => {
    const dialog = await openDialog('modal');
    root.style.setProperty('--ui-safe-area-top', '59px');
    root.style.setProperty('--ui-safe-area-bottom', '34px');
    const expected = window.innerHeight * 0.9 - 59 - 34;
    await waitFor(() => expect(parseFloat(getComputedStyle(dialog).maxHeight)).toBeCloseTo(expected, 0));
  });

  it('a bottom-sheet modal adds the bottom inset to its own padding on mobile', async () => {
    const dialog = await openDialog('modal', 'bottom-sheet');
    const base = parseFloat(getComputedStyle(dialog).paddingBottom);
    root.style.setProperty('--ui-safe-area-bottom', '34px');
    await waitFor(() => expect(parseFloat(getComputedStyle(dialog).paddingBottom)).toBe(base + 34));
  });
});
