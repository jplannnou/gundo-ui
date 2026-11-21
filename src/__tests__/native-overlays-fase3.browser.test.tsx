// Real-browser tests (Chromium) for the overlays migrated to the platform in
// Fase 3: DropdownMenu and Tooltip (Popover API + CSS anchor positioning),
// CommandPalette and StepWizardModal (<dialog>.showModal()). jsdom has neither
// top layer, anchor positioning nor an inert background. Run: pnpm test:browser
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { DropdownMenu } from '../DropdownMenu';
import { Tooltip } from '../Tooltip';
import { CommandPalette } from '../CommandPalette';
import { Modal } from '../Modal';
import {
  StepWizardModal,
  StepWizardContent,
  StepWizardActions,
  StepWizardProgress,
} from '../StepWizard';

const rect = (el: Element) => el.getBoundingClientRect();
// Los overlays entran con una transición: la geometría se mide con ella terminada.
const settled = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));
const inTopLayer = (el: Element) => el.matches(':popover-open') || el.matches(':modal');

afterEach(() => {
  document.head.querySelectorAll('style[data-fase3]').forEach((s) => s.remove());
});

/** Layered utilities, like Tailwind 4 ships them: an UNLAYERED rule in the
 *  library would beat these whatever the specificity. */
function injectUtilities(css: string) {
  const style = document.createElement('style');
  style.setAttribute('data-fase3', '');
  style.textContent = `@layer utilities { ${css} }`;
  document.head.appendChild(style);
}

/* ───────────────────────── DropdownMenu ───────────────────────── */

const items = (spy: (name: string) => void = () => {}) => [
  { label: 'Edit', onClick: () => spy('edit') },
  { label: 'Archive', onClick: () => spy('archive') },
  { label: 'Delete', onClick: () => spy('delete'), danger: true },
];

