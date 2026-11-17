// Real-browser test (Chromium) for the <dialog>-based Sheet.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Sheet } from '../Sheet';

function Harness({ side }: { side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filters" description="Narrow it down" side={side}>
        <button type="button">inside</button>
      </Sheet>
    </div>
  );
}

describe('Sheet (native <dialog>)', () => {
  it('is a real modal pinned to the right edge, full height', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('opener'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog.matches(':modal')).toBe(true);
    await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().right)).toBe(window.innerWidth));
    expect(Math.round(dialog.getBoundingClientRect().height)).toBe(window.innerHeight);
  });

  it('pins to the left edge with side="left"', async () => {
    render(<Harness side="left" />);
    fireEvent.click(screen.getByText('opener'));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().left)).toBe(0));
  });

  it('is named by its title and described by its description', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('opener'));
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAccessibleDescription('Narrow it down');
  });

  it('closes on a real Escape and returns focus to the opener', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('opener'));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(screen.getByText('opener'));
  });
});
