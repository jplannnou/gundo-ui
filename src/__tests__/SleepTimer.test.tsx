import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SleepTimer, type SleepTimerLabels, type SleepTimerProps } from '../SleepTimer';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const LABELS: SleepTimerLabels = {
  group: 'Detener en',
  minutes: (n) => `${n} min`,
  end: 'Al terminar la pista',
  endStatus: 'Se detendrá al terminar la pista',
  remaining: (time) => `Se detiene en ${time}`,
  cancel: 'Cancelar temporizador',
};

function renderTimer(props: Partial<SleepTimerProps> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <SleepTimer value={null} onChange={onChange} options={[5, 10, 15, 30]} labels={LABELS} {...props} />,
  );
  return { onChange, ...utils };
}

const chip = (name: string) => screen.getByRole('button', { name });

describe('SleepTimer', () => {
  describe('opciones', () => {
    it('pinta un chip por cada opción en minutos, más «al terminar la pista»', () => {
      renderTimer();

      for (const name of ['5 min', '10 min', '15 min', '30 min', 'Al terminar la pista']) {
        expect(chip(name)).toBeInTheDocument();
      }
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });

    it('sin labels.end no hay opción «al terminar»', () => {
      renderTimer({ labels: { ...LABELS, end: undefined, endStatus: undefined } });

      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('las opciones salen de props: otras opciones, otros chips', () => {
      renderTimer({ options: [20, 45, 90] });

      expect(chip('20 min')).toBeInTheDocument();
      expect(chip('90 min')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '5 min' })).not.toBeInTheDocument();
    });

    it('ignora opciones que no valen y las repetidas', () => {
      renderTimer({ options: [10, 10, 0, -5, Number.NaN, Number.POSITIVE_INFINITY, 15] });

      expect(screen.getAllByRole('button')).toHaveLength(3);
      expect(chip('10 min')).toBeInTheDocument();
      expect(chip('15 min')).toBeInTheDocument();
    });

    it('son un grupo con nombre, no un select', () => {
      const { container } = renderTimer();

      expect(screen.getByRole('group', { name: 'Detener en' })).toBeInTheDocument();
      expect(container.querySelector('select')).not.toBeInTheDocument();
    });
  });

  describe('elegir', () => {
    it('pulsar una opción llama a onChange con los minutos', () => {
      const { onChange } = renderTimer();

      fireEvent.click(chip('15 min'));

      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('pulsar «al terminar la pista» llama a onChange con "end"', () => {
      const { onChange } = renderTimer();

      fireEvent.click(chip('Al terminar la pista'));

      expect(onChange).toHaveBeenCalledWith('end');
    });

    it('pulsar la opción ya activa la desactiva: onChange(null)', () => {
      const { onChange } = renderTimer({ value: 15, remainingSeconds: 600 });

      fireEvent.click(chip('15 min'));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('pulsar la de «al terminar» ya activa también la desactiva', () => {
      const { onChange } = renderTimer({ value: 'end' });

      fireEvent.click(chip('Al terminar la pista'));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('elegir otra con una activa cambia directamente a la nueva', () => {
      const { onChange } = renderTimer({ value: 15, remainingSeconds: 600 });

      fireEvent.click(chip('30 min'));

      expect(onChange).toHaveBeenCalledWith(30);
    });
  });

  describe('estado activo', () => {
    it('solo el chip activo tiene aria-pressed=true', () => {
      renderTimer({ value: 10, remainingSeconds: 540 });

      expect(chip('10 min')).toHaveAttribute('aria-pressed', 'true');
      for (const name of ['5 min', '15 min', '30 min', 'Al terminar la pista']) {
        expect(chip(name)).toHaveAttribute('aria-pressed', 'false');
      }
    });

    it('sin nada activo, todos en false y sin fila de estado', () => {
      renderTimer();

      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveAttribute('aria-pressed', 'false');
      }
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });

    it('"end" marca solo la opción de «al terminar»', () => {
      renderTimer({ value: 'end' });

      expect(chip('Al terminar la pista')).toHaveAttribute('aria-pressed', 'true');
      expect(chip('5 min')).toHaveAttribute('aria-pressed', 'false');
    });

    it('el activo cambia el relleno, pero no el peso ni el borde: el chip no se mueve', () => {
      renderTimer({ value: 10, remainingSeconds: 540 });
      const active = chip('10 min');
      const idle = chip('5 min');

      expect(active.style.fontWeight).toBe(idle.style.fontWeight);
      expect(active.style.borderWidth).toBe(idle.style.borderWidth);
      expect(active.style.backgroundColor).not.toBe(idle.style.backgroundColor);
    });
  });

  describe('cuenta atrás', () => {
    it('con minutos activos y segundos restantes enseña lo que falta', () => {
      renderTimer({ value: 15, remainingSeconds: 754 });

      expect(screen.getByRole('timer')).toHaveTextContent('Se detiene en 12:34');
    });

    it('redondea hacia arriba: no marca 0:00 con casi un segundo por delante', () => {
      renderTimer({ value: 5, remainingSeconds: 0.4 });

      expect(screen.getByRole('timer')).toHaveTextContent('Se detiene en 0:01');
    });

    it('con una hora o más usa h:mm:ss', () => {
      renderTimer({ options: [90], value: 90, remainingSeconds: 5400 });

      expect(screen.getByRole('timer')).toHaveTextContent('Se detiene en 1:30:00');
    });

    it('un restante negativo o no finito se enseña como 0:00', () => {
      const negative = renderTimer({ value: 5, remainingSeconds: -3 });
      expect(screen.getByRole('timer')).toHaveTextContent('Se detiene en 0:00');
      negative.unmount();

      renderTimer({ value: 5, remainingSeconds: Number.NaN });
      expect(screen.getByRole('timer')).toHaveTextContent('Se detiene en 0:00');
    });

    it('con minutos activos y sin remainingSeconds no hay fila de estado', () => {
      renderTimer({ value: 15 });

      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancelar temporizador' })).not.toBeInTheDocument();
    });

    it('con "end" enseña el estado de «al terminar», que no lleva cuenta atrás', () => {
      renderTimer({ value: 'end' });

      expect(screen.getByRole('timer')).toHaveTextContent('Se detendrá al terminar la pista');
    });

    it('con "end" y sin endStatus usa el texto de la opción', () => {
      renderTimer({ value: 'end', labels: { ...LABELS, endStatus: undefined } });

      expect(screen.getByRole('timer')).toHaveTextContent('Al terminar la pista');
    });

    it('la cuenta no se anuncia cada segundo: aria-live apagado', () => {
      renderTimer({ value: 15, remainingSeconds: 600 });

      expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'off');
    });
  });

  describe('cancelar', () => {
    it('el botón de cancelar llama a onChange(null)', () => {
      const { onChange } = renderTimer({ value: 15, remainingSeconds: 600 });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar temporizador' }));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('también aparece con "end"', () => {
      renderTimer({ value: 'end' });

      expect(screen.getByRole('button', { name: 'Cancelar temporizador' })).toBeInTheDocument();
    });

    it('al cancelar, el foco pasa a la opción que estaba activa', () => {
      renderTimer({ value: 15, remainingSeconds: 600 });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar temporizador' }));

      expect(chip('15 min')).toHaveFocus();
    });

    it('al cancelar «al terminar», el foco pasa a esa opción', () => {
      renderTimer({ value: 'end' });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar temporizador' }));

      expect(chip('Al terminar la pista')).toHaveFocus();
    });
  });

  describe('táctil y foco', () => {
    it('todos los chips y el botón de cancelar miden al menos 44 px', () => {
      renderTimer({ value: 15, remainingSeconds: 600 });

      for (const button of screen.getAllByRole('button')) {
        expect(button.style.minHeight).toBe('44px');
        expect(button.style.minWidth).toBe('44px');
      }
    });

    it('todos los botones llevan el anillo de foco de la librería', () => {
      renderTimer({ value: 15, remainingSeconds: 600 });

      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveClass('ui-focus-ring');
      }
    });

    it('acepta className en la raíz', () => {
      const { container } = renderTimer({ className: 'mi-clase' });

      expect(container.firstElementChild).toHaveClass('mi-clase');
    });
  });

  describe('estilo', () => {
    it('ningún color va escrito a mano: todo sale de tokens', () => {
      const { container } = renderTimer({ value: 15, remainingSeconds: 600 });

      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    });

    it('no anima nada: ni transiciones ni animaciones', () => {
      const { container } = renderTimer({ value: 15, remainingSeconds: 600 });

      expect(container.innerHTML).not.toMatch(/transition|animation/i);
    });
  });

  describe('axe', () => {
    it('sin violaciones en el caso mínimo', async () => {
      const { container } = renderTimer();

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con minutos activos y cuenta atrás', async () => {
      const { container } = renderTimer({ value: 15, remainingSeconds: 600 });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con «al terminar» activo', async () => {
      const { container } = renderTimer({ value: 'end' });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones sin la opción «al terminar»', async () => {
      const { container } = renderTimer({ labels: { ...LABELS, end: undefined, endStatus: undefined } });

      await expectNoA11yViolations(container);
    });
  });
});
