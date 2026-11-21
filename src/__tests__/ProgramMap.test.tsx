import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProgramMap, type ProgramMapPhase, type ProgramMapProps } from '../ProgramMap';
import { expectNoA11yViolations } from './axe-helper';

const statusLabels = {
  done: 'Completado',
  upcoming: 'Pendiente',
  locked: 'Bloqueado',
};

function buildPhases(overrides: { onSelectCurrent?: () => void } = {}): ProgramMapPhase[] {
  return [
    {
      id: 'base',
      label: 'Fase base',
      description: 'Construye el hábito',
      steps: [
        {
          id: 'sueno',
          number: 1,
          title: 'Dormir mejor',
          subtitle: 'Siete días',
          status: 'done',
          href: '/programas/sueno',
          accent: 'var(--ui-primary)',
        },
        {
          id: 'fuerza',
          number: 2,
          title: 'Fuerza en casa',
          status: 'current',
          onSelect: overrides.onSelectCurrent ?? (() => {}),
        },
        { id: 'movilidad', number: 3, title: 'Movilidad', status: 'upcoming' },
      ],
    },
    {
      id: 'avanzada',
      label: 'Fase avanzada',
      steps: [
        { id: 'resistencia', number: 4, title: 'Resistencia', status: 'locked' },
        {
          id: 'competicion',
          number: 5,
          title: 'Competición',
          status: 'locked',
          onSelect: () => {},
        },
      ],
    },
  ];
}

function renderMap(props: Partial<ProgramMapProps> = {}) {
  return render(
    <ProgramMap
      phases={buildPhases()}
      currentLabel="Estás aquí"
      statusLabels={statusLabels}
      ariaLabel="Mapa de programas"
      {...props}
    />,
  );
}

/** Fila (a, button o div) que contiene el título de un paso. */
function rowOf(title: string): HTMLElement {
  const row = screen.getByText(title).closest('a, button, [class*="rounded-xl"]');
  if (!row) throw new Error(`No hay fila para «${title}»`);
  return row as HTMLElement;
}

