import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { StatHero } from '../StatHero';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const BASE = { value: '1.980', label: 'Calorías de hoy' };

describe('StatHero', () => {
  it('render mínimo: cifra y etiqueta, sin nada más', () => {
    const { container } = render(<StatHero {...BASE} />);

    expect(screen.getByText('1.980')).toBeInTheDocument();
    expect(screen.getByText('Calorías de hoy')).toBeInTheDocument();

    expect(container.querySelector('[data-slot="unit"]')).toBeNull();
    expect(container.querySelector('[data-slot="trend"]')).toBeNull();
    expect(container.querySelector('[data-slot="visual"]')).toBeNull();
  });

  it('render completo: antetítulo, cifra con unidad, etiqueta, tendencia, frase y visual', () => {
    const { container } = render(
      <StatHero
        eyebrow="Hoy"
        value="1.980"
        unit="kcal"
        label="Calorías de hoy"
        caption="Vas dentro de tu objetivo."
        trend={{ direction: 'up', label: '+3 % frente a ayer' }}
        visual={<svg data-testid="anillo" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" /></svg>}
      />,
    );

    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Calorías de hoy')).toBeInTheDocument();
    expect(screen.getByText('Vas dentro de tu objetivo.')).toBeInTheDocument();
    expect(screen.getByText('+3 % frente a ayer')).toBeInTheDocument();
    expect(screen.getByTestId('anillo')).toBeInTheDocument();

    const valor = container.querySelector('[data-slot="value"]') as HTMLElement;
    expect(valor).toHaveTextContent('1.980 kcal');
    expect(valor.querySelector('[data-slot="unit"]')).toHaveTextContent('kcal');
  });

  it('la cifra va en display, tabular-nums y interlínea 1, con tamaño en clamp', () => {
    const { container } = render(<StatHero {...BASE} />);
    const valor = container.querySelector('[data-slot="value"]') as HTMLElement;

    expect(valor).toHaveClass('gu-display', 'tabular-nums', 'leading-none');
    expect(valor.style.lineHeight).toBe('1');
    // `font-size` lee la variable local `--gu-hero-size`, que lleva el clamp().
    expect(valor.style.fontSize).toBe('var(--gu-hero-size)');
    expect(valor.style.getPropertyValue('--gu-hero-size')).toContain('clamp(');
  });

  it('md, lg y xl usan tamaños distintos, y xl llega a 5,5 rem', () => {
    const { container, rerender } = render(<StatHero {...BASE} size="md" />);
    const tamano = () =>
      (container.querySelector('[data-slot="value"]') as HTMLElement).style.getPropertyValue(
        '--gu-hero-size',
      );

    const md = tamano();
    rerender(<StatHero {...BASE} size="lg" />);
    const lg = tamano();
    rerender(<StatHero {...BASE} size="xl" />);
    const xl = tamano();

    expect(new Set([md, lg, xl]).size).toBe(3);
    expect(md).toContain('3rem');
    expect(lg).toContain('4rem');
    expect(xl).toContain('5.5rem');
    for (const t of [md, lg, xl]) expect(t).toContain('clamp(');
  });

  it('el tono text usa --ui-text y el primary usa --ui-primary-text', () => {
    const { container, rerender } = render(<StatHero {...BASE} />);
    const valor = () => container.querySelector('[data-slot="value"]') as HTMLElement;

    expect(valor().getAttribute('style')).toContain('var(--ui-text)');
    expect(valor().getAttribute('style')).not.toContain('--ui-primary-text');

    rerender(<StatHero {...BASE} tone="primary" />);
    expect(valor().getAttribute('style')).toContain('var(--ui-primary-text)');
  });

  it('la etiqueta va en secundario y la frase en --ui-text', () => {
    render(<StatHero {...BASE} caption="Vas dentro de tu objetivo." />);

    expect(screen.getByText('Calorías de hoy')).toHaveClass('gu-text-text-secondary');
    expect(screen.getByText('Vas dentro de tu objetivo.')).toHaveClass('gu-text-text');
  });

  describe('tendencia', () => {
    for (const direction of ['up', 'down', 'flat'] as const) {
      it(`${direction}: icono decorativo más texto`, () => {
        const { container } = render(
          <StatHero {...BASE} trend={{ direction, label: 'Variación semanal' }} />,
        );

        const tendencia = container.querySelector('[data-slot="trend"]') as HTMLElement;
        expect(tendencia).toHaveAttribute('data-direction', direction);
        expect(tendencia).toHaveTextContent('Variación semanal');

        const icono = tendencia.querySelector('svg');
        expect(icono).not.toBeNull();
        expect(icono).toHaveAttribute('aria-hidden', 'true');
      });
    }

    it('cada sentido dibuja un icono distinto', () => {
      const dibujos = (['up', 'down', 'flat'] as const).map((direction) => {
        const { container, unmount } = render(
          <StatHero {...BASE} trend={{ direction, label: 'Variación' }} />,
        );
        const svg = container.querySelector('[data-slot="trend"] svg') as SVGElement;
        const html = svg.innerHTML;
        unmount();
        return html;
      });

      expect(new Set(dibujos).size).toBe(3);
    });

    it('el sentido no depende del color: la tendencia no se colorea', () => {
      const { container } = render(
        <StatHero {...BASE} trend={{ direction: 'down', label: '−2 % frente a ayer' }} />,
      );
      const tendencia = container.querySelector('[data-slot="trend"]') as HTMLElement;

      expect(tendencia.getAttribute('style')).toBeNull();
      expect(tendencia.className).not.toMatch(/success|error|warning|green|red/);
      // El texto sí lleva el sentido, para quien no ve el icono.
      expect(tendencia).toHaveTextContent('−2 % frente a ayer');
    });
  });

  describe('ranura visual', () => {
    it('va al lado de la cifra, en el mismo contenedor que puede envolver', () => {
      const { container } = render(
        <StatHero {...BASE} visual={<svg data-testid="anillo" viewBox="0 0 10 10" aria-hidden="true" />} />,
      );

      const valor = container.querySelector('[data-slot="value"]') as HTMLElement;
      const visual = container.querySelector('[data-slot="visual"]') as HTMLElement;

      expect(visual).toContainElement(screen.getByTestId('anillo'));
      // Hermanos en una fila con flex-wrap: a la derecha si cabe, debajo si no.
      expect(valor.parentElement).toBe(visual.parentElement);
      expect(valor.parentElement).toHaveClass('flex', 'flex-wrap');
      // La ranura no se encoge: es la cifra la que cede.
      expect(visual).toHaveClass('shrink-0');
    });

    it('no oculta lo que pasa el consumidor: un visual informativo sigue accesible', () => {
      render(
        <StatHero
          {...BASE}
          visual={<div role="progressbar" aria-label="Progreso diario" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} />}
        />,
      );

      expect(screen.getByRole('progressbar', { name: 'Progreso diario' })).toBeInTheDocument();
    });
  });

  it('align="center" centra el bloque y la fila de la cifra', () => {
    const { container } = render(<StatHero {...BASE} align="center" visual={<span>v</span>} />);

    expect(container.firstElementChild).toHaveClass('items-center', 'text-center');
    expect((container.querySelector('[data-slot="value"]') as HTMLElement).parentElement).toHaveClass('justify-center');
  });

  it('acepta un ReactNode como valor', () => {
    render(<StatHero {...BASE} value={<span data-testid="nodo">2,1</span>} />);

    expect(screen.getByTestId('nodo')).toHaveTextContent('2,1');
  });

  it('no lleva ningún color literal: todo sale de tokens --ui-*', () => {
    const { container } = render(
      <StatHero
        {...BASE}
        eyebrow="Hoy"
        unit="kcal"
        caption="Vas bien."
        tone="primary"
        trend={{ direction: 'up', label: '+3 %' }}
      />,
    );

    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  describe('accesibilidad (axe)', () => {
    it('no tiene violaciones en su versión mínima', async () => {
      const { container } = render(<StatHero {...BASE} />);

      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones con todo: unidad, tendencia, frase y visual', async () => {
      const { container } = render(
        <StatHero
          eyebrow="Hoy"
          value="1.980"
          unit="kcal"
          label="Calorías de hoy"
          caption="Vas dentro de tu objetivo."
          trend={{ direction: 'flat', label: 'Sin cambios frente a ayer' }}
          size="xl"
          tone="primary"
          align="center"
          visual={<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" /></svg>}
        />,
      );

      await expectNoA11yViolations(container);
    });
  });
});
