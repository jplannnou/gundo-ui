/// <reference types="vite/client" />
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaCard, type MediaCardProps } from '../MediaCard';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const COVER = 'https://cdn.example.test/yoga.jpg';

function renderCard(props: Partial<MediaCardProps> = {}) {
  return render(<MediaCard title="Yoga para empezar" imageSrc={COVER} {...props} />);
}

const slot = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-slot="${name}"]`);

describe('MediaCard · elemento raíz', () => {
  it('sin href ni onClick es un article estático con el título como nombre', () => {
    renderCard();

    expect(screen.getByRole('article', { name: 'Yoga para empezar' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con href es un ancla entera y el encabezado queda dentro', () => {
    renderCard({ href: '/clases/yoga' });

    const link = screen.getByRole('link', { name: 'Yoga para empezar' });
    expect(link).toHaveAttribute('href', '/clases/yoga');
    expect(within(link).getByRole('heading', { level: 3 })).toHaveTextContent('Yoga para empezar');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('con onClick es un botón y no pinta encabezado (un botón no lo admite)', () => {
    const onClick = vi.fn();
    renderCard({ onClick });

    const button = screen.getByRole('button', { name: 'Yoga para empezar' });
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con href y onClick gana el ancla, y el clic sigue llegando al callback', () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    renderCard({ href: '/clases/yoga', onClick });

    fireEvent.click(screen.getByRole('link', { name: 'Yoga para empezar' }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeta el nivel de encabezado', () => {
    renderCard({ headingLevel: 2 });

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Yoga para empezar');
  });

  it('lo interactivo lleva anillo de foco y zona táctil de 44 px; el estático no', () => {
    const { rerender } = renderCard({ href: '/x' });
    const link = screen.getByRole('link');
    expect(link).toHaveClass('ui-focus-ring');
    expect(link.style.minHeight).toBe('44px');

    rerender(<MediaCard title="Yoga para empezar" />);
    expect(screen.getByRole('article').style.minHeight).toBe('');
  });

  it('el efecto al pasar el ratón es solo transform y se apaga con «reducir movimiento»', () => {
    renderCard({ href: '/x' });
    const link = screen.getByRole('link');

    expect(link).toHaveClass('transition-transform');
    expect(link).toHaveClass('motion-reduce:hover:translate-y-0');
    expect(link.className).not.toMatch(/transition-(all|colors|\[)/);
  });
});

describe('MediaCard · portada', () => {
  it('pinta la imagen con su texto alternativo', () => {
    renderCard({ imageAlt: 'Una persona en postura del árbol' });

    expect(screen.getByRole('img', { name: 'Una persona en postura del árbol' })).toHaveAttribute(
      'src',
      COVER,
    );
  });

  it('con alt vacío o ausente la imagen es decorativa', () => {
    const { container, rerender } = renderCard({ imageAlt: '' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('sin imagen es una superficie con el título, nunca un hueco', () => {
    const { container } = render(<MediaCard title="Yoga para empezar" />);

    expect(container.querySelector('img')).toBeNull();
    expect(within(slot(container, 'cover')!).getByText('Yoga para empezar')).toBeInTheDocument();
    expect(slot(container, 'body')).toBeNull();
  });

  it('si la imagen falla al cargar, cae a la superficie con el título', () => {
    const { container } = renderCard();
    expect(slot(container, 'body')).not.toBeNull();

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toBeNull();
    expect(slot(container, 'body')).toBeNull();
    expect(within(slot(container, 'cover')!).getByText('Yoga para empezar')).toBeInTheDocument();
  });

  it('al cambiar de imagen vuelve a intentarlo', () => {
    const { container, rerender } = renderCard();
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();

    rerender(<MediaCard title="Yoga para empezar" imageSrc="https://cdn.example.test/otra.jpg" />);

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.test/otra.jpg');
  });

  it('aspect y size llegan al marcado y cambian la tipografía', () => {
    const { rerender } = renderCard({ aspect: '4/5', size: 'lg' });
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-aspect', '4/5');
    expect(card).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('heading').style.fontSize).toBe('1.25rem');

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} />);
    expect(screen.getByRole('article')).toHaveAttribute('data-aspect', '16/9');
    expect(screen.getByRole('article')).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('heading').style.fontSize).toBe('1rem');
  });

  it('displayTitle pone el título en gu-display y por defecto no', () => {
    const { rerender } = renderCard({ displayTitle: true });
    expect(screen.getByRole('heading')).toHaveClass('gu-display');

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} />);
    expect(screen.getByRole('heading')).not.toHaveClass('gu-display');
  });
});

describe('MediaCard · dónde va el texto', () => {
  it('below: el texto va bajo la portada, fuera de ella', () => {
    const { container } = renderCard({ eyebrow: 'Programa Fuerza' });

    expect(within(slot(container, 'body')!).getByRole('heading')).toBeInTheDocument();
    expect(within(slot(container, 'cover')!).queryByRole('heading')).not.toBeInTheDocument();
    expect(slot(container, 'band')).toBeNull();
  });

  it('overlay: el texto va sobre la portada, en una banda sólida con degradado', () => {
    const { container } = renderCard({ variant: 'overlay', eyebrow: 'Programa Fuerza' });
    const band = slot(container, 'band')!;

    expect(slot(container, 'body')).toBeNull();
    expect(within(band).getByRole('heading')).toHaveTextContent('Yoga para empezar');
    expect(within(band).getByText('Programa Fuerza')).toBeInTheDocument();
    // El degradado acaba en la superficie del tema, no en un color fijo, y el texto
    // empieza donde acaba: su contraste es el del tema y no depende de la foto.
    expect(band.style.background).toContain('var(--ui-surface)');
    expect(band.style.paddingTop).toBe('32px');
  });
});

describe('MediaCard · texto y descripción', () => {
  it('pinta programa y datos, con separadores que el lector de pantalla no lee', () => {
    const { container } = renderCard({
      eyebrow: 'Programa Fuerza',
      meta: ['20 min', 'Principiante', 'Sin equipo'],
    });

    expect(screen.getByText('Programa Fuerza')).toBeInTheDocument();
    const meta = slot(container, 'meta')!;
    expect(within(meta).getByText('20 min')).toBeInTheDocument();
    expect(within(meta).getByText('Sin equipo')).toBeInTheDocument();
    const separators = meta.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    separators.forEach(separator => expect(separator).toHaveTextContent('·'));
  });

  it('ignora los datos vacíos y no pinta la fila si no queda ninguno', () => {
    const { container, rerender } = renderCard({ meta: ['20 min', '', '  '] });
    expect(slot(container, 'meta')!.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} meta={['', ' ']} />);
    expect(slot(container, 'meta')).toBeNull();
  });

  it('el nombre es solo el título y lo demás llega como descripción', () => {
    renderCard({
      href: '/x',
      eyebrow: 'Programa Fuerza',
      meta: ['20 min', 'Principiante'],
      badge: 'Nuevo',
      progress: 0.4,
      progressLabel: '40 % completado',
      locked: true,
      lockedLabel: 'Incluido en el plan Pro',
    });
    const link = screen.getByRole('link');

    expect(link).toHaveAccessibleName('Yoga para empezar');
    expect(link).toHaveAccessibleDescription(
      expect.stringContaining('Programa Fuerza'),
    );
    expect(link).toHaveAccessibleDescription(expect.stringContaining('20 min'));
    expect(link).toHaveAccessibleDescription(expect.stringContaining('Nuevo'));
    expect(link).toHaveAccessibleDescription(expect.stringContaining('40 % completado'));
    expect(link).toHaveAccessibleDescription(expect.stringContaining('Incluido en el plan Pro'));
  });

  it('sin nada extra no declara descripción', () => {
    renderCard({ href: '/x' });

    expect(screen.getByRole('link')).not.toHaveAttribute('aria-describedby');
  });

  it('la insignia va sobre la portada', () => {
    const { container } = renderCard({ badge: 'Nuevo' });

    expect(within(slot(container, 'cover')!).getByText('Nuevo')).toBeInTheDocument();
    expect(slot(container, 'badge')!.style.backgroundColor).toContain('--ui-primary-fill');
    expect(slot(container, 'badge')!.style.color).toContain('--ui-primary-ink');
  });
});

describe('MediaCard · progreso', () => {
  it('dibuja la barra y anuncia su etiqueta solo a los lectores de pantalla', () => {
    const { container } = renderCard({ progress: 0.4, progressLabel: '40 % completado' });

    const bar = slot(container, 'progress')!;
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(slot(container, 'progress-fill')!.style.transform).toBe('scaleX(0.4)');
    expect(slot(container, 'progress-fill')).toHaveClass('gu-fill-in');
    expect(screen.getByText('40 % completado')).toHaveClass('sr-only');
  });

  it('la barra va sobre el borde inferior de la portada', () => {
    const { container } = renderCard({ progress: 0.4 });

    expect(slot(container, 'cover')!.contains(slot(container, 'progress'))).toBe(true);
    expect(slot(container, 'progress')!.style.bottom).toBe('0px');
  });

  it('sin etiqueta no inventa texto', () => {
    const { container } = renderCard({ progress: 0.4 });

    expect(slot(container, 'progress')).not.toBeNull();
    expect(slot(container, 'progress-label')).toBeNull();
  });

  it('recorta el avance a 0–1 y ignora lo que no es número', () => {
    const { container, rerender } = renderCard({ progress: 3 });
    expect(slot(container, 'progress-fill')!.style.transform).toBe('scaleX(1)');

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} progress={-2} />);
    expect(slot(container, 'progress-fill')!.style.transform).toBe('scaleX(0)');

    rerender(<MediaCard title="Yoga para empezar" imageSrc={COVER} progress={Number.NaN} />);
    expect(slot(container, 'progress')).toBeNull();
  });

  it('sin progress no hay barra ni etiqueta, aunque llegue la etiqueta', () => {
    const { container } = renderCard({ progressLabel: '40 % completado' });

    expect(slot(container, 'progress')).toBeNull();
    expect(slot(container, 'progress-label')).toBeNull();
  });
});

describe('MediaCard · bloqueado', () => {
  it('pinta candado y velo sobre la portada, y la etiqueta visible', () => {
    const { container } = renderCard({ locked: true, lockedLabel: 'Incluido en el plan Pro' });

    expect(screen.getByRole('article')).toHaveAttribute('data-locked', 'true');
    expect(slot(container, 'cover-lock')).toHaveAttribute('aria-hidden', 'true');
    expect(slot(container, 'veil')).toHaveAttribute('aria-hidden', 'true');
    expect(within(slot(container, 'locked-label')!).getByText('Incluido en el plan Pro')).toBeVisible();
  });

  it('el título no se apaga: va a contraste pleno y sin opacidad', () => {
    renderCard({ locked: true, lockedLabel: 'Incluido en el plan Pro' });
    const card = screen.getByRole('article');
    const title = screen.getByRole('heading');

    expect(title.style.color).toBe('var(--ui-text)');
    expect(title.style.opacity).toBe('');
    expect(card.style.opacity).toBe('');
    expect(card.className).not.toMatch(/opacity/);
  });

  it('una tarjeta bloqueada sigue siendo clicable', () => {
    const onClick = vi.fn();
    renderCard({ locked: true, lockedLabel: 'Incluido en el plan Pro', onClick });

    fireEvent.click(screen.getByRole('button', { name: 'Yoga para empezar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).not.toBeDisabled();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
  });

  it('bloqueado sin etiqueta pinta solo el candado', () => {
    const { container } = renderCard({ locked: true });

    expect(slot(container, 'cover-lock')).not.toBeNull();
    expect(slot(container, 'locked-label')).toBeNull();
  });

  it('sin locked no hay candado, velo ni etiqueta, aunque llegue lockedLabel', () => {
    const { container } = renderCard({ lockedLabel: 'Incluido en el plan Pro' });

    expect(screen.getByRole('article')).not.toHaveAttribute('data-locked');
    expect(slot(container, 'cover-lock')).toBeNull();
    expect(slot(container, 'veil')).toBeNull();
    expect(slot(container, 'locked-label')).toBeNull();
  });

  it('en una superficie sin imagen la etiqueta también se ve', () => {
    const { container } = render(
      <MediaCard title="Yoga para empezar" locked lockedLabel="Incluido en el plan Pro" />,
    );

    expect(within(slot(container, 'cover')!).getByText('Incluido en el plan Pro')).toBeVisible();
    expect(slot(container, 'veil')).toBeNull();
  });
});

describe('MediaCard · tokens', () => {
  // Una guarda estática: los componentes no llevan ni un color a mano. Si un
  // tema cambia, la tarjeta lo sigue; si alguien pega un hex, esto cae.
  const FUENTES = import.meta.glob('../{MediaCard,HorizontalRail}.tsx', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const sinComentarios = (codigo: string) =>
    codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('lee las fuentes de verdad', () => {
    expect(Object.keys(FUENTES)).toHaveLength(2);
  });

  it('ni un hex ni rgb()/hsl() en los componentes', () => {
    for (const [ruta, codigo] of Object.entries(FUENTES)) {
      const limpio = sinComentarios(codigo);
      expect(limpio, `${ruta}: hay un hex`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(limpio, `${ruta}: hay rgb()/hsl()`).not.toMatch(/\b(?:rgba?|hsla?)\(/);
    }
  });
});

describe('MediaCard · axe', () => {
  it('estática, mínima', async () => {
    const { container } = render(<MediaCard title="Yoga para empezar" />);

    await expectNoA11yViolations(container);
  });

  it('ancla con todo: portada, programa, datos, insignia, avance y bloqueo', async () => {
    const { container } = renderCard({
      href: '/clases/yoga',
      imageAlt: 'Una persona en postura del árbol',
      eyebrow: 'Programa Fuerza',
      meta: ['20 min', 'Principiante'],
      badge: 'Nuevo',
      progress: 0.4,
      progressLabel: '40 % completado',
      locked: true,
      lockedLabel: 'Incluido en el plan Pro',
      displayTitle: true,
      size: 'lg',
    });

    await expectNoA11yViolations(container);
  });

  it('botón, variante overlay', async () => {
    const { container } = renderCard({
      onClick: () => {},
      variant: 'overlay',
      eyebrow: 'Programa Fuerza',
      meta: ['20 min'],
      progress: 0.7,
      progressLabel: '70 % completado',
    });

    await expectNoA11yViolations(container);
  });

  it('sin imagen, con avance y bloqueo', async () => {
    const { container } = render(
      <MediaCard
        title="Yoga para empezar"
        aspect="1/1"
        href="/x"
        progress={1}
        progressLabel="Completado"
        locked
        lockedLabel="Incluido en el plan Pro"
      />,
    );

    await expectNoA11yViolations(container);
  });

  it('varias tarjetas en una lista', async () => {
    const { container } = render(
      <ul>
        <li>
          <MediaCard title="Yoga para empezar" imageSrc={COVER} href="/a" />
        </li>
        <li>
          <MediaCard title="Fuerza en casa" imageSrc={COVER} onClick={() => {}} />
        </li>
        <li>
          <MediaCard title="Movilidad" />
        </li>
      </ul>,
    );

    await expectNoA11yViolations(container);
  });
});