describe('ProgramMap', () => {
  describe('estructura', () => {
    it('es una sección con el nombre accesible recibido', () => {
      renderMap();
      expect(screen.getByRole('region', { name: 'Mapa de programas' })).toBeInTheDocument();
    });

    it('pinta cada fase con su encabezado y su descripción', () => {
      renderMap();
      expect(screen.getByRole('heading', { name: 'Fase base' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Fase avanzada' })).toBeInTheDocument();
      expect(screen.getByText('Construye el hábito')).toBeInTheDocument();
    });

    it('usa h3 por defecto y respeta headingLevel', () => {
      const { unmount } = renderMap();
      expect(screen.getByRole('heading', { level: 3, name: 'Fase base' })).toBeInTheDocument();
      unmount();

      const dos = renderMap({ headingLevel: 2 });
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      dos.unmount();

      renderMap({ headingLevel: 4 });
      expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
    });

    it('cada fase es una lista ordenada nombrada por su encabezado, con sus pasos', () => {
      renderMap();
      const base = screen.getByRole('list', { name: 'Fase base' });
      const avanzada = screen.getByRole('list', { name: 'Fase avanzada' });
      expect(base.tagName).toBe('OL');
      expect(avanzada.tagName).toBe('OL');
      expect(within(base).getAllByRole('listitem')).toHaveLength(3);
      expect(within(avanzada).getAllByRole('listitem')).toHaveLength(2);
    });

    it('pinta títulos, subtítulos y los números en gu-display', () => {
      renderMap();
      expect(screen.getByText('Dormir mejor')).toBeInTheDocument();
      expect(screen.getByText('Siete días')).toBeInTheDocument();
      for (const n of ['1', '2', '3', '4', '5']) {
        expect(screen.getByText(n)).toHaveClass('gu-display');
      }
    });

    it('sin number, numera los pasos de corrido a través de las fases', () => {
      const phases: ProgramMapPhase[] = [
        {
          id: 'a',
          label: 'A',
          steps: [
            { id: 'a1', title: 'Uno', status: 'upcoming' },
            { id: 'a2', title: 'Dos', status: 'upcoming' },
          ],
        },
        { id: 'b', label: 'B', steps: [{ id: 'b1', title: 'Tres', status: 'upcoming' }] },
      ];
      renderMap({ phases });
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('acepta number como texto', () => {
      const phases: ProgramMapPhase[] = [
        { id: 'a', label: 'A', steps: [{ id: 'a1', number: '02', title: 'Uno', status: 'upcoming' }] },
      ];
      renderMap({ phases });
      expect(screen.getByText('02')).toBeInTheDocument();
    });

    it('con cero fases o una fase sin pasos no rompe', () => {
      const { unmount } = renderMap({ phases: [] });
      expect(screen.getByRole('region', { name: 'Mapa de programas' })).toBeInTheDocument();
      unmount();
      renderMap({ phases: [{ id: 'vacia', label: 'Vacía', steps: [] }] });
      expect(screen.getByRole('heading', { name: 'Vacía' })).toBeInTheDocument();
    });

    it('aplica className al contenedor', () => {
      renderMap({ className: 'mi-clase' });
      expect(screen.getByRole('region')).toHaveClass('mi-clase');
    });
  });

  describe('estás aquí', () => {
    it('marca solo el paso actual con aria-current="step"', () => {
      const { container } = renderMap();
      const marcados = container.querySelectorAll('[aria-current]');
      expect(marcados).toHaveLength(1);
      expect(marcados[0]).toHaveAttribute('aria-current', 'step');
      expect(marcados[0]).toBe(rowOf('Fuerza en casa'));
    });

    it('pinta la insignia visible solo en el paso actual', () => {
      renderMap();
      const insignias = screen.getAllByText('Estás aquí');
      expect(insignias).toHaveLength(1);
      expect(rowOf('Fuerza en casa')).toContainElement(insignias[0]);
    });

    it('la insignia usa los tokens de relleno y tinta del primario', () => {
      renderMap();
      const insignia = screen.getByText('Estás aquí');
      expect(insignia.style.backgroundColor).toBe('var(--ui-primary-fill)');
      expect(insignia.style.color).toBe('var(--ui-primary-ink, var(--ui-surface))');
    });

    it('el paso actual destaca con borde primario y fondo elevado', () => {
      renderMap();
      const fila = rowOf('Fuerza en casa');
      expect(fila).toHaveClass('gu-border-primary');
      expect(fila).toHaveClass('gu-bg-surface-raised');
      expect(rowOf('Movilidad')).not.toHaveClass('gu-border-primary');
    });

    it('sin paso actual no hay aria-current ni insignia', () => {
      const phases: ProgramMapPhase[] = [
        { id: 'a', label: 'A', steps: [{ id: 'a1', title: 'Uno', status: 'done' }] },
      ];
      const { container } = renderMap({ phases });
      expect(container.querySelector('[aria-current]')).toBeNull();
      expect(screen.queryByText('Estás aquí')).not.toBeInTheDocument();
    });
  });

  describe('enlace, botón o texto estático', () => {
    it('un paso con href es un <a> con ese destino', () => {
      renderMap();
      const enlace = screen.getByRole('link', { name: /Dormir mejor/ });
      expect(enlace.tagName).toBe('A');
      expect(enlace).toHaveAttribute('href', '/programas/sueno');
    });

    it('un paso con onSelect es un <button type="button"> y el clic lo llama', () => {
      const onSelect = vi.fn();
      renderMap({ phases: buildPhases({ onSelectCurrent: onSelect }) });
      const boton = screen.getByRole('button', { name: /Fuerza en casa/ });
      expect(boton.tagName).toBe('BUTTON');
      expect(boton).toHaveAttribute('type', 'button');
      fireEvent.click(boton);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('un paso sin href ni onSelect es texto estático: ni enlace ni botón', () => {
      renderMap();
      expect(screen.queryByRole('link', { name: /Movilidad/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Movilidad/ })).not.toBeInTheDocument();
      const fila = rowOf('Movilidad');
      expect(fila.tagName).toBe('DIV');
      expect(fila).not.toHaveAttribute('tabindex');
    });

    it('si trae href y onSelect, es un enlace y el clic también llama a onSelect', () => {
      const onSelect = vi.fn();
      const phases: ProgramMapPhase[] = [
        {
          id: 'a',
          label: 'A',
          steps: [{ id: 'a1', title: 'Doble', status: 'upcoming', href: '/doble', onSelect }],
        },
      ];
      renderMap({ phases });
      const enlace = screen.getByRole('link', { name: /Doble/ });
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      // jsdom no navega: se cancela el clic para no ensuciar la salida con un aviso.
      enlace.addEventListener('click', (event) => event.preventDefault());
      fireEvent.click(enlace);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('las filas interactivas llevan foco visible; las estáticas no', () => {
      renderMap();
      expect(screen.getByRole('link', { name: /Dormir mejor/ })).toHaveClass('ui-focus-ring');
      expect(screen.getByRole('button', { name: /Fuerza en casa/ })).toHaveClass('ui-focus-ring');
    });

    it('un paso bloqueado con onSelect sigue siendo un botón', () => {
      renderMap();
      expect(screen.getByRole('button', { name: /Competición/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Resistencia/ })).not.toBeInTheDocument();
    });
  });

  describe('el estado no depende solo del color', () => {
    it('añade texto para lectores de pantalla en cada paso que no es el actual', () => {
      renderMap();
      // hecho (1), pendiente (1), bloqueados (2); el actual ya lleva la insignia.
      expect(screen.getAllByText('Completado')).toHaveLength(1);
      expect(screen.getAllByText('Pendiente')).toHaveLength(1);
      expect(screen.getAllByText('Bloqueado')).toHaveLength(2);
    });

    it('el texto de estado forma parte del nombre accesible de la fila', () => {
      renderMap();
      expect(screen.getByRole('link', { name: /Dormir mejor.*Completado/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Competición.*Bloqueado/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Estás aquí.*Fuerza en casa/ })).toBeInTheDocument();
    });

    it('el texto de estado está oculto a la vista pero presente para el lector', () => {
      renderMap();
      const oculto = screen.getByText('Completado');
      expect(oculto.style.position).toBe('absolute');
      expect(oculto.style.width).toBe('1px');
      expect(oculto.style.height).toBe('1px');
    });

    it('hecho lleva icono de check y bloqueado icono de candado', () => {
      renderMap();
      expect(rowOf('Dormir mejor').querySelector('svg.lucide-check')).not.toBeNull();
      expect(rowOf('Dormir mejor').querySelector('svg.lucide-lock')).toBeNull();
      expect(rowOf('Resistencia').querySelector('svg.lucide-lock')).not.toBeNull();
      expect(rowOf('Resistencia').querySelector('svg.lucide-check')).toBeNull();
    });

    it('actual y pendiente no llevan ni check ni candado', () => {
      renderMap();
      for (const titulo of ['Fuerza en casa', 'Movilidad']) {
        expect(rowOf(titulo).querySelector('svg.lucide-check')).toBeNull();
        expect(rowOf(titulo).querySelector('svg.lucide-lock')).toBeNull();
      }
    });

    it('los iconos son decorativos', () => {
      const { container } = renderMap();
      const iconos = container.querySelectorAll('svg');
      expect(iconos.length).toBeGreaterThan(0);
      iconos.forEach((icono) => expect(icono).toHaveAttribute('aria-hidden', 'true'));
    });

    it('los pasos bloqueados NO bajan la opacidad del texto', () => {
      const { container } = renderMap();
      expect(container.innerHTML).not.toMatch(/opacity/i);
      const titulo = screen.getByText('Resistencia');
      expect(titulo).toHaveClass('gu-text-text');
    });
  });

  describe('medidas y tokens', () => {
    it('cada fila mide al menos 44 px de alto y el círculo del número es de 44 px', () => {
      renderMap();
      for (const titulo of ['Dormir mejor', 'Fuerza en casa', 'Movilidad', 'Resistencia']) {
        expect(rowOf(titulo)).toHaveClass('min-h-11');
      }
      expect(screen.getByText('2')).toHaveClass('h-11');
      expect(screen.getByText('2')).toHaveClass('w-11');
    });

    it('el texto más pequeño es de 12 px (text-xs)', () => {
      const { container } = renderMap();
      expect(container.innerHTML).not.toMatch(/text-\[\d+(\.\d+)?(px|rem)\]/);
      expect(container.innerHTML).not.toContain('gu-text-2xs');
    });

    it('no hay colores literales: solo tokens var(--ui-*)', () => {
      const { container } = renderMap();
      expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(container.innerHTML).not.toMatch(/\b(?:rgb|rgba|hsl|hsla|oklch)\(/i);
    });

    it('el número hecho usa relleno y tinta del primario; el actual, el primario como texto', () => {
      renderMap();
      const hecho = screen.getByText('1');
      expect(hecho.style.backgroundColor).toBe('var(--ui-primary-fill)');
      expect(hecho.style.color).toBe('var(--ui-primary-ink, var(--ui-surface))');
      const actual = screen.getByText('2');
      expect(actual.style.color).toBe('var(--ui-primary-text)');
      expect(actual.style.borderColor).toBe('var(--ui-primary)');
    });
  });

  describe('acento y miniatura', () => {
    it('pinta el acento como filete decorativo oculto al lector', () => {
      renderMap();
      const filete = rowOf('Dormir mejor').querySelector('span.absolute');
      expect(filete).not.toBeNull();
      expect(filete).toHaveAttribute('aria-hidden', 'true');
      expect((filete as HTMLElement).style.backgroundColor).toBe('var(--ui-primary)');
    });

    it('sin acento no hay filete', () => {
      renderMap();
      expect(rowOf('Movilidad').querySelector('span.absolute')).toBeNull();
    });

    it('pinta la miniatura dentro de la fila', () => {
      const phases: ProgramMapPhase[] = [
        {
          id: 'a',
          label: 'A',
          steps: [
            {
              id: 'a1',
              title: 'Con foto',
              status: 'upcoming',
              media: <img data-testid="miniatura" alt="" src="/foto.png" />,
            },
          ],
        },
      ];
      renderMap({ phases });
      expect(rowOf('Con foto')).toContainElement(screen.getByTestId('miniatura'));
    });
  });

  describe('texto', () => {
    it('toda la copy llega por props: cambiando los idiomas cambia todo', () => {
      renderMap({
        phases: [
          {
            id: 'p',
            label: 'Grundphase',
            steps: [
              { id: 's1', number: 1, title: 'Erster Schritt', status: 'done' },
              { id: 's2', number: 2, title: 'Zweiter Schritt', status: 'current' },
              { id: 's3', number: 3, title: 'Dritter Schritt', status: 'locked' },
            ],
          },
        ],
        currentLabel: 'Du bist hier',
        statusLabels: { done: 'Erledigt', upcoming: 'Offen', locked: 'Gesperrt' },
        ariaLabel: 'Programmübersicht',
      });
      expect(screen.getByRole('region', { name: 'Programmübersicht' })).toBeInTheDocument();
      expect(screen.getByText('Du bist hier')).toBeInTheDocument();
      expect(screen.getByText('Erledigt')).toBeInTheDocument();
      expect(screen.getByText('Gesperrt')).toBeInTheDocument();
      expect(screen.queryByText('Estás aquí')).not.toBeInTheDocument();
      expect(screen.queryByText('Completado')).not.toBeInTheDocument();
    });
  });

  describe('accesibilidad', () => {
    it('no tiene violaciones axe con enlace, botón, estático, actual, hecho y bloqueado', async () => {
      const { container } = renderMap();
      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones axe con headingLevel 2 y 4', async () => {
      const dos = renderMap({ headingLevel: 2 });
      await expectNoA11yViolations(dos.container);
      dos.unmount();
      const cuatro = renderMap({ headingLevel: 4 });
      await expectNoA11yViolations(cuatro.container);
    });
  });
});
