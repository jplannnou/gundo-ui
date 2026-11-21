import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HorizontalRail, type HorizontalRailProps } from '../HorizontalRail';
import { expectNoA11yViolations } from './axe-helper';

// jsdom no maqueta: `clientWidth`/`scrollWidth` valen 0 y `matchMedia` dice que no a todo.
// Aquí se fingen las dos cosas para poder probar los extremos del carrusel.
const CLIENT_WIDTH = 300;
const metrics = { clientWidth: CLIENT_WIDTH, scrollWidth: 900 };

const originalMatchMedia = window.matchMedia;

function mockMedia(active: readonly ('fine' | 'narrow' | 'reduced')[]) {
  const fragments = { fine: 'pointer: fine', narrow: 'max-width: 640px', reduced: 'prefers-reduced-motion' };
  window.matchMedia = ((query: string) => ({
    matches: active.some(name => query.includes(fragments[name])),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  metrics.clientWidth = CLIENT_WIDTH;
  metrics.scrollWidth = 900;
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => metrics.clientWidth,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => metrics.scrollWidth,
  });
  mockMedia([]);
});

afterEach(() => {
  cleanup();
  // Se quitan las propiedades propias: vuelven a verse las de Element.prototype.
  Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth');
  window.matchMedia = originalMatchMedia;
  vi.unstubAllGlobals();
});

const DEFAULT_ITEMS: ReactNode[] = [
  <a key="a" href="/a">
    Yoga
  </a>,
  <a key="b" href="/b">
    Fuerza
  </a>,
  <a key="c" href="/c">
    Movilidad
  </a>,
];

/** Los hijos van como argumentos sueltos, igual que en JSX: `renderRail({}, <a/>, null, <a/>)`. */
function renderRail(props: Partial<Omit<HorizontalRailProps, 'children'>> = {}, ...items: ReactNode[]) {
  return render(
    createElement(
      HorizontalRail,
      // `children: null` solo satisface el tipo: createElement lo sustituye por los argumentos sueltos.
      { ariaLabel: 'Clases nuevas', prevLabel: 'Anterior', nextLabel: 'Siguiente', ...props, children: null },
      ...(items.length > 0 ? items : DEFAULT_ITEMS),
    ),
  );
}

const region = () => screen.getByRole('region', { name: 'Clases nuevas' });

/** Mueve el desplazamiento del carrusel y avisa, como haría el navegador. */
function scrollTo(el: HTMLElement, left: number) {
  Object.defineProperty(el, 'scrollLeft', { configurable: true, writable: true, value: left });
  fireEvent.scroll(el);
}

/** El navegador desplaza; jsdom ni siquiera tiene `scrollBy`. */
function spyScrollBy(el: HTMLElement) {
  const scrollBy = vi.fn();
  (el as unknown as { scrollBy: typeof scrollBy }).scrollBy = scrollBy;
  return scrollBy;
}

