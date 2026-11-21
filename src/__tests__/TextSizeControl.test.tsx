import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextSizeControl, type TextSizeOption } from '../TextSizeControl';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const OPTIONS: TextSizeOption[] = [
  { value: 'md', label: 'Normal', scale: 1 },
  { value: 'lg', label: 'Grande', scale: 1.15 },
  { value: 'xl', label: 'Muy grande', scale: 1.3 },
];

function renderControl(props: Partial<Parameters<typeof TextSizeControl>[0]> = {}) {
  const onChange = vi.fn();
  const view = render(
    <TextSizeControl
      ariaLabel="Tamaño del texto"
      options={OPTIONS}
      value="md"
      onChange={onChange}
      {...props}
    />,
  );
  return { ...view, onChange };
}

describe('TextSizeControl', () => {
  it('es un grupo de radios con nombre y una sola opción marcada', () => {
    renderControl({ value: 'lg' });
    expect(screen.getByRole('radiogroup', { name: 'Tamaño del texto' })).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    // La letra es decorativa: el nombre es solo la etiqueta.
    expect(screen.getByRole('radio', { name: 'Grande' })).toBeTruthy();
  });

  it('un toque elige', () => {
    const { onChange } = renderControl();
    fireEvent.click(screen.getByRole('radio', { name: 'Muy grande' }));
    expect(onChange).toHaveBeenCalledWith('xl');
  });

  it('solo la opción elegida entra en el orden de tabulación', () => {
    renderControl({ value: 'lg' });
    expect(screen.getAllByRole('radio').map((radio) => radio.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('sin valor válido el grupo sigue siendo alcanzable', () => {
    renderControl({ value: 'nope' });
    expect(screen.getAllByRole('radio').map((radio) => radio.tabIndex)).toEqual([0, -1, -1]);
  });

  it('flechas, Inicio y Fin cambian la opción y dan la vuelta', () => {
    const { onChange } = renderControl({ value: 'md' });
    const [first, , last] = screen.getAllByRole('radio');
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('lg');
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('xl');
    fireEvent.keyDown(first, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('xl');
    fireEvent.keyDown(last, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('md');
    fireEvent.keyDown(first, { key: 'a' });
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('la muestra se pinta al tamaño elegido', () => {
    renderControl({ value: 'xl', sampleText: 'Así se verá el texto.' });
    expect(screen.getByTestId('text-size-sample').style.fontSize).toContain('1.3');
  });

  it('pasa axe', async () => {
    const { container } = renderControl({ value: 'lg', sampleText: 'Así se verá el texto.' });
    await expectNoA11yViolations(container);
  });
});
