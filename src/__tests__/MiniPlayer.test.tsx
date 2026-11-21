import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MiniPlayer, type MiniPlayerProps } from '../MiniPlayer';
import { expectNoA11yViolations } from './axe-helper';

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

afterEach(() => {
  cleanup();
  window.matchMedia = realMatchMedia;
});

const REGION = 'Reproductor';

function renderPlayer(props: Partial<MiniPlayerProps> = {}) {
  const onToggle = vi.fn();
  const utils = render(
    <MiniPlayer
      title="Piernas · día 3"
      subtitle="Con Lucía · 24 min"
      playing={false}
      onToggle={onToggle}
      playLabel="Reproducir"
      pauseLabel="Pausar"
      ariaLabel={REGION}
      {...props}
    />,
  );
  return { onToggle, ...utils };
}

const fill = (container: HTMLElement) =>
  container.querySelector('[data-progress-fill]') as HTMLElement | null;

describe('MiniPlayer', () => {
  describe('región y contenido', () => {
    it('es una región con el nombre que llega por ariaLabel', () => {
      renderPlayer();

      expect(screen.getByRole('region', { name: REGION })).toBeInTheDocument();
    });

    it('muestra título y subtítulo', () => {
      renderPlayer();

      expect(screen.getByText('Piernas · día 3')).toBeInTheDocument();
      expect(screen.getByText('Con Lucía · 24 min')).toBeInTheDocument();
    });

    it('sin subtítulo ni miniatura solo pinta el título', () => {
      const { container } = renderPlayer({ subtitle: undefined });

      expect(screen.getByText('Piernas · día 3')).toBeInTheDocument();
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('la miniatura es decorativa: alt vacío', () => {
      const { container } = renderPlayer({ imageSrc: '/portada.jpg' });
      const img = container.querySelector('img')!;

      expect(img).toHaveAttribute('src', '/portada.jpg');
      expect(img).toHaveAttribute('alt', '');
    });

    it('es solo la piel: no lleva <video> ni <audio>', () => {
      const { container } = renderPlayer({ progress: 0.5, progressLabel: 'Progreso' });

      expect(container.querySelector('video, audio')).not.toBeInTheDocument();
    });

    it('el título largo se corta con puntos suspensivos, no desborda', () => {
      renderPlayer({ title: 'Un título larguísimo '.repeat(20) });
      const title = screen.getByText(/Un título larguísimo/);

      expect(title.style.textOverflow).toBe('ellipsis');
      expect(title.style.whiteSpace).toBe('nowrap');
    });
  });

  describe('play y pausa', () => {
    it('en pausa el botón se llama «Reproducir» y con play «Pausar»', () => {
      const { rerender, onToggle } = renderPlayer({ playing: false });
      expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeInTheDocument();

      rerender(
        <MiniPlayer
          title="Piernas · día 3"
          playing
          onToggle={onToggle}
          playLabel="Reproducir"
          pauseLabel="Pausar"
          ariaLabel={REGION}
        />,
      );

      expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reproducir' })).not.toBeInTheDocument();
    });

    it('el icono cambia con el estado', () => {
      const { container, rerender, onToggle } = renderPlayer({ playing: false });
      expect(container.querySelector('svg[data-icon="play"]')).toBeInTheDocument();

      rerender(
        <MiniPlayer
          title="x"
          playing
          onToggle={onToggle}
          playLabel="Reproducir"
          pauseLabel="Pausar"
          ariaLabel={REGION}
        />,
      );

      expect(container.querySelector('svg[data-icon="pause"]')).toBeInTheDocument();
      expect(container.querySelector('svg[data-icon="play"]')).not.toBeInTheDocument();
    });

    it('pulsarlo llama a onToggle y nada más', () => {
      const onExpand = vi.fn();
      const { onToggle } = renderPlayer({ onExpand });

      fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }));

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onExpand).not.toHaveBeenCalled();
    });

    it('no usa aria-pressed: el cambio de nombre ya dice el estado', () => {
      renderPlayer({ playing: true });

      expect(screen.getByRole('button', { name: 'Pausar' })).not.toHaveAttribute('aria-pressed');
    });

    it('el icono va oculto a los lectores y usa currentColor', () => {
      const { container } = renderPlayer();
      const svg = container.querySelector('svg')!;

      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('abrir el reproductor', () => {
    it('sin onExpand no hay botón de abrir: solo play/pausa', () => {
      renderPlayer({ expandLabel: 'Abrir el reproductor' });

      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('con onExpand, miniatura y texto forman un botón y pulsarlo llama a onExpand', () => {
      const onExpand = vi.fn();
      const { container } = renderPlayer({ onExpand, imageSrc: '/portada.jpg' });
      const button = screen.getByRole('button', { name: /Piernas · día 3/ });

      expect(button).toContainElement(screen.getByText('Con Lucía · 24 min'));
      expect(button).toContainElement(container.querySelector('img'));
      fireEvent.click(screen.getByText('Con Lucía · 24 min'));

      expect(onExpand).toHaveBeenCalledTimes(1);
    });

    it('el nombre del botón es el título visible y expandLabel va como descripción', () => {
      renderPlayer({ onExpand: vi.fn(), expandLabel: 'Abrir el reproductor' });
      const button = screen.getByRole('button', { name: /Piernas · día 3/ });

      expect(button).toHaveAccessibleName('Piernas · día 3 Con Lucía · 24 min');
      expect(button).toHaveAccessibleDescription('Abrir el reproductor');
    });

    it('sin expandLabel el botón no tiene descripción', () => {
      renderPlayer({ onExpand: vi.fn() });

      expect(screen.getByRole('button', { name: /Piernas/ })).toHaveAccessibleDescription('');
    });
  });

  describe('cerrar', () => {
    it('con onClose y closeLabel hay botón y llama a onClose', () => {
      const onClose = vi.fn();
      renderPlayer({ onClose, closeLabel: 'Cerrar' });

      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('sin onClose no hay botón de cerrar', () => {
      renderPlayer({ closeLabel: 'Cerrar' });

      expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
    });

    it('sin closeLabel no hay botón: nunca un botón sin nombre', () => {
      renderPlayer({ onClose: vi.fn() });

      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('barra de progreso', () => {
    it('sin progress no hay barra', () => {
      const { container } = renderPlayer({ progressLabel: 'Progreso' });

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(fill(container)).not.toBeInTheDocument();
    });

    it('es una progressbar con nombre, valores 0–100 y el ancho del relleno', () => {
      const { container } = renderPlayer({ progress: 0.35, progressLabel: 'Progreso' });
      const bar = screen.getByRole('progressbar', { name: 'Progreso' });

      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-valuenow', '35');
      expect(fill(container)!.style.width).toBe('35%');
    });

    it('es de solo lectura: no se puede enfocar ni tiene controles', () => {
      renderPlayer({ progress: 0.5, progressLabel: 'Progreso' });
      const bar = screen.getByRole('progressbar');

      expect(bar).not.toHaveAttribute('tabindex');
      expect(bar.querySelector('input, button, [tabindex]')).not.toBeInTheDocument();
    });

    it('sin progressLabel la barra se oculta a los lectores (adorno), pero se pinta', () => {
      const { container } = renderPlayer({ progress: 0.5 });

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(fill(container)!.style.width).toBe('50%');
      expect(fill(container)!.parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it.each([
      [-0.4, '0%', '0'],
      [1.7, '100%', '100'],
      [Number.NaN, '0%', '0'],
      [Number.POSITIVE_INFINITY, '0%', '0'],
    ])('acota progress=%s', (value, width, now) => {
      const { container } = renderPlayer({ progress: value, progressLabel: 'Progreso' });

      expect(fill(container)!.style.width).toBe(width);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', now);
    });

    it('con movimiento el relleno se suaviza; con prefers-reduced-motion no', () => {
      const first = renderPlayer({ progress: 0.5, progressLabel: 'Progreso' });
      expect(fill(first.container)!.style.transitionProperty).toBe('width');
      first.unmount();

      mockReducedMotion(true);
      const second = renderPlayer({ progress: 0.5, progressLabel: 'Progreso' });
      expect(fill(second.container)!.style.transitionProperty).toBe('');
    });
  });

  describe('táctil y foco', () => {
    it('play/pausa y cerrar miden al menos 44 px', () => {
      renderPlayer({ onClose: vi.fn(), closeLabel: 'Cerrar' });

      for (const name of ['Reproducir', 'Cerrar']) {
        const button = screen.getByRole('button', { name });
        expect(button.style.width).toBe('44px');
        expect(button.style.height).toBe('44px');
      }
    });

    it('la zona de abrir mide al menos 44 px de alto', () => {
      renderPlayer({ onExpand: vi.fn() });

      expect(screen.getByRole('button', { name: /Piernas/ }).style.minHeight).toBe('44px');
    });

    it('todos los botones llevan el anillo de foco de la librería', () => {
      renderPlayer({ onExpand: vi.fn(), onClose: vi.fn(), closeLabel: 'Cerrar' });

      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveClass('ui-focus-ring');
      }
    });
  });

  describe('posición', () => {
    it('va fija abajo, por encima de la cabecera y por debajo de los modales', () => {
      renderPlayer();
      const region = screen.getByRole('region');

      expect(region.style.position).toBe('fixed');
      expect(region.style.bottom).toBe('0px');
      expect(region.style.zIndex).toBe('var(--ui-z-dock)');
    });

    it('bottomOffset la sube y deja la zona segura a la barra de debajo', () => {
      const flush = renderPlayer();
      expect(screen.getByRole('region').style.paddingBottom).toContain('safe-area');
      flush.unmount();

      renderPlayer({ bottomOffset: 64 });
      const region = screen.getByRole('region');

      expect(region.style.bottom).toBe('64px');
      expect(region.style.paddingBottom).not.toContain('safe-area');
    });

    it('un bottomOffset inválido cuenta como 0', () => {
      renderPlayer({ bottomOffset: Number.NaN });

      expect(screen.getByRole('region').style.bottom).toBe('0px');
    });
  });

  describe('estilo', () => {
    it('ningún color va escrito a mano: todo sale de tokens', () => {
      const { container } = renderPlayer({
        imageSrc: '/portada.jpg',
        progress: 0.4,
        progressLabel: 'Progreso',
        onExpand: vi.fn(),
        onClose: vi.fn(),
        closeLabel: 'Cerrar',
      });

      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    });
  });

  describe('axe', () => {
    it('sin violaciones en el caso mínimo', async () => {
      const { container } = renderPlayer();

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con todo: miniatura, progreso, abrir y cerrar', async () => {
      const { container } = renderPlayer({
        playing: true,
        imageSrc: '/portada.jpg',
        progress: 0.4,
        progressLabel: 'Progreso',
        onExpand: vi.fn(),
        expandLabel: 'Abrir el reproductor',
        onClose: vi.fn(),
        closeLabel: 'Cerrar',
      });

      await expectNoA11yViolations(container);
    });

    it('sin violaciones con progreso decorativo (sin progressLabel)', async () => {
      const { container } = renderPlayer({ progress: 0.4 });

      await expectNoA11yViolations(container);
    });
  });
});
