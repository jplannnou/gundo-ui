import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoalRing } from '../GoalRing';
import { expectNoA11yViolations } from './axe-helper';

const mockReduced = vi.hoisted(() => ({ value: false }));
vi.mock('../utils/useReducedMotion', () => ({
  useReducedMotion: () => mockReduced.value,
}));

afterEach(() => {
  mockReduced.value = false;
  vi.restoreAllMocks();
});

/** Los dos círculos del SVG: pista y arco, en ese orden. */
function circles(container: HTMLElement) {
  const [track, arc] = Array.from(container.querySelectorAll('circle'));
  return { track, arc };
}

/** Fracción del anillo que el arco deja pintada (0 = vacío, 1 = lleno). */
function paintedFraction(arc: SVGCircleElement): number {
  const circumference = Number(arc.getAttribute('stroke-dasharray'));
  const offset = Number(arc.getAttribute('stroke-dashoffset'));
  return 1 - offset / circumference;
}

describe('GoalRing', () => {
  describe('semántica de medidor', () => {
    it('expone role meter con valuenow, min, max, label y valuetext', () => {
      render(
        <GoalRing
          value={2}
          max={3}
          label="Entrenos de la semana"
          valueText="2 de 3 entrenos"
          disableAnimation
        />,
      );
      const meter = screen.getByRole('meter', { name: 'Entrenos de la semana' });
      expect(meter).toHaveAttribute('aria-valuenow', '2');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '3');
      expect(meter).toHaveAttribute('aria-valuetext', '2 de 3 entrenos');
    });

    it('no inventa un aria-valuetext cuando no se pasa', () => {
      render(<GoalRing value={2} max={3} label="Meta" disableAnimation />);
      expect(screen.getByRole('meter')).not.toHaveAttribute('aria-valuetext');
    });

    it('acota value por arriba al máximo', () => {
      render(<GoalRing value={9} max={3} label="Meta" disableAnimation />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '3');
    });

    it('acota value por debajo a cero', () => {
      render(<GoalRing value={-4} max={3} label="Meta" disableAnimation />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('trata un value no finito como cero', () => {
      render(<GoalRing value={Number.NaN} max={3} label="Meta" disableAnimation />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('con max 0 no rompe: anillo vacío y sin completar', () => {
      const { container } = render(
        <GoalRing value={5} max={0} label="Meta" disableAnimation />,
      );
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '0');
      const { arc } = circles(container);
      expect(paintedFraction(arc)).toBe(0);
      // Con meta 0 no hay nada que cumplir: no se pinta como completada.
      expect(arc).toHaveAttribute('stroke', 'var(--ui-primary)');
    });

    it('con max negativo tampoco rompe', () => {
      const { container } = render(
        <GoalRing value={2} max={-3} label="Meta" disableAnimation />,
      );
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '0');
      expect(paintedFraction(circles(container).arc)).toBe(0);
    });
  });

  describe('trazo', () => {
    it('pinta la fracción value/max en el arco', () => {
      const { container } = render(
        <GoalRing value={2} max={3} label="Meta" disableAnimation />,
      );
      expect(paintedFraction(circles(container).arc)).toBeCloseTo(2 / 3, 10);
    });

    it('value 0 deja el arco vacío y value = max lo deja lleno', () => {
      const { container, rerender } = render(
        <GoalRing value={0} max={3} label="Meta" disableAnimation />,
      );
      expect(paintedFraction(circles(container).arc)).toBe(0);
      rerender(<GoalRing value={3} max={3} label="Meta" disableAnimation />);
      expect(paintedFraction(circles(container).arc)).toBe(1);
    });

    it('arranca arriba, con extremos redondeados y pista con token de superficie', () => {
      const { container } = render(
        <GoalRing value={1} max={3} label="Meta" disableAnimation />,
      );
      const { track, arc } = circles(container);
      expect(arc.style.transform).toBe('rotate(-90deg)');
      expect(arc).toHaveAttribute('stroke-linecap', 'round');
      expect(track).toHaveAttribute(
        'stroke',
        'var(--ui-surface-strong, var(--ui-border))',
      );
    });

    it('respeta strokeWidth', () => {
      const { container } = render(
        <GoalRing value={1} max={3} label="Meta" strokeWidth={5} disableAnimation />,
      );
      const { track, arc } = circles(container);
      expect(track).toHaveAttribute('stroke-width', '5');
      expect(arc).toHaveAttribute('stroke-width', '5');
    });

    it.each([
      ['md', 96],
      ['lg', 144],
      ['xl', 200],
    ] as const)('tamaño %s mide %i px', (size, px) => {
      render(<GoalRing value={1} max={3} label="Meta" size={size} disableAnimation />);
      const meter = screen.getByRole('meter');
      expect(meter.style.width).toBe(`${px}px`);
      expect(meter.style.height).toBe(`${px}px`);
    });
  });

  describe('color', () => {
    it('usa var(--ui-primary) en curso', () => {
      const { container } = render(
        <GoalRing value={2} max={3} label="Meta" disableAnimation />,
      );
      expect(circles(container).arc).toHaveAttribute('stroke', 'var(--ui-primary)');
    });

    it('cambia a var(--ui-success) al cumplir la meta', () => {
      const { container } = render(
        <GoalRing value={3} max={3} label="Meta" disableAnimation />,
      );
      expect(circles(container).arc).toHaveAttribute('stroke', 'var(--ui-success)');
    });

    it('también cuenta como completada si value supera a max', () => {
      const { container } = render(
        <GoalRing value={7} max={3} label="Meta" disableAnimation />,
      );
      expect(circles(container).arc).toHaveAttribute('stroke', 'var(--ui-success)');
    });

    it('acepta color y completeColor propios', () => {
      const { container, rerender } = render(
        <GoalRing
          value={1}
          max={3}
          label="Meta"
          color="var(--ui-warning)"
          completeColor="var(--ui-primary)"
          disableAnimation
        />,
      );
      expect(circles(container).arc).toHaveAttribute('stroke', 'var(--ui-warning)');
      rerender(
        <GoalRing
          value={3}
          max={3}
          label="Meta"
          color="var(--ui-warning)"
          completeColor="var(--ui-primary)"
          disableAnimation
        />,
      );
      expect(circles(container).arc).toHaveAttribute('stroke', 'var(--ui-primary)');
    });
  });

  describe('cifra central y pie', () => {
    it('muestra value/max por defecto, con value acotado', () => {
      render(<GoalRing value={2} max={3} label="Meta" disableAnimation />);
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('la cifra por defecto usa gu-display y el color de texto del tema', () => {
      render(<GoalRing value={2} max={3} label="Meta" disableAnimation />);
      const figure = screen.getByText('2/3');
      expect(figure).toHaveClass('gu-display');
      expect(figure).toHaveClass('gu-text-text');
    });

    it('acepta un centerLabel propio', () => {
      render(
        <GoalRing
          value={2}
          max={3}
          label="Meta"
          centerLabel={<strong data-testid="centro">Dos</strong>}
          disableAnimation
        />,
      );
      expect(screen.getByTestId('centro')).toHaveTextContent('Dos');
      expect(screen.queryByText('2/3')).not.toBeInTheDocument();
    });

    it('muestra el caption bajo la cifra, con al menos 12 px', () => {
      render(
        <GoalRing value={2} max={3} label="Meta" caption="esta semana" disableAnimation />,
      );
      const caption = screen.getByText('esta semana');
      expect(caption).toHaveClass('text-xs');
      expect(caption).toHaveClass('gu-text-text-secondary');
    });

    it('sin caption no pinta ninguna línea extra', () => {
      render(<GoalRing value={2} max={3} label="Meta" disableAnimation />);
      expect(screen.getByRole('meter').querySelectorAll('span')).toHaveLength(1);
    });

    it('no pone texto fijo propio: solo lo que llega por props', () => {
      render(
        <GoalRing
          value={1}
          max={4}
          label="Zielfortschritt"
          valueText="1 von 4 Trainings"
          centerLabel="1 / 4"
          caption="diese Woche"
          disableAnimation
        />,
      );
      const meter = screen.getByRole('meter', { name: 'Zielfortschritt' });
      expect(meter).toHaveTextContent('1 / 4diese Woche');
    });
  });

  describe('animación', () => {
    function stubFrames() {
      const frames: FrameRequestCallback[] = [];
      const raf = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback) => {
          frames.push(cb);
          return frames.length;
        });
      vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
      return { frames, raf };
    }

    it('llena de 0 al valor final en ~700 ms con ease-out', () => {
      const { frames } = stubFrames();
      vi.spyOn(performance, 'now').mockReturnValue(1000);
      const { container } = render(<GoalRing value={2} max={3} label="Meta" />);
      const arc = circles(container).arc;

      // Antes del primer fotograma el arco está vacío.
      expect(paintedFraction(arc)).toBe(0);
      expect(frames).toHaveLength(1);

      // A mitad de camino: ease-out cúbico = 1 - (1 - 0.5)^3 = 0,875 del trayecto.
      act(() => frames.shift()!(1350));
      expect(paintedFraction(arc)).toBeCloseTo((2 / 3) * 0.875, 10);

      // Al cumplirse los 700 ms queda exactamente en el valor final.
      act(() => frames.shift()!(1700));
      expect(paintedFraction(arc)).toBeCloseTo(2 / 3, 10);
      expect(frames).toHaveLength(0);
    });

    it('si el valor cambia, sigue desde donde estaba y no desde cero', () => {
      const { frames } = stubFrames();
      vi.spyOn(performance, 'now').mockReturnValue(0);
      const { container, rerender } = render(<GoalRing value={1} max={4} label="Meta" />);
      const arc = circles(container).arc;
      act(() => frames.shift()!(700));
      expect(paintedFraction(arc)).toBeCloseTo(1 / 4, 10);

      rerender(<GoalRing value={3} max={4} label="Meta" />);
      // Fotograma inicial de la nueva animación: aún no se ha movido del 25 %.
      expect(paintedFraction(arc)).toBeCloseTo(1 / 4, 10);
      act(() => frames.shift()!(700));
      expect(paintedFraction(arc)).toBeCloseTo(3 / 4, 10);
    });

    it('con movimiento reducido pinta el valor final directo y no pide fotogramas', () => {
      mockReduced.value = true;
      const { raf } = stubFrames();
      const { container } = render(<GoalRing value={2} max={3} label="Meta" />);
      expect(paintedFraction(circles(container).arc)).toBeCloseTo(2 / 3, 10);
      expect(raf).not.toHaveBeenCalled();
    });

    it('con disableAnimation pinta el valor final directo y no pide fotogramas', () => {
      const { raf } = stubFrames();
      const { container } = render(
        <GoalRing value={2} max={3} label="Meta" disableAnimation />,
      );
      expect(paintedFraction(circles(container).arc)).toBeCloseTo(2 / 3, 10);
      expect(raf).not.toHaveBeenCalled();
    });

    it('cancela el fotograma pendiente al desmontar', () => {
      stubFrames();
      const cancel = vi.spyOn(window, 'cancelAnimationFrame');
      const { unmount } = render(<GoalRing value={2} max={3} label="Meta" />);
      unmount();
      expect(cancel).toHaveBeenCalled();
    });
  });

  describe('accesibilidad', () => {
    it('no tiene violaciones axe en curso', async () => {
      const { container } = render(
        <GoalRing
          value={2}
          max={3}
          label="Entrenos de la semana"
          valueText="2 de 3 entrenos"
          caption="esta semana"
          disableAnimation
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones axe al completar la meta ni con max 0', async () => {
      const { container, rerender } = render(
        <GoalRing value={3} max={3} label="Meta" disableAnimation />,
      );
      await expectNoA11yViolations(container);
      rerender(<GoalRing value={0} max={0} label="Meta" disableAnimation />);
      await expectNoA11yViolations(container);
    });
  });
});
