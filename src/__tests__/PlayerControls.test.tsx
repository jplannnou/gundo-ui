import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlayerControls, type PlayerControlsLabels, type PlayerControlsProps } from '../PlayerControls';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const LABELS: PlayerControlsLabels = {
  play: 'Reproducir',
  pause: 'Pausar',
  skipBack: 'Retroceder 10 segundos',
  skipForward: 'Avanzar 10 segundos',
  seek: 'Posición',
  elapsed: 'Transcurrido',
  remaining: 'Restante',
};

const FULL_LABELS: PlayerControlsLabels = {
  ...LABELS,
  mute: 'Silenciar',
  unmute: 'Activar sonido',
  enterFullscreen: 'Pantalla completa',
  exitFullscreen: 'Salir de pantalla completa',
  controls: 'Controles del reproductor',
};

/** 3:20 de 28:00, el ejemplo del encargo. */
function renderControls(props: Partial<PlayerControlsProps> = {}) {
  const handlers = {
    onPlayPause: vi.fn(),
    onSeek: vi.fn(),
    onSkip: vi.fn(),
  };
  const utils = render(
    <PlayerControls
      playing={false}
      currentTime={200}
      duration={1680}
      labels={LABELS}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, ...utils };
}

const slider = () => screen.getByRole('slider', { name: 'Posición' }) as HTMLInputElement;
const fillOf = (container: HTMLElement) => container.querySelector('[data-seek-fill]') as HTMLElement | null;
const bufferedOf = (container: HTMLElement) =>
  container.querySelector('[data-seek-buffered]') as HTMLElement | null;

