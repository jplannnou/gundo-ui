// Real-browser tests (vitest browser mode, Chromium): jsdom implements none of
// the Popover API, <dialog>.showModal() or CSS anchor positioning, so the
// native behaviour of these overlays can only be proven here.
// Run with: pnpm test:browser
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover } from '../Popover';

// Los overlays entran con una transición: la geometría se mide con ella terminada.
const settled = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

describe('Popover (native)', () => {
  it('opens in the top layer', async () => {
    render(<Popover trigger={<span>Open</span>}>Panel</Popover>);
    fireEvent.click(screen.getByText('Open'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.matches(':popover-open')).toBe(true);
  });

  it('places the panel below the trigger and aligned to its start edge', async () => {
    render(
      <div style={{ padding: 120 }}>
        <Popover trigger={<span style={{ display: 'inline-block', width: 80, height: 30 }}>Open</span>}>
          <div style={{ width: 200, height: 60 }}>Panel</div>
        </Popover>
      </div>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    const t = trigger.getBoundingClientRect();
    const d = dialog.getBoundingClientRect();
    expect(d.top).toBeGreaterThanOrEqual(t.bottom);
    expect(d.top - t.bottom).toBeLessThan(24);
    expect(Math.abs(d.left - t.left)).toBeLessThan(2);
  });

  it('is not clipped by an ancestor with overflow hidden', async () => {
    render(
      <div style={{ padding: 80 }}>
        <div style={{ overflow: 'hidden', width: 60, height: 24 }}>
          <Popover trigger={<span>Open</span>}>
            <div style={{ width: 240, height: 80 }}>Wide panel</div>
          </Popover>
        </div>
      </div>,
    );
    fireEvent.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');
    const r = dialog.getBoundingClientRect();
    expect(r.width).toBeGreaterThan(200);
    // The element at the panel's centre is the panel itself, not the clipped ancestor.
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    expect(dialog.contains(hit)).toBe(true);
  });

  it('closes on Escape and unmounts once the exit transition ends', async () => {
    render(<Popover trigger={<span>Open</span>}>Panel</Popover>);
    fireEvent.click(screen.getByText('Open'));
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1000 });
  });

  it('closes on an outside press', async () => {
    render(
      <div>
        <button type="button">outside</button>
        <Popover trigger={<span>Open</span>}>Panel</Popover>
      </div>,
    );
    fireEvent.click(screen.getByText('Open'));
    await screen.findByRole('dialog');
    fireEvent.mouseDown(screen.getByText('outside'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1000 });
  });
});
