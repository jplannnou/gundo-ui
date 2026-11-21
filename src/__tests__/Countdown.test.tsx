import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Countdown, type CountdownProps } from '../Countdown';
import { expectNoA11yViolations } from './axe-helper';

const LABEL = 'La sesión empieza en';
const DONE = '¡Vamos!';

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

function renderCountdown(props: Partial<CountdownProps> = {}) {
  const onDone = vi.fn();
  const utils = render(
    <Countdown running onDone={onDone} label={LABEL} doneLabel={DONE} {...props} />,
  );
  return { onDone, ...utils };
}

/**
 * Avanza el reloj falso en pasos cortos, con un `act` por paso. La cuenta es una
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

/** Región `assertive` (la única de la cuenta atrás). */
const assertive = (container: HTMLElement) =>
  container.querySelector('[aria-live="assertive"]') as HTMLElement;

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.matchMedia = realMatchMedia;
  });

  describe('secuencia', () => {
    it('pinta la cifra inicial dentro de un timer con nombre', () => {
      renderCountdown();

      const timer = screen.getByRole('timer', { name: LABEL });
      expect(timer).toHaveTextContent('3');
    });

    it('cuenta 3, 2, 1 y termina con onDone en el instante exacto', () => {
      const { onDone } = renderCountdown();
      const timer = screen.getByRole('timer');

      advance(999);
      expect(timer).toHaveTextContent('3');
      advance(1);
      expect(timer).toHaveTextContent('2');
      advance(1000);
      expect(timer).toHaveTextContent('1');
      expect(onDone).not.toHaveBeenCalled();

      advance(999);
      expect(onDone).not.toHaveBeenCalled();
      advance(1);
      expect(onDone).toHaveBeenCalledTimes(1);
      expect(timer).not.toHaveTextContent('1');
    });

    it('onDone se llama una sola vez aunque pase mucho tiempo', () => {
      const { onDone } = renderCountdown();

      advance(60_000);

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('respeta `from` e `intervalMs`', () => {
      const { onDone } = renderCountdown({ from: 5, intervalMs: 200 });
      const timer = screen.getByRole('timer');

      expect(timer).toHaveTextContent('5');
      advance(800);
      expect(timer).toHaveTextContent('1');
      expect(onDone).not.toHaveBeenCalled();
      advance(200);
      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('un `from` inválido nunca deja la cuenta rota', () => {
      const first = renderCountdown({ from: 0 });
      expect(screen.getByRole('timer')).toHaveTextContent('1');
      first.unmount();

      renderCountdown({ from: Number.NaN });
      expect(screen.getByRole('timer')).toHaveTextContent('3');
    });

    it('usa el onDone más reciente sin reiniciar la cuenta', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(
        <Countdown running onDone={first} label={LABEL} doneLabel={DONE} />,
      );

      advance(1500);
      rerender(<Countdown running onDone={second} label={LABEL} doneLabel={DONE} />);
      advance(1500);

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  describe('texto final', () => {
    it('al terminar sustituye la cifra por doneLabel', () => {
      renderCountdown();

      advance(3000);

      expect(screen.getByRole('timer')).toHaveTextContent(DONE);
    });

    it('sin doneLabel no pinta ni anuncia nada al terminar, pero onDone sí se llama', () => {
      const { onDone, container } = renderCountdown({ doneLabel: undefined });

      advance(3000);

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('timer')).toBeEmptyDOMElement();
      expect(assertive(container)).toBeEmptyDOMElement();
    });
  });

  describe('lectores de pantalla', () => {
    it('la cifra no se anuncia: el timer va con aria-live off', () => {
      renderCountdown();

      expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'off');
    });

    it('solo el final se anuncia, en una región assertive que existe desde el principio', () => {
      const { container } = renderCountdown();
      const region = assertive(container);

      expect(region).toBeInTheDocument();
      expect(region).toBeEmptyDOMElement();

      advance(2000); // 3 → 2 → 1: sigue en silencio
      expect(region).toBeEmptyDOMElement();

      advance(1000);
      expect(region).toHaveTextContent(DONE);
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });

    it('no hay ninguna región polite ni status que anuncie cada cifra', () => {
      const { container } = renderCountdown();

      expect(container.querySelectorAll('[aria-live="polite"], [role="status"]')).toHaveLength(0);
      expect(container.querySelectorAll('[aria-live]')).toHaveLength(2);
    });

    it('el texto final no se lee dos veces: lo visible va aria-hidden', () => {
      renderCountdown();

      advance(3000);

      const visible = screen.getByRole('timer').querySelector('span > span');
      expect(visible).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('pausa', () => {
    it('con running=false no avanza y no deja temporizadores vivos', () => {
      const { onDone } = renderCountdown({ running: false });

      advance(10_000);

      expect(screen.getByRole('timer')).toHaveTextContent('3');
      expect(onDone).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('pausar a mitad conserva la cifra y reanudar sigue desde ahí', () => {
      const onDone = vi.fn();
      const { rerender } = render(
        <Countdown running onDone={onDone} label={LABEL} doneLabel={DONE} />,
      );
      advance(1000); // ya en 2

      rerender(<Countdown running={false} onDone={onDone} label={LABEL} doneLabel={DONE} />);
      expect(vi.getTimerCount()).toBe(0);
      advance(30_000);
      expect(screen.getByRole('timer')).toHaveTextContent('2');
      expect(onDone).not.toHaveBeenCalled();

      rerender(<Countdown running onDone={onDone} label={LABEL} doneLabel={DONE} />);
      advance(1000);
      expect(screen.getByRole('timer')).toHaveTextContent('1');
      advance(1000);
      expect(onDone).toHaveBeenCalledTimes(1);
    });
  });

  describe('saltar', () => {
    it('sin skipLabel no hay botón', () => {
      renderCountdown({ onSkip: vi.fn() });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('termina al instante: onSkip y onDone, sin esperar al siguiente intervalo', () => {
      const onSkip = vi.fn();
      const { onDone, container } = renderCountdown({ skipLabel: 'Saltar', onSkip });

      fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));

      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledTimes(1);
      expect(onSkip.mock.invocationCallOrder[0]).toBeLessThan(onDone.mock.invocationCallOrder[0]);
      expect(screen.getByRole('timer')).toHaveTextContent(DONE);
      expect(assertive(container)).toHaveTextContent(DONE);
    });

    it('tras saltar no queda temporizador y onDone no se repite', () => {
      const { onDone } = renderCountdown({ skipLabel: 'Saltar' });

      advance(1000);
      fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
      expect(vi.getTimerCount()).toBe(0);
      advance(30_000);

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('funciona también con la cuenta en pausa', () => {
      const { onDone } = renderCountdown({ running: false, skipLabel: 'Saltar' });

      fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('el botón no está una vez terminada la cuenta', () => {
      renderCountdown({ skipLabel: 'Saltar' });

      advance(3000);

      expect(screen.queryByRole('button', { name: 'Saltar' })).not.toBeInTheDocument();
    });

    it('el botón mide al menos 44 px', () => {
      renderCountdown({ skipLabel: 'Saltar' });
      const button = screen.getByRole('button', { name: 'Saltar' });

      expect(button.style.minHeight).toBe('44px');
      expect(button.style.minWidth).toBe('44px');
      expect(button).toHaveClass('ui-focus-ring');
    });
  });

  describe('limpieza', () => {
    it('al desmontar no queda ningún temporizador ni se llama a onDone', () => {
      const { onDone, unmount } = renderCountdown();
      advance(1000);
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
      advance(30_000);
      expect(onDone).not.toHaveBeenCalled();
    });
  });

  describe('movimiento', () => {
    it('con movimiento, la cifra entra con escala + opacidad y los tokens de movimiento', () => {
      renderCountdown();
      const pop = screen.getByRole('timer').firstElementChild as HTMLElement;

      expect(pop.style.transitionProperty).toBe('transform, opacity');
      expect(pop.style.transitionDuration).toBe('var(--ui-duration-slow)');
      expect(pop.style.transitionTimingFunction).toBe('var(--ui-easing-out)');
      // Tras montar se consolida el estado final: no se queda invisible.
      expect(pop.style.opacity).toBe('1');
      expect(pop.style.transform).toBe('scale(1)');
    });

    it('con prefers-reduced-motion la cifra cambia sin transición ni transform', () => {
      mockReducedMotion(true);
      renderCountdown();
      const timer = screen.getByRole('timer');
      const pop = timer.firstElementChild as HTMLElement;

      expect(pop.style.transitionProperty).toBe('');
      expect(pop.style.transform).toBe('');
      expect(pop.style.opacity).toBe('');

      advance(1000);
      expect(timer).toHaveTextContent('2');
      const next = timer.firstElementChild as HTMLElement;
      expect(next.style.transitionProperty).toBe('');
      expect(next.style.transform).toBe('');
    });

    it('con prefers-reduced-motion la secuencia y el final siguen igual', () => {
      mockReducedMotion(true);
      const { onDone, container } = renderCountdown();

      advance(3000);

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(assertive(container)).toHaveTextContent(DONE);
    });
  });

  describe('estilo', () => {
    it('la cifra usa gu-display y ningún color va a mano', () => {
      const { container } = renderCountdown({ skipLabel: 'Saltar' });

      expect(container.querySelector('.gu-display')).toHaveTextContent('3');
      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    });
  });

  describe('axe', () => {
    // axe usa temporizadores reales: con los falsos se quedaría esperando.
    beforeEach(() => {
      vi.useRealTimers();
    });

    it('sin violaciones contando', async () => {
      const { container } = renderCountdown({ skipLabel: 'Saltar' });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones en pausa y sin botón', async () => {
      const { container } = renderCountdown({ running: false });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con el texto final', async () => {
      const { container } = renderCountdown({ skipLabel: 'Saltar', intervalMs: 5 });

      // `waitFor` deja a React procesar cada paso de la cadena (un `act` único la cortaría).
      await waitFor(() => expect(assertive(container)).toHaveTextContent(DONE));
      await expectNoA11yViolations(container);
    });
  });
});