describe('PlayerControls', () => {
  describe('botón central', () => {
    it('en pausa se llama «Reproducir»; sonando, «Pausar»', () => {
      const paused = renderControls({ playing: false });
      expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeInTheDocument();
      paused.unmount();

      renderControls({ playing: true });
      expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reproducir' })).not.toBeInTheDocument();
    });

    it('al pulsarlo llama a onPlayPause', () => {
      const { onPlayPause } = renderControls();

      fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }));

      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('mide 64 px; en compact, 48 px', () => {
      const regular = renderControls();
      const button = screen.getByRole('button', { name: 'Reproducir' });
      expect(button.style.width).toBe('64px');
      expect(button.style.height).toBe('64px');
      regular.unmount();

      renderControls({ compact: true });
      const compact = screen.getByRole('button', { name: 'Reproducir' });
      expect(compact.style.width).toBe('48px');
      expect(compact.style.height).toBe('48px');
    });
  });

  describe('retroceder y avanzar', () => {
    it('retroceder da -10 y avanzar da 10', () => {
      const { onSkip } = renderControls();

      fireEvent.click(screen.getByRole('button', { name: 'Retroceder 10 segundos' }));
      fireEvent.click(screen.getByRole('button', { name: 'Avanzar 10 segundos' }));

      expect(onSkip).toHaveBeenNthCalledWith(1, -10);
      expect(onSkip).toHaveBeenNthCalledWith(2, 10);
    });

    it('con canSkip=false se desactivan los dos botones y la barra; reproducir sigue funcionando', () => {
      const { onSkip, onPlayPause } = renderControls({ canSkip: false });

      expect(screen.getByRole('button', { name: 'Retroceder 10 segundos' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Avanzar 10 segundos' })).toBeDisabled();
      expect(slider()).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Avanzar 10 segundos' }));
      expect(onSkip).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('barra de posición', () => {
    it('es un input range nativo, con rango de 0 a la duración', () => {
      renderControls();

      expect(slider().tagName).toBe('INPUT');
      expect(slider()).toHaveAttribute('type', 'range');
      expect(slider()).toHaveAttribute('min', '0');
      expect(slider()).toHaveAttribute('max', '1680');
      expect(slider().value).toBe('200');
    });

    it('aria-valuetext usa los dos tiempos: «3:20 / 28:00» sin función', () => {
      renderControls();

      expect(slider()).toHaveAttribute('aria-valuetext', '3:20 / 28:00');
    });

    it('formatValueText pone las palabras de quien llama: «3:20 de 28:00»', () => {
      const formatValueText = vi.fn((elapsed: string, total: string) => `${elapsed} de ${total}`);
      renderControls({ formatValueText });

      expect(slider()).toHaveAttribute('aria-valuetext', '3:20 de 28:00');
      expect(formatValueText).toHaveBeenCalledWith('3:20', '28:00');
    });

    it('al moverla llama a onSeek con los segundos', () => {
      const { onSeek } = renderControls();

      fireEvent.change(slider(), { target: { value: '500' } });

      expect(onSeek).toHaveBeenCalledWith(500);
    });

    it('no llama a onSeek por sí sola', () => {
      const { onSeek } = renderControls();

      expect(onSeek).not.toHaveBeenCalled();
    });

    it('el relleno sigue a la posición', () => {
      const { container } = renderControls({ currentTime: 25, duration: 100 });

      expect(fillOf(container)!.style.width).toBe('25%');
    });

    it('el tramo descargado solo se pinta si llega buffered', () => {
      const without = renderControls({ currentTime: 25, duration: 100 });
      expect(bufferedOf(without.container)).not.toBeInTheDocument();
      without.unmount();

      const withBuffered = renderControls({ currentTime: 25, duration: 100, buffered: 60 });
      expect(bufferedOf(withBuffered.container)!.style.width).toBe('60%');
    });

    it('acota el tramo descargado a la duración', () => {
      const { container } = renderControls({ currentTime: 25, duration: 100, buffered: 500 });

      expect(bufferedOf(container)!.style.width).toBe('100%');
    });
  });

  describe('tiempos', () => {
    it('enseña el transcurrido y el restante, con su nombre para lectores de pantalla', () => {
      renderControls();

      expect(screen.getByText('Transcurrido')).toBeInTheDocument();
      expect(screen.getByText('Restante')).toBeInTheDocument();
      expect(screen.getByText('3:20')).toBeInTheDocument();
      expect(screen.getByText('24:40')).toBeInTheDocument();
    });

    it('el signo menos del restante no se lee', () => {
      const { container } = renderControls();
      const minus = Array.from(container.querySelectorAll('[aria-hidden="true"]')).find(
        (node) => node.textContent === '−',
      );

      expect(minus).toBeDefined();
    });

    it('con una hora o más, los dos pasan a h:mm:ss', () => {
      renderControls({ currentTime: 65, duration: 5400 });

      expect(screen.getByText('0:01:05')).toBeInTheDocument();
      expect(screen.getByText('1:28:55')).toBeInTheDocument();
      expect(slider()).toHaveAttribute('aria-valuetext', '0:01:05 / 1:30:00');
    });

    it('el restante se redondea hacia arriba: no marca 0:00 con casi un segundo por delante', () => {
      renderControls({ currentTime: 99.4, duration: 100 });

      expect(screen.getByText('1:39')).toBeInTheDocument();
      expect(screen.getByText('0:01')).toBeInTheDocument();
    });

    it('usa cifras tabulares para que no bailen al contar', () => {
      renderControls();

      expect(screen.getByText('3:20').getAttribute('style')).toContain('font-variant-numeric: tabular-nums');
    });
  });

  describe('valores fuera de rango', () => {
    it.each([
      ['negativo', -5, '0'],
      ['pasado de la duración', 9999, '1680'],
      ['NaN', Number.NaN, '0'],
      ['infinito', Number.POSITIVE_INFINITY, '0'],
    ])('currentTime %s se acota a [0, duración]', (_name, currentTime, value) => {
      renderControls({ currentTime });

      expect(slider().value).toBe(value);
    });

    it.each([
      ['cero', 0],
      ['NaN', Number.NaN],
      ['infinito', Number.POSITIVE_INFINITY],
      ['negativa', -30],
    ])('con duración %s la barra queda desactivada y los tiempos en 0:00', (_name, duration) => {
      const { container } = renderControls({ currentTime: 50, duration, buffered: 20 });

      expect(slider()).toBeDisabled();
      expect(screen.getAllByText('0:00')).toHaveLength(2);
      expect(fillOf(container)!.style.width).toBe('0%');
      expect(bufferedOf(container)).not.toBeInTheDocument();
    });
  });

  describe('silencio y pantalla completa', () => {
    it('sin callbacks no hay botón de silencio ni de pantalla completa', () => {
      renderControls({ labels: FULL_LABELS });

      expect(screen.queryByRole('button', { name: 'Silenciar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pantalla completa' })).not.toBeInTheDocument();
    });

    it('con el callback pero sin etiquetas tampoco aparecen: un botón sin nombre no sirve', () => {
      renderControls({ onToggleMute: vi.fn(), onToggleFullscreen: vi.fn() });

      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('el botón de sonido cambia de nombre con el estado y llama al callback', () => {
      const onToggleMute = vi.fn();
      const live = renderControls({ labels: FULL_LABELS, onToggleMute, muted: false });
      fireEvent.click(screen.getByRole('button', { name: 'Silenciar' }));
      expect(onToggleMute).toHaveBeenCalledTimes(1);
      live.unmount();

      renderControls({ labels: FULL_LABELS, onToggleMute, muted: true });
      expect(screen.getByRole('button', { name: 'Activar sonido' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Silenciar' })).not.toBeInTheDocument();
    });

    it('el botón de pantalla completa cambia de nombre con el estado y llama al callback', () => {
      const onToggleFullscreen = vi.fn();
      const windowed = renderControls({ labels: FULL_LABELS, onToggleFullscreen, fullscreen: false });
      fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }));
      expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
      windowed.unmount();

      renderControls({ labels: FULL_LABELS, onToggleFullscreen, fullscreen: true });
      expect(screen.getByRole('button', { name: 'Salir de pantalla completa' })).toBeInTheDocument();
    });

    it('los botones que alternan no usan aria-pressed: el nombre ya dice el estado', () => {
      const { container } = renderControls({
        labels: FULL_LABELS,
        onToggleMute: vi.fn(),
        onToggleFullscreen: vi.fn(),
      });

      expect(container.querySelector('[aria-pressed]')).not.toBeInTheDocument();
    });
  });

  describe('conjunto', () => {
    it('es un grupo con nombre solo si llega labels.controls', () => {
      const named = renderControls({ labels: FULL_LABELS });
      expect(screen.getByRole('group', { name: 'Controles del reproductor' })).toBeInTheDocument();
      named.unmount();

      renderControls();
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    it('compact y normal pintan los mismos controles', () => {
      const regular = renderControls({ labels: FULL_LABELS, onToggleMute: vi.fn(), onToggleFullscreen: vi.fn() });
      const regularNames = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
      regular.unmount();

      renderControls({ labels: FULL_LABELS, onToggleMute: vi.fn(), onToggleFullscreen: vi.fn(), compact: true });
      const compactNames = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));

      expect(compactNames).toEqual(regularNames);
      expect(slider()).toBeInTheDocument();
    });

    it('compact pone el transcurrido, la barra y el restante en la misma fila', () => {
      renderControls({ compact: true });
      const row = slider().parentElement!.parentElement!;

      expect(row).toContainElement(screen.getByText('3:20'));
      expect(row).toContainElement(screen.getByText('24:40'));
    });

    it('acepta className en la raíz', () => {
      const { container } = renderControls({ className: 'mi-clase' });

      expect(container.firstElementChild).toHaveClass('mi-clase');
    });
  });

  describe('táctil y foco', () => {
    it('los botones que no son el central miden 44 px', () => {
      renderControls({ labels: FULL_LABELS, onToggleMute: vi.fn(), onToggleFullscreen: vi.fn() });

      for (const name of ['Retroceder 10 segundos', 'Avanzar 10 segundos', 'Silenciar', 'Pantalla completa']) {
        const button = screen.getByRole('button', { name });
        expect(button.style.width).toBe('44px');
        expect(button.style.height).toBe('44px');
      }
    });

    it('la zona de la barra mide 44 px de alto', () => {
      renderControls();

      expect(slider().parentElement!.style.height).toBe('44px');
    });

    it('todos los botones y la barra llevan el anillo de foco de la librería', () => {
      renderControls({ labels: FULL_LABELS, onToggleMute: vi.fn(), onToggleFullscreen: vi.fn() });

      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveClass('ui-focus-ring');
      }
      expect(slider()).toHaveClass('ui-focus-ring');
    });
  });

  describe('estilo', () => {
    it('ningún color va escrito a mano: todo sale de tokens', () => {
      const { container } = renderControls({
        labels: FULL_LABELS,
        buffered: 600,
        onToggleMute: vi.fn(),
        onToggleFullscreen: vi.fn(),
      });

      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    });

    it('no anima nada: ni transiciones ni animaciones, con o sin movimiento reducido', () => {
      const { container } = renderControls({ playing: true, buffered: 600, labels: FULL_LABELS });

      expect(container.innerHTML).not.toMatch(/transition|animation/i);
    });
  });

  describe('axe', () => {
    it('sin violaciones en el caso mínimo', async () => {
      const { container } = renderControls();

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con todo: sonando, descargado, silencio, pantalla completa y grupo', async () => {
      const { container } = renderControls({
        playing: true,
        buffered: 900,
        muted: true,
        fullscreen: true,
        labels: FULL_LABELS,
        onToggleMute: vi.fn(),
        onToggleFullscreen: vi.fn(),
        formatValueText: (elapsed, total) => `${elapsed} de ${total}`,
      });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones en compact', async () => {
      const { container } = renderControls({ compact: true, labels: FULL_LABELS, onToggleMute: vi.fn() });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con canSkip=false', async () => {
      const { container } = renderControls({ canSkip: false });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con la duración todavía desconocida', async () => {
      const { container } = renderControls({ duration: Number.NaN });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con una hora o más', async () => {
      const { container } = renderControls({ currentTime: 3700, duration: 5400 });

      await expectNoA11yViolations(container);
    });
  });
});
