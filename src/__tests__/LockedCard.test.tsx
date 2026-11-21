import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LockedCard } from '../LockedCard';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const BASE = {
  title: 'Plan semanal de entrenamiento',
  lockLabel: 'Incluido en el plan superior',
};

/**
 * Recorre el elemento y todos sus ancestros: la opacidad se hereda hacia abajo
 * en pantalla, así que un `opacity` en cualquier ancestro apagaría el texto.
 */
function cadenaConOpacidadReducida(el: HTMLElement): string[] {
  const culpables: string[] = [];
  for (let nodo: HTMLElement | null = el; nodo && nodo !== document.body; nodo = nodo.parentElement) {
    const inline = nodo.style.opacity;
    if (inline !== '' && Number(inline) < 1) culpables.push(`style.opacity=${inline}`);
    const computada = window.getComputedStyle(nodo).opacity;
    if (computada !== '' && Number(computada) < 1) culpables.push(`computed.opacity=${computada}`);
    if (/(^|\s)(opacity-\d+|opacity-\[|disabled:opacity|group-disabled:opacity)/.test(nodo.className.toString())) {
      culpables.push(`class=${nodo.className.toString()}`);
    }
  }
  return culpables;
}

describe('LockedCard', () => {
  it('render mínimo: título en h3, insignia con texto y sin lista ni botón', () => {
    const { container } = render(<LockedCard {...BASE} />);

    expect(screen.getByRole('heading', { level: 3, name: BASE.title })).toBeInTheDocument();
    expect(screen.getByText(BASE.lockLabel)).toBeInTheDocument();
    expect(screen.getByRole('article', { name: BASE.title })).toBeInTheDocument();

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="media"]')).toBeNull();
    expect(container.querySelector('[data-slot="logo"]')).toBeNull();
  });

  it('el bloqueo se cuenta con un candado y una insignia con texto visible', () => {
    const { container } = render(<LockedCard {...BASE} />);

    const insignia = container.querySelector('[data-slot="lock-badge"]') as HTMLElement;
    expect(insignia).toHaveTextContent(BASE.lockLabel);
    // El candado va dentro de la insignia y es decorativo: el texto ya lo dice todo.
    const candado = insignia.querySelector('svg');
    expect(candado).not.toBeNull();
    expect(candado).toHaveAttribute('aria-hidden', 'true');
  });

  it('headingLevel cambia el nivel del encabezado', () => {
    const { rerender } = render(<LockedCard {...BASE} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: BASE.title })).toBeInTheDocument();

    rerender(<LockedCard {...BASE} headingLevel={4} />);
    expect(screen.getByRole('heading', { level: 4, name: BASE.title })).toBeInTheDocument();
  });

  it('pinta la descripción cuando llega', () => {
    render(<LockedCard {...BASE} description="Rutinas ajustadas a tu semana." />);

    expect(screen.getByText('Rutinas ajustadas a tu semana.')).toBeInTheDocument();
  });

  it('lista lo que incluye, uno por línea, cada uno con su check decorativo', () => {
    render(
      <LockedCard
        {...BASE}
        features={['Rutinas semanales', 'Seguimiento de progreso', 'Ajustes con tu coach']}
      />,
    );

    const lista = screen.getByRole('list');
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Rutinas semanales');
    expect(items[2]).toHaveTextContent('Ajustes con tu coach');
    for (const item of items) {
      expect(item.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('una lista vacía no pinta ni ul ni viñetas', () => {
    render(<LockedCard {...BASE} features={[]} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('con onAction y actionLabel pinta el botón y lo dispara al pulsar', () => {
    const onAction = vi.fn();
    render(<LockedCard {...BASE} actionLabel="Ver planes" onAction={onAction} />);

    const boton = screen.getByRole('button', { name: 'Ver planes' });
    expect(boton).toHaveClass('ui-btn-target');
    fireEvent.click(boton);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('el botón solo aparece si llegan actionLabel Y onAction', () => {
    const { rerender } = render(<LockedCard {...BASE} actionLabel="Ver planes" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<LockedCard {...BASE} onAction={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('el logo y la portada entran por sus ranuras', () => {
    const { container } = render(
      <LockedCard
        {...BASE}
        logo={<img src="logo.png" alt="Plan Pro" />}
        media={<img src="portada.png" alt="" />}
      />,
    );

    expect(within(container.querySelector('[data-slot="logo"]') as HTMLElement).getByAltText('Plan Pro')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="media"] img')).not.toBeNull();
  });

  it('el velo y el candado de la portada son decorativos y ningún texto va sobre ella', () => {
    const { container } = render(<LockedCard {...BASE} media={<img src="portada.png" alt="" />} />);

    const portada = container.querySelector('[data-slot="media"]') as HTMLElement;
    expect(portada.querySelector('[data-slot="veil"]')).toHaveAttribute('aria-hidden', 'true');
    expect(portada.querySelector('[data-slot="media-lock"]')).toHaveAttribute('aria-hidden', 'true');

    // Título, descripción, insignia y lista viven en el cuerpo, fuera de la portada.
    expect(portada).not.toContainElement(screen.getByText(BASE.title));
    expect(portada).not.toContainElement(screen.getByText(BASE.lockLabel));
    expect(portada.textContent).toBe('');
  });

  describe('el bloqueo nunca apaga el texto', () => {
    it('el título, la descripción, la insignia y los incluidos no llevan opacidad reducida', () => {
      render(
        <LockedCard
          {...BASE}
          description="Rutinas ajustadas a tu semana."
          features={['Rutinas semanales']}
          media={<img src="portada.png" alt="" />}
          actionLabel="Ver planes"
          onAction={() => {}}
        />,
      );

      const textos = [
        screen.getByRole('heading', { name: BASE.title }),
        screen.getByText('Rutinas ajustadas a tu semana.'),
        screen.getByText(BASE.lockLabel),
        screen.getByText('Rutinas semanales'),
      ];

      for (const texto of textos) {
        expect(cadenaConOpacidadReducida(texto), texto.textContent ?? '').toEqual([]);
      }
    });

    it('la tarjeta no se marca como deshabilitada ni inerte', () => {
      render(<LockedCard {...BASE} description="Rutinas ajustadas a tu semana." />);

      const tarjeta = screen.getByRole('article');
      expect(tarjeta).not.toHaveAttribute('aria-disabled');
      expect(tarjeta).not.toHaveAttribute('inert');
      expect(tarjeta.className).not.toMatch(/opacity|grayscale|blur/);
    });

    it('la guarda muerde: detecta una opacidad heredada de un ancestro', () => {
      render(
        <div style={{ opacity: 0.5 }}>
          <p>texto apagado</p>
        </div>,
      );

      expect(cadenaConOpacidadReducida(screen.getByText('texto apagado'))).not.toEqual([]);
    });
  });

  it('no lleva ningún color literal: todo sale de tokens --ui-*', () => {
    const { container } = render(
      <LockedCard
        {...BASE}
        description="Rutinas ajustadas a tu semana."
        features={['Rutinas semanales']}
        media={<img src="portada.png" alt="" />}
      />,
    );

    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  describe('accesibilidad (axe)', () => {
    it('no tiene violaciones en su versión mínima', async () => {
      const { container } = render(<LockedCard {...BASE} />);

      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones con todo: portada, logo, lista y acción', async () => {
      const { container } = render(
        <LockedCard
          {...BASE}
          description="Rutinas ajustadas a tu semana."
          features={['Rutinas semanales', 'Seguimiento de progreso']}
          logo={<img src="logo.png" alt="Plan Pro" />}
          media={<img src="portada.png" alt="" />}
          actionLabel="Ver planes"
          onAction={() => {}}
          headingLevel={2}
        />,
      );

      await expectNoA11yViolations(container);
    });
  });
});
