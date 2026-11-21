import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RescheduleSheet, type RescheduleSheetDay, type RescheduleSheetProps } from '../RescheduleSheet';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const DAYS: RescheduleSheetDay[] = [
  { value: '2026-11-23', label: 'Lunes', sublabel: '23 de noviembre', current: true },
  { value: '2026-11-24', label: 'Martes', sublabel: '24 de noviembre' },
  { value: '2026-11-25', label: 'Miércoles', sublabel: '25 de noviembre', disabled: true },
  { value: '2026-11-26', label: 'Jueves', sublabel: '26 de noviembre' },
  { value: '2026-11-27', label: 'Viernes' },
];

const BASE: RescheduleSheetProps = {
  open: true,
  onClose: () => {},
  title: 'Mover entreno',
  days: DAYS,
  onChange: () => {},
  confirmLabel: 'Mover aquí',
  onConfirm: () => {},
  cancelLabel: 'Cancelar',
};

function renderSheet(props: Partial<RescheduleSheetProps> = {}) {
  return render(
    <RescheduleSheet
      {...BASE}
      description="Elige otro día de esta semana."
      currentLabel="Día actual"
      closeLabel="Cerrar"
      {...props}
    />,
  );
}

/** Mantiene el día elegido como lo haría la app: el componente es controlado. */
function Harness({ onChange, ...rest }: Partial<RescheduleSheetProps>) {
  const [value, setValue] = useState<string | undefined>(rest.value);
  return (
    <RescheduleSheet
      {...BASE}
      currentLabel="Día actual"
      closeLabel="Cerrar"
      {...rest}
      value={value}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const confirmButton = () => screen.getByRole('button', { name: 'Mover aquí' });

describe('RescheduleSheet', () => {
  it('renders nothing when closed', () => {
    renderSheet({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is the DS Sheet: a modal dialog named by its title and described by its description', () => {
    renderSheet();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-kind', 'drawer');
    expect(dialog).toHaveAccessibleName('Mover entreno');
    expect(dialog).toHaveAccessibleDescription('Elige otro día de esta semana.');
    expect(screen.getByRole('heading', { level: 2, name: 'Mover entreno' })).toBeInTheDocument();
  });

  it('lists the days as a radiogroup with none chosen', () => {
    renderSheet();

    const group = screen.getByRole('radiogroup', { name: 'Mover entreno' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(5);
    radios.forEach(radio => expect(radio).toHaveAttribute('aria-checked', 'false'));
    expect(screen.getByRole('radio', { name: /Martes/ })).toHaveTextContent('24 de noviembre');
  });

  it('names the list with daysLabel when given', () => {
    renderSheet({ daysLabel: 'Días de la semana' });

    expect(screen.getByRole('radiogroup', { name: 'Días de la semana' })).toBeInTheDocument();
  });

  it('marks the current day with its visible label and aria-current, and only that one', () => {
    renderSheet();

    expect(screen.getAllByText('Día actual')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveTextContent('Día actual');
    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveAttribute('aria-current', 'true');
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('every row is a touch target of at least 44 px', () => {
    renderSheet();

    screen.getAllByRole('radio').forEach(radio => {
      expect(parseInt(radio.style.minHeight, 10)).toBeGreaterThanOrEqual(44);
    });
  });

  /* ── elegir y confirmar ── */

  it('keeps confirm disabled until a day is chosen', () => {
    renderSheet();

    expect(confirmButton()).toBeDisabled();
  });

  it('keeps confirm disabled while the chosen day is the current one', () => {
    renderSheet({ value: '2026-11-23' });

    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveAttribute('aria-checked', 'true');
    expect(confirmButton()).toBeDisabled();
  });

  it('keeps confirm disabled for a chosen day that is unavailable', () => {
    renderSheet({ value: '2026-11-25' });

    expect(confirmButton()).toBeDisabled();
  });

  it('enables confirm once a different, available day is chosen', () => {
    renderSheet({ value: '2026-11-26' });

    expect(confirmButton()).toBeEnabled();
  });

  it('with no current day flagged, any available day can be confirmed', () => {
    renderSheet({ days: DAYS.map(({ current: _current, ...day }) => day), value: '2026-11-23' });

    expect(confirmButton()).toBeEnabled();
  });

  it('picking a day calls onChange, and confirming calls onConfirm with it', () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    render(<Harness onChange={onChange} onConfirm={onConfirm} />);

    expect(confirmButton()).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /Jueves/ }));
    expect(onChange).toHaveBeenCalledWith('2026-11-26');
    expect(screen.getByRole('radio', { name: /Jueves/ })).toHaveAttribute('aria-checked', 'true');
    expect(confirmButton()).toBeEnabled();

    fireEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('2026-11-26');
  });

  it('does not call onConfirm while confirm is disabled', () => {
    const onConfirm = vi.fn();
    renderSheet({ onConfirm });

    fireEvent.click(confirmButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('can pick the current day (it is not forbidden), but still cannot confirm it', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} value="2026-11-24" />);

    fireEvent.click(screen.getByRole('radio', { name: /Lunes/ }));
    expect(onChange).toHaveBeenCalledWith('2026-11-23');
    expect(confirmButton()).toBeDisabled();
  });

  it('does not call onChange again on the chosen day', () => {
    const onChange = vi.fn();
    renderSheet({ value: '2026-11-26', onChange });

    fireEvent.click(screen.getByRole('radio', { name: /Jueves/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('an unavailable day is disabled and ignores clicks', () => {
    const onChange = vi.fn();
    renderSheet({ onChange });
    const wednesday = screen.getByRole('radio', { name: /Miércoles/ });

    expect(wednesday).toBeDisabled();
    fireEvent.click(wednesday);
    expect(onChange).not.toHaveBeenCalled();
  });

  /* ── teclado ── */

  it('uses a roving tab stop: the first available day with none chosen, the chosen one otherwise', () => {
    const { rerender } = renderSheet();
    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: /Martes/ })).toHaveAttribute('tabindex', '-1');

    rerender(<RescheduleSheet {...BASE} value="2026-11-26" />);
    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: /Jueves/ })).toHaveAttribute('tabindex', '0');
  });

  it('arrows move focus and select, skipping unavailable days and wrapping', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} value="2026-11-24" />);
    const tuesday = screen.getByRole('radio', { name: /Martes/ });
    const thursday = screen.getByRole('radio', { name: /Jueves/ });
    const friday = screen.getByRole('radio', { name: /Viernes/ });
    const monday = screen.getByRole('radio', { name: /Lunes/ });

    tuesday.focus();
    fireEvent.keyDown(tuesday, { key: 'ArrowDown' });
    // El miércoles no está disponible: salta al jueves.
    expect(thursday).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('2026-11-26');
    expect(thursday).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(thursday, { key: 'ArrowRight' });
    expect(friday).toHaveFocus();

    fireEvent.keyDown(friday, { key: 'ArrowDown' });
    expect(monday).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('2026-11-23');

    fireEvent.keyDown(monday, { key: 'ArrowUp' });
    expect(friday).toHaveFocus();
    fireEvent.keyDown(friday, { key: 'ArrowLeft' });
    expect(thursday).toHaveFocus();
    fireEvent.keyDown(thursday, { key: 'ArrowUp' });
    expect(tuesday).toHaveFocus();
  });

  it('Home and End jump to the first and last available day', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} value="2026-11-24" />);
    const tuesday = screen.getByRole('radio', { name: /Martes/ });

    tuesday.focus();
    fireEvent.keyDown(tuesday, { key: 'End' });
    expect(screen.getByRole('radio', { name: /Viernes/ })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('2026-11-27');

    fireEvent.keyDown(screen.getByRole('radio', { name: /Viernes/ }), { key: 'Home' });
    expect(screen.getByRole('radio', { name: /Lunes/ })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('2026-11-23');
  });

  it('Home and End skip an unavailable first or last day', () => {
    const onChange = vi.fn();
    const days: RescheduleSheetDay[] = [
      { value: 'a', label: 'A', disabled: true },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
      { value: 'd', label: 'D', disabled: true },
    ];
    render(<Harness days={days} onChange={onChange} value="b" />);
    const b = screen.getByRole('radio', { name: 'B' });

    b.focus();
    fireEvent.keyDown(b, { key: 'End' });
    expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('radio', { name: 'C' }), { key: 'Home' });
    expect(b).toHaveFocus();
  });

  it('does not move when every day is unavailable', () => {
    const onChange = vi.fn();
    const days: RescheduleSheetDay[] = [
      { value: 'a', label: 'A', disabled: true },
      { value: 'b', label: 'B', disabled: true },
    ];
    renderSheet({ days, onChange });

    // Con todo bloqueado no hay parada del Tab ni nada seleccionable.
    screen.getAllByRole('radio').forEach(radio => expect(radio).toBeDisabled());
    expect(confirmButton()).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const onChange = vi.fn();
    renderSheet({ onChange });
    const monday = screen.getByRole('radio', { name: /Lunes/ });

    monday.focus();
    fireEvent.keyDown(monday, { key: 'a' });
    fireEvent.keyDown(monday, { key: 'Tab' });
    expect(onChange).not.toHaveBeenCalled();
    expect(monday).toHaveFocus();
  });

  /* ── cerrar sin elegir ── */

  it('the cancel button closes without a choice and without confirming', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const onChange = vi.fn();
    renderSheet({ onClose, onConfirm, onChange });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the X button closes without a choice', () => {
    const onClose = vi.fn();
    renderSheet({ onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape closes without a choice', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderSheet({ onClose, onConfirm });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closing also works after choosing, and confirm is not triggered by it', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<Harness onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('radio', { name: /Martes/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('the X button falls back to the cancel label when closeLabel is not given', () => {
    render(<RescheduleSheet {...BASE} />);

    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(2);
  });

  it('confirm is at least 48 px tall and cancel at least 44 px', () => {
    renderSheet();

    expect(confirmButton().style.minHeight).toBe('48px');
    expect(confirmButton().className).toContain('ui-btn-primary');
    expect(parseInt(screen.getByRole('button', { name: 'Cancelar' }).style.minHeight, 10)).toBeGreaterThanOrEqual(44);
  });

  it('has no hard-coded color in its inline styles', () => {
    renderSheet({ value: '2026-11-26' });
    const styled = Array.from(document.querySelectorAll<HTMLElement>('dialog [style]'))
      .map(el => el.getAttribute('style') ?? '')
      .join(';');

    expect(styled).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  /* ── accesibilidad ── */

  it('has no axe violations with nothing chosen', async () => {
    const { container } = renderSheet();

    await expectNoA11yViolations(container);
  });

  it('has no axe violations with a day chosen', async () => {
    const { container } = renderSheet({ value: '2026-11-26' });

    await expectNoA11yViolations(container);
  });
});
