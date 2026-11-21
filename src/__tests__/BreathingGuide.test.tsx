import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BreathingGuide, type BreathingGuideProps, type BreathingPhase } from '../BreathingGuide';
import { expectNoA11yViolations } from './axe-helper';

const NAME = 'Respiración guiada';

/** Una vuelta = 4 + 2 + 6 = 12 s. */
const PHASES: BreathingPhase[] = [
  { label: 'Inspira', seconds: 4, kind: 'in' },
  { label: 'Sostén', seconds: 2, kind: 'hold' },
  { label: 'Espira', seconds: 6, kind: 'out' },
];

const realMatchMedia = window.matchMedia;

/** Simula la preferencia del sistema; `setup.ts` la deja siempre en «sin preferencia». */
function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function renderGuide(props: Partial<BreathingGuideProps> = {}) {
  const onCycle = vi.fn();
  const onDone = vi.fn();
  const base: BreathingGuideProps = {
    phases: PHASES,
    running: true,
    onCycle,
    onDone,
    ariaLabel: NAME,
    ...props,
  };
  const utils = render(<BreathingGuide {...base} />);
  const update = (next: Partial<BreathingGuideProps>) =>
    utils.rerender(<BreathingGuide {...base} {...next} />);
  return { onCycle, onDone, update, ...utils };
}

/**
 * Avanza el reloj falso en pasos cortos, con un `act` por paso. La guía es una
 * cadena de temporizadores: el siguiente solo se programa cuando React vuelca el
 * estado, es decir, al salir del `act`. Con un único `act` grande la cadena se
 * cortaría tras el primer paso. Sin temporizadores pendientes salta de golpe.
 */
const advance = (ms: number) => {
  for (let left = ms; left > 0; ) {
    const step = vi.getTimerCount() === 0 ? left : Math.min(left, 10);
    act(() => void vi.advanceTimersByTime(step));
    left -= step;
  }
};

/** Región `polite` (la única de la guía) y los elementos de apoyo. */
const live = (container: HTMLElement) => container.querySelector('[aria-live]') as HTMLElement;
const circle = (container: HTMLElement) =>
  container.querySelector('[data-breathing-circle]') as HTMLElement;
const seconds = (container: HTMLElement) =>
  container.querySelector('[data-seconds]') as HTMLElement | null;

