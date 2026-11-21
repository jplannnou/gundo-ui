import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeekdayPicker, type WeekdayPickerDay } from '../WeekdayPicker';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const DAYS: WeekdayPickerDay[] = [
  { value: 'mon', label: 'L', ariaLabel: 'lunes' },
  { value: 'tue', label: 'M', ariaLabel: 'martes' },
  { value: 'wed', label: 'X', ariaLabel: 'miércoles' },
  { value: 'thu', label: 'J', ariaLabel: 'jueves' },
  { value: 'fri', label: 'V', ariaLabel: 'viernes' },
  { value: 'sat', label: 'S', ariaLabel: 'sábado' },
  { value: 'sun', label: 'D', ariaLabel: 'domingo' },
];

const GROUP_LABEL = 'Días de entrenamiento';

describe('WeekdayPicker · multiple', () => {
  it('renders a labelled group with seven toggle buttons', () => {
    render(<WeekdayPicker days={DAYS} value={['mon']} onChange={() => {}} ariaLabel={GROUP_LABEL} />);

    expect(screen.getByRole('group', { name: GROUP_LABEL })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'lunes' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'martes' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('adds a day and returns the selection in days order', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['fri', 'mon']} onChange={onChange} ariaLabel={GROUP_LABEL} />);

    fireEvent.click(screen.getByRole('button', { name: 'miércoles' }));
    expect(onChange).toHaveBeenCalledWith(['mon', 'wed', 'fri']);
  });

  it('removes a selected day', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['mon', 'wed']} onChange={onChange} ariaLabel={GROUP_LABEL} />);

    fireEvent.click(screen.getByRole('button', { name: 'lunes' }));
    expect(onChange).toHaveBeenCalledWith(['wed']);
  });

  it('does not select more days than max and marks the rest aria-disabled', () => {
    const onChange = vi.fn();
    render(
      <WeekdayPicker days={DAYS} value={['mon', 'wed']} onChange={onChange} max={2} ariaLabel={GROUP_LABEL} />,
    );

    const blocked = screen.getByRole('button', { name: 'viernes' });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(blocked);
    expect(onChange).not.toHaveBeenCalled();

    // Selected days stay interactive: you can free a slot.
    const selected = screen.getByRole('button', { name: 'lunes' });
    expect(selected).not.toHaveAttribute('aria-disabled');
    fireEvent.click(selected);
    expect(onChange).toHaveBeenCalledWith(['wed']);
  });

  it('allows selecting again while below max', () => {
    render(<WeekdayPicker days={DAYS} value={['mon']} onChange={() => {}} max={2} ariaLabel={GROUP_LABEL} />);
    expect(screen.getByRole('button', { name: 'viernes' })).not.toHaveAttribute('aria-disabled');
  });

  it('does not drop below min', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['mon', 'wed']} onChange={onChange} min={2} ariaLabel={GROUP_LABEL} />);

    const locked = screen.getByRole('button', { name: 'lunes' });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(locked);
    expect(onChange).not.toHaveBeenCalled();

    // Adding is still possible, and once above min a day can be removed.
    fireEvent.click(screen.getByRole('button', { name: 'viernes' }));
    expect(onChange).toHaveBeenCalledWith(['mon', 'wed', 'fri']);
  });

  it('removes a day when the selection is above min', () => {
    const onChange = vi.fn();
    render(
      <WeekdayPicker days={DAYS} value={['mon', 'wed', 'fri']} onChange={onChange} min={2} ariaLabel={GROUP_LABEL} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'viernes' }));
    expect(onChange).toHaveBeenCalledWith(['mon', 'wed']);
  });

  it('keeps the state readable without color: bold weight and thicker border when selected', () => {
    render(<WeekdayPicker days={DAYS} value={['mon']} onChange={() => {}} ariaLabel={GROUP_LABEL} />);

    const on = screen.getByRole('button', { name: 'lunes' });
    const off = screen.getByRole('button', { name: 'martes' });
    expect(on.style.fontWeight).toBe('700');
    expect(off.style.fontWeight).toBe('500');
    expect(on.style.border).toContain('2px');
    expect(off.style.border).toContain('1px');
    expect(on).not.toHaveClass('gu-bg-surface-raised');
    expect(off).toHaveClass('gu-bg-surface-raised');
  });

  it('sizes every day to at least 44x44 and rounds it with the full-radius token', () => {
    render(<WeekdayPicker days={DAYS} value={[]} onChange={() => {}} ariaLabel={GROUP_LABEL} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button.style.minWidth).toBe('44px');
      expect(button.style.minHeight).toBe('44px');
      expect(button.style.borderRadius).toBe('var(--ui-radius-full)');
      expect(button).toHaveClass('ui-focus-ring');
    }
  });
});