describe('HorizontalRail · semántica', () => {
  it('es una región con nombre que contiene una lista con un elemento por hijo', () => {
    renderRail();

    const list = within(region()).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getByRole('link', { name: 'Fuerza' })).toHaveAttribute('href', '/b');
  });

  it('descarta los hijos nulos y los booleanos', () => {
    renderRail(
      {},
      null,
      <a key="a" href="/a">
        Yoga
      </a>,
      false,
      undefined,
      <a key="b" href="/b">
        Fuerza
      </a>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('acepta una lista generada con map, que es como llegará de verdad', () => {
    renderRail(
      {},
      ['Yoga', 'Fuerza', 'Movilidad', 'Pilates'].map(name => (
        <a key={name} href={`/${name}`}>
          {name}
        </a>
      )),
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('un Fragment cuenta como un solo hijo: los elementos se pasan sueltos o con map', () => {
    renderRail(
      {},
      <>
        <a href="/a">Yoga</a>
        <a href="/b">Fuerza</a>
      </>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('sin elementos no pinta nada, ni una región vacía', () => {
    const { container } = render(
      <HorizontalRail ariaLabel="Clases nuevas" prevLabel="Anterior" nextLabel="Siguiente">
        {null}
        {false}
      </HorizontalRail>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('la región entra en el orden de tabulación y los elementos reciben el foco normal', () => {
    renderRail();

    expect(region()).toHaveAttribute('tabindex', '0');
    expect(region()).toHaveClass('ui-focus-ring');
    region().focus();
    expect(region()).toHaveFocus();

    const link = screen.getByRole('link', { name: 'Yoga' });
    expect(link).not.toHaveAttribute('tabindex');
    link.focus();
    expect(link).toHaveFocus();
  });

  it('ancho de elemento, separación y clase propia llegan al marcado', () => {
    const { container } = renderRail({ itemWidth: '12rem', gap: '2rem', className: 'mi-carrusel' });

    expect(container.firstElementChild).toHaveClass('mi-carrusel');
    screen.getAllByRole('listitem').forEach(item => expect(item.style.width).toBe('12rem'));
    expect(screen.getByRole('list').style.gap).toBe('2rem');
  });

  it('el desplazamiento es nativo, horizontal y con imán al inicio de cada elemento', () => {
    renderRail();

    expect(region().style.overflowX).toBe('auto');
    expect(region().style.scrollSnapType).toBe('x proximity');
    screen.getAllByRole('listitem').forEach(item => expect(item.style.scrollSnapAlign).toBe('start'));
  });

  it('con claves propias en los hijos, reordenarlos no pierde el foco del que lo tiene', () => {
    const { rerender } = render(
      <HorizontalRail ariaLabel="Clases nuevas" prevLabel="Anterior" nextLabel="Siguiente">
        <a key="yoga" href="/a">Yoga</a>
        <a key="fuerza" href="/b">Fuerza</a>
      </HorizontalRail>,
    );
    screen.getByRole('link', { name: 'Fuerza' }).focus();

    rerender(
      <HorizontalRail ariaLabel="Clases nuevas" prevLabel="Anterior" nextLabel="Siguiente">
        <a key="fuerza" href="/b">Fuerza</a>
        <a key="yoga" href="/a">Yoga</a>
      </HorizontalRail>,
    );

    expect(screen.getByRole('link', { name: 'Fuerza' })).toHaveFocus();
  });
});

describe('HorizontalRail · flechas', () => {
  it('sin puntero fino (táctil) no hay flechas, aunque haya desbordamiento', () => {
    mockMedia([]);
    renderRail();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con puntero fino y desbordamiento hay dos botones con el nombre que llega por props', () => {
    mockMedia(['fine']);
    renderRail({ prevLabel: 'Ver anteriores', nextLabel: 'Ver siguientes' });

    expect(screen.getByRole('button', { name: 'Ver anteriores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver siguientes' })).toBeInTheDocument();
  });

  it('las flechas no llevan texto propio y quedan fuera de la región que se desplaza', () => {
    mockMedia(['fine']);
    renderRail();

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button.textContent).toBe('');
      expect(button).toHaveClass('ui-focus-ring');
      expect(button).toHaveAttribute('type', 'button');
      expect(button.style.width).toBe('44px');
      expect(button.style.height).toBe('44px');
    });
    expect(within(region()).queryByRole('button')).not.toBeInTheDocument();
  });

  it('al inicio «anterior» está deshabilitada y «siguiente» no', () => {
    mockMedia(['fine']);
    renderRail();

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('en el medio las dos están habilitadas', () => {
    mockMedia(['fine']);
    renderRail();

    scrollTo(region(), 300);

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('al final «siguiente» se deshabilita y «anterior» no', () => {
    mockMedia(['fine']);
    renderRail();

    scrollTo(region(), 600);

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('tolera 1 px de redondeo de subpíxeles en el extremo', () => {
    mockMedia(['fine']);
    renderRail();

    scrollTo(region(), 599.5);

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('si todo cabe no hay flechas', () => {
    mockMedia(['fine']);
    metrics.scrollWidth = CLIENT_WIDTH;
    renderRail();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('un píxel de sobra por redondeo no cuenta como desbordamiento', () => {
    mockMedia(['fine']);
    metrics.scrollWidth = CLIENT_WIDTH + 1;
    renderRail();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('«siguiente» desplaza casi una página con animación', () => {
    mockMedia(['fine']);
    renderRail();
    const scrollBy = spyScrollBy(region());

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ left: CLIENT_WIDTH * 0.9, behavior: 'smooth' });
  });

  it('«anterior» desplaza hacia atrás', () => {
    mockMedia(['fine']);
    renderRail();
    scrollTo(region(), 600);
    const scrollBy = spyScrollBy(region());

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(scrollBy).toHaveBeenCalledWith({ left: -CLIENT_WIDTH * 0.9, behavior: 'smooth' });
  });

  it('con «reducir movimiento» el desplazamiento de las flechas es instantáneo', () => {
    mockMedia(['fine', 'reduced']);
    renderRail();
    const scrollBy = spyScrollBy(region());

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(scrollBy).toHaveBeenCalledWith({ left: CLIENT_WIDTH * 0.9, behavior: 'auto' });
  });

  it('si el botón enfocado se deshabilita en el extremo, el foco pasa a la región', () => {
    mockMedia(['fine']);
    renderRail();
    const next = screen.getByRole('button', { name: 'Siguiente' });
    next.focus();
    expect(next).toHaveFocus();

    scrollTo(region(), 600);

    expect(next).toBeDisabled();
    expect(region()).toHaveFocus();
  });

  it('si cambia el tamaño, vuelve a medir y aparecen o desaparecen las flechas', () => {
    mockMedia(['fine']);
    const callbacks: Array<() => void> = [];
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          callbacks.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect = disconnect;
      },
    );
    metrics.scrollWidth = CLIENT_WIDTH;
    const { unmount } = renderRail();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    metrics.scrollWidth = 900;
    act(() => callbacks.forEach(callback => callback()));
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();

    metrics.scrollWidth = CLIENT_WIDTH;
    act(() => callbacks.forEach(callback => callback()));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

describe('HorizontalRail · edgeBleed', () => {
  it('por defecto solo deja la holgura del anillo de foco, compensada con margen negativo', () => {
    renderRail();
    const style = region().style;

    expect(style.paddingInline).toBe('6px');
    // jsdom reescribe `calc(-1 * 6px)` como `calc(-6px)`: es lo mismo.
    expect(style.marginInline).toMatch(/^calc\(-(1 \* )?6px\)$/);
    expect(style.marginBlock).toBe('-6px');
  });

  it('con edgeBleed en móvil sangra hasta el borde y devuelve el margen como relleno', () => {
    mockMedia(['narrow']);
    renderRail({ edgeBleed: true });
    const style = region().style;

    expect(style.paddingInline).toBe('1rem');
    expect(style.marginInline).toMatch(/^calc\(-(1 \* )?1rem\)$/);
    expect(style.scrollPaddingInline).toBe('1rem');
  });

  it('el margen que compensa se puede cambiar con gutter', () => {
    mockMedia(['narrow']);
    renderRail({ edgeBleed: true, gutter: '1.5rem' });

    expect(region().style.paddingInline).toBe('1.5rem');
  });

  it('con edgeBleed pero en pantalla ancha no sangra', () => {
    mockMedia([]);
    renderRail({ edgeBleed: true });

    expect(region().style.paddingInline).toBe('6px');
  });

  it('en móvil sin edgeBleed tampoco sangra', () => {
    mockMedia(['narrow']);
    renderRail();

    expect(region().style.paddingInline).toBe('6px');
  });
});

describe('HorizontalRail · axe', () => {
  it('sin flechas (táctil)', async () => {
    const { container } = renderRail();

    await expectNoA11yViolations(container);
  });

  it('con flechas, en un extremo y en el otro', async () => {
    mockMedia(['fine']);
    const { container } = renderRail();
    await expectNoA11yViolations(container);

    scrollTo(region(), 600);
    await expectNoA11yViolations(container);
  });

  it('edgeBleed en móvil', async () => {
    mockMedia(['narrow']);
    const { container } = renderRail({ edgeBleed: true });

    await expectNoA11yViolations(container);
  });

  it('con un solo elemento', async () => {
    const { container } = renderRail({}, <a href="/a">Yoga</a>);

    await expectNoA11yViolations(container);
  });
});