describe('BreathingGuide', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.matchMedia = realMatchMedia;
  });

  describe('secuencia', () => {
    it('es un grupo con nombre y arranca en la primera fase', () => {
      const { container } = renderGuide();

      expect(screen.getByRole('group', { name: NAME })).toBeInTheDocument();
      expect(live(container)).toHaveTextContent('Inspira');
      expect(live(container)).toHaveAttribute('data-phase-kind', 'in');
    });

    it('pasa de fase justo al acabar los segundos de cada una', () => {
      const { container } = renderGuide();

      advance(3999);
      expect(live(container)).toHaveTextContent('Inspira');
      advance(1);
      expect(live(container)).toHaveTextContent('Sostén');
      expect(live(container)).toHaveAttribute('data-phase-kind', 'hold');

      advance(1999);
      expect(live(container)).toHaveTextContent('Sostén');
      advance(1);
      expect(live(container)).toHaveTextContent('Espira');
      expect(live(container)).toHaveAttribute('data-phase-kind', 'out');
    });

    it('con cycles=1 avisa onCycle(1) y onDone una vez, y la última fase se queda', () => {
      const { container, onCycle, onDone } = renderGuide({ cycles: 1 });

      advance(11_999);
      expect(onCycle).not.toHaveBeenCalled();
      expect(onDone).not.toHaveBeenCalled();

      advance(1);
      expect(onCycle).toHaveBeenCalledTimes(1);
      expect(onCycle).toHaveBeenCalledWith(1);
      expect(onDone).toHaveBeenCalledTimes(1);
      expect(live(container)).toHaveTextContent('Espira');

      advance(60_000);
      expect(onCycle).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('con cycles=2 avisa cada vuelta y onDone solo al acabar la segunda', () => {
      const { container, onCycle, onDone } = renderGuide({ cycles: 2 });

      advance(12_000);
      expect(onCycle).toHaveBeenLastCalledWith(1);
      expect(onDone).not.toHaveBeenCalled();
      expect(live(container)).toHaveTextContent('Inspira');

      advance(11_999);
      expect(onDone).not.toHaveBeenCalled();
      advance(1);
      expect(onCycle.mock.calls).toEqual([[1], [2]]);
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('sin cycles da vueltas sin fin: onCycle sigue contando y onDone no llega', () => {
      const { container, onCycle, onDone } = renderGuide();

      advance(36_000);

      expect(onCycle.mock.calls).toEqual([[1], [2], [3]]);
      expect(onDone).not.toHaveBeenCalled();
      expect(live(container)).toHaveTextContent('Inspira');
    });

    it('cycles=0 cuenta como 1 y un cycles no finito, como vueltas sin fin', () => {
      const zero = renderGuide({ cycles: 0 });
      advance(12_000);
      expect(zero.onDone).toHaveBeenCalledTimes(1);
      zero.unmount();

      const nan = renderGuide({ cycles: Number.NaN });
      advance(60_000);
      expect(nan.onDone).not.toHaveBeenCalled();
    });

    it('acepta segundos con decimales', () => {
      const { onDone } = renderGuide({
        phases: [
          { label: 'Inspira', seconds: 0.5, kind: 'in' },
          { label: 'Espira', seconds: 1.5, kind: 'out' },
        ],
        cycles: 1,
      });

      advance(1999);
      expect(onDone).not.toHaveBeenCalled();
      advance(1);
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('ignora las fases con duración 0, negativa o no numérica', () => {
      const { container, onDone } = renderGuide({
        phases: [
          { label: 'Cero', seconds: 0, kind: 'in' },
          { label: 'Mala', seconds: Number.NaN, kind: 'hold' },
          { label: 'Negativa', seconds: -3, kind: 'out' },
          { label: 'Inspira', seconds: 2, kind: 'in' },
        ],
        cycles: 1,
      });

      expect(live(container)).toHaveTextContent('Inspira');
      advance(2000);
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('sin fases válidas no pinta nada ni programa temporizadores', () => {
      const empty = renderGuide({ phases: [] });
      expect(empty.container).toBeEmptyDOMElement();
      empty.unmount();

      const invalid = renderGuide({ phases: [{ label: 'x', seconds: 0, kind: 'in' }] });
      expect(invalid.container).toBeEmptyDOMElement();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('segundos', () => {
    it('por defecto no se pintan', () => {
      const { container } = renderGuide();

      expect(seconds(container)).not.toBeInTheDocument();
    });

    it('cuentan hacia atrás en cada fase', () => {
      const { container } = renderGuide({ showSeconds: true });
      expect(seconds(container)).toHaveTextContent('4');

      advance(1000);
      expect(seconds(container)).toHaveTextContent('3');
      advance(2000);
      expect(seconds(container)).toHaveTextContent('1');

      advance(1000); // pasa a «Sostén», 2 s
      expect(live(container)).toHaveTextContent('Sostén');
      expect(seconds(container)).toHaveTextContent('2');
    });

    it('no se anuncian: son solo visuales', () => {
      const { container } = renderGuide({ showSeconds: true });

      expect(seconds(container)).toHaveAttribute('aria-hidden', 'true');
      expect(seconds(container)!.closest('[aria-live]')).toBeNull();
    });

    it('al terminar se vacían en vez de quedarse en 0', () => {
      const { container } = renderGuide({ showSeconds: true, cycles: 1 });

      advance(12_000);

      expect(seconds(container)).toHaveTextContent('');
    });
  });

  describe('pausa', () => {
    it('con running=false desde el principio no corre nada', () => {
      const { container, onCycle, onDone } = renderGuide({ running: false, cycles: 1 });

      expect(vi.getTimerCount()).toBe(0);
      advance(60_000);

      expect(live(container)).toHaveTextContent('Inspira');
      expect(onCycle).not.toHaveBeenCalled();
      expect(onDone).not.toHaveBeenCalled();
    });

    it('al pasar a running=false se limpia el temporizador y nada avanza', () => {
      const { container, update, onCycle } = renderGuide();
      advance(5000);
      expect(live(container)).toHaveTextContent('Sostén');
      expect(vi.getTimerCount()).toBe(1);

      update({ running: false });
      expect(vi.getTimerCount()).toBe(0);
      advance(60_000);

      expect(live(container)).toHaveTextContent('Sostén');
      expect(onCycle).not.toHaveBeenCalled();
    });

    it('al reanudar, la fase en curso empieza de nuevo desde su primer segundo', () => {
      const { container, update } = renderGuide({ showSeconds: true });
      advance(5000); // «Sostén», queda 1 s de 2
      expect(seconds(container)).toHaveTextContent('1');

      update({ running: false });
      expect(seconds(container)).toHaveTextContent('2');

      update({ running: true });
      advance(1000);
      expect(live(container)).toHaveTextContent('Sostén');
      expect(seconds(container)).toHaveTextContent('1');
      advance(1000);
      expect(live(container)).toHaveTextContent('Espira');
    });

    it('al reanudar tras acabar no se reinicia: terminó y terminó', () => {
      const { update, onDone } = renderGuide({ cycles: 1 });
      advance(12_000);

      update({ running: false });
      update({ running: true });
      advance(60_000);

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('limpieza', () => {
    it('al desmontar no queda ningún temporizador y no se avisa nada', () => {
      const { unmount, onCycle, onDone } = renderGuide({ cycles: 1 });
      advance(3000);
      expect(vi.getTimerCount()).toBe(1);

      unmount();
      expect(vi.getTimerCount()).toBe(0);
      advance(60_000);

      expect(onCycle).not.toHaveBeenCalled();
      expect(onDone).not.toHaveBeenCalled();
    });

    it('al terminar las vueltas no queda temporizador aunque running siga en true', () => {
      renderGuide({ cycles: 1 });

      advance(12_000);

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('avisos y re-render del padre', () => {
    it('usa el onDone y el onCycle más recientes, no los del primer render', () => {
      const { update, onDone, onCycle } = renderGuide({ cycles: 1 });
      const lateDone = vi.fn();
      const lateCycle = vi.fn();
      advance(3000);

      update({ cycles: 1, onDone: lateDone, onCycle: lateCycle });
      advance(9000);

      expect(lateCycle).toHaveBeenCalledWith(1);
      expect(lateDone).toHaveBeenCalledTimes(1);
      expect(onCycle).not.toHaveBeenCalled();
      expect(onDone).not.toHaveBeenCalled();
    });

    it('un array de fases nuevo en cada render (inline) no reinicia los temporizadores', () => {
      const { container, update } = renderGuide();
      advance(3000);

      update({ phases: PHASES.map((p) => ({ ...p })) });
      expect(vi.getTimerCount()).toBe(1);
      advance(1000);

      expect(live(container)).toHaveTextContent('Sostén');
    });
  });

  describe('movimiento', () => {
    it('anima solo transform y opacity', () => {
      const { container } = renderGuide();
      const properties = circle(container)
        .style.transitionProperty.split(',')
        .map((p) => p.trim())
        .sort();

      expect(properties).toEqual(['opacity', 'transform']);
    });

    it('al arrancar, el círculo recorre su camino con la duración de la fase', () => {
      const { container } = renderGuide();

      expect(circle(container).style.transitionDuration).toBe('4s');
      expect(circle(container).style.transform).toBe('scale(1)');
      expect(circle(container).style.opacity).toBe('1');

      advance(4000);
      expect(circle(container).style.transitionDuration).toBe('2s');

      advance(2000);
      expect(circle(container).style.transitionDuration).toBe('6s');
    });

    it('inspirar crece, sostener se queda y espirar se encoge', () => {
      const { container } = renderGuide();
      expect(circle(container).style.transform).toBe('scale(1)');

      advance(4000); // «Sostén» tras inspirar: sigue lleno
      expect(circle(container).style.transform).toBe('scale(1)');

      advance(2000); // «Espira»: va a pequeño
      expect(circle(container).style.transform).toBe('scale(0.45)');
      expect(circle(container).style.opacity).toBe('0.5');
    });

    it('sostener tras espirar se queda pequeño (pauta de caja)', () => {
      const { container } = renderGuide({
        phases: [
          { label: 'Inspira', seconds: 1, kind: 'in' },
          { label: 'Espira', seconds: 1, kind: 'out' },
          { label: 'Sostén', seconds: 1, kind: 'hold' },
        ],
      });

      advance(2000);

      expect(live(container)).toHaveTextContent('Sostén');
      expect(circle(container).style.transform).toBe('scale(0.45)');
    });

    it('en pausa vuelve a su punto de partida con la transición corta del token', () => {
      const { container } = renderGuide({ running: false });

      expect(circle(container).style.transform).toBe('scale(0.45)');
      expect(circle(container).style.transitionDuration).toBe('var(--ui-duration-slow)');
    });

    it('al terminar vuelve a reposo (pequeño)', () => {
      const { container } = renderGuide({ cycles: 1 });

      advance(12_000);

      expect(circle(container).style.transform).toBe('scale(0.45)');
    });

    it('el círculo es decorativo: oculto a los lectores', () => {
      const { container } = renderGuide();

      expect(circle(container).closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it('fuerza el cálculo de estilos antes de armar la animación', () => {
      const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');

      const { container } = renderGuide();

      expect(spy.mock.contexts).toContain(circle(container));
      spy.mockRestore();
    });

    describe('con prefers-reduced-motion', () => {
      beforeEach(() => mockReducedMotion(true));

      it('el círculo no se mueve: sin transform, sin opacidad y sin transición', () => {
        const { container } = renderGuide();
        const style = circle(container).style;

        expect(style.transform).toBe('');
        expect(style.opacity).toBe('');
        expect(style.transitionProperty).toBe('');
        expect(style.transitionDuration).toBe('');

        advance(4000);
        expect(circle(container).style.transform).toBe('');
        expect(circle(container).style.transitionProperty).toBe('');
      });

      it('el texto y la cuenta siguen cambiando', () => {
        const { container } = renderGuide({ showSeconds: true });
        expect(live(container)).toHaveTextContent('Inspira');
        expect(seconds(container)).toHaveTextContent('4');

        advance(1000);
        expect(seconds(container)).toHaveTextContent('3');

        advance(3000);
        expect(live(container)).toHaveTextContent('Sostén');
        expect(seconds(container)).toHaveTextContent('2');
      });

      it('la secuencia y los avisos no cambian', () => {
        const { onCycle, onDone } = renderGuide({ cycles: 1 });

        advance(12_000);

        expect(onCycle).toHaveBeenCalledWith(1);
        expect(onDone).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('lectores de pantalla', () => {
    it('el texto de la fase vive en una región polite y atómica', () => {
      const { container } = renderGuide();

      expect(live(container)).toHaveAttribute('aria-live', 'polite');
      expect(live(container)).toHaveAttribute('aria-atomic', 'true');
    });

    it('es la única región viva y no hay timer ni status que repita nada', () => {
      const { container } = renderGuide({ showSeconds: true });

      expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('el texto de la fase mide al menos 16 px (token xl = 1.25rem)', () => {
      const { container } = renderGuide();

      expect(live(container).style.fontSize).toBe('var(--ui-font-size-xl)');
    });
  });

  describe('tamaño y estilo', () => {
    it('el círculo mide 200 px por defecto y respeta size', () => {
      const first = renderGuide();
      expect(circle(first.container).parentElement!.style.width).toBe('200px');
      first.unmount();

      const second = renderGuide({ size: 320 });
      expect(circle(second.container).parentElement!.style.width).toBe('320px');
      expect(circle(second.container).parentElement!.style.height).toBe('320px');
    });

    it('un size diminuto o no finito se corrige', () => {
      const tiny = renderGuide({ size: 10 });
      expect(circle(tiny.container).parentElement!.style.width).toBe('64px');
      tiny.unmount();

      const nan = renderGuide({ size: Number.NaN });
      expect(circle(nan.container).parentElement!.style.width).toBe('200px');
    });

    it('ningún color va escrito a mano: todo sale de tokens', () => {
      const { container } = renderGuide({ showSeconds: true });

      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    });
  });

  describe('axe', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    it('sin violaciones en marcha', async () => {
      const { container } = renderGuide({ showSeconds: true });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones en pausa', async () => {
      const { container } = renderGuide({ running: false });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con movimiento reducido', async () => {
      mockReducedMotion(true);
      const { container } = renderGuide({ showSeconds: true });

      await expectNoA11yViolations(container);
    });
  });
});