describe('DropdownMenu (native popover)', () => {
  it('opens as a popover in the top layer with role="menu"', async () => {
    render(<DropdownMenu trigger={<span>Actions</span>} items={items()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    expect(menu.getAttribute('popover')).toBe('manual');
    expect(menu.matches(':popover-open')).toBe(true);
  });

  it('sits right below the trigger, aligned to its right edge by default', async () => {
    // Room on the left: with none, the menu would (rightly) flip to stay on screen.
    render(
      <div style={{ paddingLeft: 300 }}>
        <DropdownMenu trigger={<span>Actions</span>} items={items()} />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    await settled(menu);
    const t = rect(trigger);
    const m = rect(menu);
    expect(Math.abs(m.top - t.bottom - 4)).toBeLessThan(2);
    expect(Math.abs(m.right - t.right)).toBeLessThan(2);
  });

  it('align="left" lines up the left edges', async () => {
    render(
      <div style={{ paddingLeft: 200 }}>
        <DropdownMenu trigger={<span>Actions</span>} items={items()} align="left" />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    await settled(menu);
    expect(Math.abs(rect(menu).left - rect(trigger).left)).toBeLessThan(2);
  });

  it('flips to stay on screen when it would overflow the viewport', async () => {
    render(<DropdownMenu trigger={<span>Actions</span>} items={items()} align="right" />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    expect(rect(menu).left).toBeGreaterThanOrEqual(0);
  });

  it('is not clipped by an ancestor with overflow:hidden', async () => {
    render(
      <div style={{ overflow: 'hidden', height: 40, width: 200 }}>
        <DropdownMenu trigger={<span>Actions</span>} items={items()} />
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    const m = rect(menu);
    // It hangs well outside the 40px box, and the point there still hits the menu.
    expect(m.bottom).toBeGreaterThan(80);
    const hit = document.elementFromPoint(m.left + m.width / 2, m.bottom - 6);
    expect(hit && menu.contains(hit)).toBe(true);
  });

  it('is not clipped by the scrolling box of a Modal either', async () => {
    const spy = vi.fn();
    render(
      <Modal open onClose={() => {}} title="Dialog">
        <DropdownMenu trigger={<span>Actions</span>} items={items(spy)} />
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    const dialog = screen.getByRole('dialog', { name: 'Dialog' });
    expect(rect(menu).bottom).toBeGreaterThan(rect(dialog).bottom);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(spy).toHaveBeenCalledWith('delete');
  });

  it('keeps the padding its utility classes give it (no unlayered override)', async () => {
    injectUtilities('.py-1 { padding-block: 0.25rem; }');
    render(<DropdownMenu trigger={<span>Actions</span>} items={items()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    expect(getComputedStyle(menu).paddingTop).toBe('4px');
    expect(getComputedStyle(menu).paddingBottom).toBe('4px');
  });

  it('focuses the first item, moves with arrows, and Escape returns focus to the trigger', async () => {
    render(<DropdownMenu trigger={<span>Actions</span>} items={items()} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' })));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Archive' }));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(trigger);
  });

  it('activating an item runs it, closes the menu and returns focus', async () => {
    const spy = vi.fn();
    render(<DropdownMenu trigger={<span>Actions</span>} items={items(spy)} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await screen.findByRole('menu');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(spy).toHaveBeenCalledWith('archive');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when the pointer goes down outside', async () => {
    render(
      <div>
        <button type="button">elsewhere</button>
        <DropdownMenu trigger={<span>Actions</span>} items={items()} />
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    await userEvent.click(screen.getByRole('button', { name: 'elsewhere' }));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull(), { timeout: 1500 });
  });
});

/* ───────────────────────── Tooltip ───────────────────────── */

describe('Tooltip (native popover)', () => {
  const setup = (position?: 'top' | 'bottom' | 'left' | 'right') =>
    render(
      <div style={{ padding: 120 }}>
        <Tooltip text="Helpful hint" position={position}>
          <button type="button">anchor</button>
        </Tooltip>
      </div>,
    );

  it('shows on hover as a popover in the top layer, described by role="tooltip"', async () => {
    setup();
    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));
    const tip = await screen.findByRole('tooltip');
    expect(tip.getAttribute('popover')).toBe('manual');
    expect(tip.matches(':popover-open')).toBe(true);
    expect(tip.textContent).toBe('Helpful hint');
    expect(screen.getByRole('button', { name: 'anchor' }).parentElement?.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('sits above the trigger, centred on it (position="top")', async () => {
    setup('top');
    const anchor = screen.getByRole('button', { name: 'anchor' });
    await userEvent.hover(anchor);
    const tip = await screen.findByRole('tooltip');
    const a = rect(anchor);
    const t = rect(tip);
    expect(t.bottom).toBeLessThanOrEqual(a.top);
    expect(a.top - t.bottom).toBeLessThan(14);
    expect(Math.abs(t.left + t.width / 2 - (a.left + a.width / 2))).toBeLessThan(2);
  });

  it.each([
    ['bottom', (a: DOMRect, t: DOMRect) => t.top >= a.bottom],
    ['left', (a: DOMRect, t: DOMRect) => t.right <= a.left],
    ['right', (a: DOMRect, t: DOMRect) => t.left >= a.right],
  ] as const)('position="%s" puts it on that side', async (position, check) => {
    setup(position);
    const anchor = screen.getByRole('button', { name: 'anchor' });
    await userEvent.hover(anchor);
    const tip = await screen.findByRole('tooltip');
    expect(check(rect(anchor), rect(tip))).toBe(true);
  });

  it('shows on keyboard focus and hides on blur', async () => {
    render(
      <div>
        <Tooltip text="Helpful hint">
          <span>anchor</span>
        </Tooltip>
        <button type="button">next</button>
      </div>,
    );
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toBeTruthy();
    await userEvent.tab();
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull(), { timeout: 1500 });
  });

  it('hides when the pointer leaves', async () => {
    setup();
    const anchor = screen.getByRole('button', { name: 'anchor' });
    await userEvent.hover(anchor);
    await screen.findByRole('tooltip');
    await userEvent.unhover(anchor);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull(), { timeout: 1500 });
  });

  it('can be dismissed with Escape (WCAG 1.4.13)', async () => {
    setup();
    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull(), { timeout: 1500 });
  });

  it('is not clipped by an ancestor with overflow:hidden', async () => {
    render(
      <div style={{ overflow: 'hidden', width: 80, height: 30, margin: 100 }}>
        <Tooltip text="A hint that is wider than its box" position="bottom">
          <button type="button">anchor</button>
        </Tooltip>
      </div>,
    );
    const anchor = screen.getByRole('button', { name: 'anchor' });
    await userEvent.hover(anchor);
    const tip = await screen.findByRole('tooltip');
    const box = rect(anchor.closest('div')!);
    expect(tip.matches(':popover-open')).toBe(true);
    expect(rect(tip).bottom).toBeGreaterThan(box.bottom);
  });

  it('never intercepts the pointer (no flicker when it lands on the tooltip)', async () => {
    setup();
    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));
    const tip = await screen.findByRole('tooltip');
    expect(getComputedStyle(tip).pointerEvents).toBe('none');
  });

  it('draws above a native modal opened from the page', async () => {
    render(
      <div>
        <Modal open onClose={() => {}} title="Dialog">
          <Tooltip text="Inside hint">
            <button type="button">anchor</button>
          </Tooltip>
        </Modal>
      </div>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));
    const tip = await screen.findByRole('tooltip');
    expect(tip.matches(':popover-open')).toBe(true);
  });
});

/* ───────────────────────── CommandPalette ───────────────────────── */

const commands = (spy: (name: string) => void = () => {}) => [
  { id: 'a', label: 'Alpha', onSelect: () => spy('alpha') },
  { id: 'b', label: 'Beta', onSelect: () => spy('beta') },
  { id: 'c', label: 'Gamma', onSelect: () => spy('gamma') },
];

function PaletteHarness({ spy, className }: { spy?: (name: string) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      <button type="button">behind</button>
      <CommandPalette
        commands={commands(spy)}
        open={open}
        onOpenChange={setOpen}
        placeholder="Search…"
        className={className}
      />
    </div>
  );
}

const openPalette = async (props: Parameters<typeof PaletteHarness>[0] = {}) => {
  render(<PaletteHarness {...props} />);
  await userEvent.click(screen.getByText('opener'));
  return screen.findByRole('dialog', { name: 'Command palette' });
};

describe('CommandPalette (native <dialog>)', () => {
  it('opens as a real modal in the top layer', async () => {
    const dialog = await openPalette();
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog.matches(':modal')).toBe(true);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('focuses the search field', async () => {
    await openPalette();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('combobox')));
  });

  it('hangs near the top (15dvh) and is centred horizontally', async () => {
    const dialog = await openPalette();
    await settled(dialog);
    const r = rect(dialog);
    expect(Math.abs(r.top - window.innerHeight * 0.15)).toBeLessThan(2);
    expect(Math.abs(r.left + r.width / 2 - window.innerWidth / 2)).toBeLessThan(2);
  });

  it('closes on a real Escape key press', async () => {
    await openPalette();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('returns focus to whatever opened it', async () => {
    await openPalette();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(screen.getByText('opener'));
  });

  it('closes when the backdrop is clicked, not when the panel is', async () => {
    const dialog = await openPalette();
    const r = rect(dialog);
    fireEvent.click(dialog, { clientX: r.left + 10, clientY: r.top + 10 });
    expect(screen.queryByRole('dialog')).not.toBeNull();
    fireEvent.click(dialog, { clientX: 2, clientY: 2 });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('keeps Tab inside it (the page behind is inert)', async () => {
    await openPalette();
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      expect(document.activeElement).not.toBe(screen.getByText('behind'));
      expect(document.activeElement).not.toBe(screen.getByText('opener'));
    }
  });

  it('filters, moves with the arrows and runs the highlighted command on Enter', async () => {
    const spy = vi.fn();
    await openPalette({ spy });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('combobox')));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(spy).toHaveBeenCalledWith('beta');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('keeps the padding its className gives it (no unlayered override)', async () => {
    injectUtilities('.p-9 { padding: 2.25rem; }');
    const dialog = await openPalette({ className: 'p-9' });
    expect(getComputedStyle(dialog).paddingLeft).toBe('36px');
    expect(getComputedStyle(dialog).paddingTop).toBe('36px');
  });

  it('toggles with the Ctrl+K hotkey', async () => {
    render(<PaletteHarness />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeTruthy();
  });
});

/* ───────────────────────── StepWizardModal ───────────────────────── */

const steps = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
];

function WizardHarness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>opener</button>
      <button type="button">behind</button>
      <StepWizardModal
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        title="Wizard"
        steps={steps}
        size="sm"
      >
        <StepWizardProgress />
        <StepWizardContent>
          <button type="button">inside</button>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizardModal>
    </div>
  );
}

const openWizard = async (onClose?: () => void) => {
  render(<WizardHarness onClose={onClose} />);
  await userEvent.click(screen.getByText('opener'));
  return screen.findByRole('dialog', { name: 'Wizard' });
};

describe('StepWizardModal (native <dialog>)', () => {
  it('opens as a real modal in the top layer, named by its title', async () => {
    const dialog = await openWizard();
    expect(dialog.tagName).toBe('DIALOG');
    expect(inTopLayer(dialog)).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('is centred in the viewport', async () => {
    const dialog = await openWizard();
    await settled(dialog);
    const r = rect(dialog);
    expect(Math.abs(r.left + r.width / 2 - window.innerWidth / 2)).toBeLessThan(2);
    expect(Math.abs(r.top + r.height / 2 - window.innerHeight / 2)).toBeLessThan(2);
  });

  it('honours size (sm = max-w-md)', async () => {
    const dialog = await openWizard();
    expect(rect(dialog).width).toBeLessThanOrEqual(448);
  });

  it('closes on a real Escape key press', async () => {
    const onClose = vi.fn();
    await openWizard(onClose);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes from the X button and the first-step Cancel', async () => {
    await openWizard();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    await userEvent.click(screen.getByText('opener'));
    await screen.findByRole('dialog', { name: 'Wizard' });
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('closes when the backdrop is clicked, not when the panel is', async () => {
    const dialog = await openWizard();
    const r = rect(dialog);
    fireEvent.click(dialog, { clientX: r.left + 10, clientY: r.top + 10 });
    expect(screen.queryByRole('dialog')).not.toBeNull();
    fireEvent.click(dialog, { clientX: 2, clientY: 2 });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('keeps Tab inside it (the page behind is inert) and restores focus on close', async () => {
    await openWizard();
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(document.activeElement).not.toBe(screen.getByText('behind'));
      expect(document.activeElement).not.toBe(screen.getByText('opener'));
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
    expect(document.activeElement).toBe(screen.getByText('opener'));
  });

  it('still steps through the wizard inside the dialog', async () => {
    await openWizard();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('button', { name: 'Completar' })).toBeTruthy();
  });

  it('does not force its own padding on the panel (its header and body pad themselves)', async () => {
    injectUtilities('.p-0 { padding: 0; }');
    const dialog = await openWizard();
    expect(getComputedStyle(dialog).paddingLeft).toBe('0px');
    expect(getComputedStyle(dialog).paddingTop).toBe('0px');
  });
});