describe('WeekdayPicker · single', () => {
  it('renders a radiogroup with aria-checked radios', () => {
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={() => {}} ariaLabel="Día de la revisión" />);

    expect(screen.getByRole('radiogroup', { name: 'Día de la revisión' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(7);
    expect(screen.getByRole('radio', { name: 'miércoles' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'lunes' })).toHaveAttribute('aria-checked', 'false');
  });

  it('replaces the selection on click and ignores a click on the checked one', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={onChange} ariaLabel={GROUP_LABEL} />);

    fireEvent.click(screen.getByRole('radio', { name: 'viernes' }));
    expect(onChange).toHaveBeenCalledWith(['fri']);

    onChange.mockClear();
    fireEvent.click(screen.getByRole('radio', { name: 'miércoles' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores min and max', () => {
    const onChange = vi.fn();
    render(
      <WeekdayPicker days={DAYS} value={['wed']} mode="single" min={1} max={1} onChange={onChange} ariaLabel={GROUP_LABEL} />,
    );

    const other = screen.getByRole('radio', { name: 'jueves' });
    expect(other).not.toHaveAttribute('aria-disabled');
    fireEvent.click(other);
    expect(onChange).toHaveBeenCalledWith(['thu']);
  });

  it('uses a roving tabindex on the checked radio', () => {
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={() => {}} ariaLabel={GROUP_LABEL} />);

    for (const radio of screen.getAllByRole('radio')) {
      const checked = radio.getAttribute('aria-checked') === 'true';
      expect(radio).toHaveAttribute('tabindex', checked ? '0' : '-1');
    }
  });

  it('makes the first day the tab stop when nothing is selected', () => {
    render(<WeekdayPicker days={DAYS} value={[]} mode="single" onChange={() => {}} ariaLabel={GROUP_LABEL} />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
  });

  it('moves and selects with the arrow keys, wrapping around', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={onChange} ariaLabel={GROUP_LABEL} />);

    const wed = screen.getByRole('radio', { name: 'miércoles' });
    wed.focus();
    fireEvent.keyDown(wed, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(['thu']);
    expect(screen.getByRole('radio', { name: 'jueves' })).toHaveFocus();

    const mon = screen.getByRole('radio', { name: 'lunes' });
    mon.focus();
    fireEvent.keyDown(mon, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(['sun']);
    expect(screen.getByRole('radio', { name: 'domingo' })).toHaveFocus();

    const sun = screen.getByRole('radio', { name: 'domingo' });
    fireEvent.keyDown(sun, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(['mon']);
  });

  it('jumps to the first and last day with Home and End', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={onChange} ariaLabel={GROUP_LABEL} />);

    const wed = screen.getByRole('radio', { name: 'miércoles' });
    fireEvent.keyDown(wed, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(['sun']);
    expect(screen.getByRole('radio', { name: 'domingo' })).toHaveFocus();

    fireEvent.keyDown(wed, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(['mon']);
    expect(screen.getByRole('radio', { name: 'lunes' })).toHaveFocus();
  });

  it('ignores other keys', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={onChange} ariaLabel={GROUP_LABEL} />);

    fireEvent.keyDown(screen.getByRole('radio', { name: 'miércoles' }), { key: 'a' });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('WeekdayPicker · disabled', () => {
  it('disables every day in multiple mode and never calls onChange', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['mon']} onChange={onChange} disabled ariaLabel={GROUP_LABEL} />);

    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'martes' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables every day in single mode', () => {
    const onChange = vi.fn();
    render(<WeekdayPicker days={DAYS} value={['mon']} mode="single" onChange={onChange} disabled ariaLabel={GROUP_LABEL} />);

    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'martes' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('WeekdayPicker · a11y', () => {
  it('has no axe violations in multiple mode', async () => {
    const { container } = render(
      <WeekdayPicker days={DAYS} value={['mon', 'wed']} onChange={() => {}} min={1} max={3} ariaLabel={GROUP_LABEL} />,
    );
    await expectNoA11yViolations(container);
  });

  it('has no axe violations in single mode', async () => {
    const { container } = render(
      <WeekdayPicker days={DAYS} value={['wed']} mode="single" onChange={() => {}} ariaLabel={GROUP_LABEL} />,
    );
    await expectNoA11yViolations(container);
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(
      <WeekdayPicker days={DAYS} value={['mon']} onChange={() => {}} disabled ariaLabel={GROUP_LABEL} />,
    );
    await expectNoA11yViolations(container);
  });
});
