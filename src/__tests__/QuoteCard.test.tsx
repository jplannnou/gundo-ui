import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { QuoteCard } from '../QuoteCard';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const FRASE = '«La constancia vale más que la motivación».';

describe('QuoteCard', () => {
  it('pinta la frase en un blockquote dentro de un figure, sin figcaption si no hay autor', () => {
    const { container } = render(<QuoteCard quote={FRASE} />);

    const figure = container.querySelector('figure');
    expect(figure).not.toBeNull();

    const bloque = screen.getByText(FRASE);
    expect(bloque.tagName).toBe('BLOCKQUOTE');
    expect(figure).toContainElement(bloque);
    expect(bloque).toHaveClass('gu-display');

    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('con autor añade un figcaption con su nombre', () => {
    const { container } = render(<QuoteCard quote={FRASE} author="Marta Ruiz" />);

    const pie = container.querySelector('figcaption');
    expect(pie).not.toBeNull();
    expect(pie).toHaveTextContent('Marta Ruiz');
    expect(container.querySelector('figure')).toContainElement(pie as HTMLElement);
  });

  it('pinta el antetítulo solo cuando llega', () => {
    const { rerender } = render(<QuoteCard quote={FRASE} />);
    expect(screen.queryByText('Frase del día')).not.toBeInTheDocument();

    rerender(<QuoteCard quote={FRASE} eyebrow="Frase del día" />);
    expect(screen.getByText('Frase del día')).toBeInTheDocument();
  });

  it('el tono por defecto usa la superficie elevada y no pinta relleno primario', () => {
    const { container } = render(<QuoteCard quote={FRASE} />);
    const figure = container.querySelector('figure') as HTMLElement;

    expect(figure).toHaveAttribute('data-tone', 'default');
    expect(figure).toHaveClass('gu-bg-surface-raised', 'gu-text-text');
    expect(figure.getAttribute('style')).not.toContain('--ui-primary-fill');
  });

  it('el tono primary rellena con --ui-primary-fill y usa la tinta del primario', () => {
    const { container } = render(<QuoteCard quote={FRASE} author="Marta Ruiz" tone="primary" />);
    const figure = container.querySelector('figure') as HTMLElement;

    expect(figure).toHaveAttribute('data-tone', 'primary');
    expect(figure).not.toHaveClass('gu-bg-surface-raised');

    const estilo = figure.getAttribute('style') ?? '';
    expect(estilo).toContain('var(--ui-primary-fill)');
    expect(estilo).toContain('var(--ui-primary-ink, var(--ui-surface))');
  });

  it('el radio sale del token --ui-radius-xl', () => {
    const { container } = render(<QuoteCard quote={FRASE} />);
    const figure = container.querySelector('figure') as HTMLElement;

    expect(figure.getAttribute('style')).toContain('var(--ui-radius-xl)');
  });

  it('md y lg escalan con clamp y la frase reparte las líneas con text-wrap: balance', () => {
    const { container, rerender } = render(<QuoteCard quote={FRASE} size="md" />);
    const frase = () => container.querySelector('blockquote') as HTMLElement;
    // `font-size` lee la variable local `--gu-quote-size`, que lleva el clamp().
    const escala = () => frase().style.getPropertyValue('--gu-quote-size');

    expect(frase().style.fontSize).toBe('var(--gu-quote-size)');
    expect(frase().style.getPropertyValue('text-wrap')).toBe('balance');
    const md = escala();
    expect(md).toContain('clamp(');
    expect(md).toContain('1.75rem');

    rerender(<QuoteCard quote={FRASE} size="lg" />);
    const lg = escala();
    expect(lg).toContain('clamp(');
    expect(lg).toContain('2.5rem');
    expect(lg).not.toEqual(md);
    expect(frase().style.getPropertyValue('text-wrap')).toBe('balance');
  });

  it('align="center" centra el contenido', () => {
    const { container } = render(<QuoteCard quote={FRASE} author="Marta Ruiz" align="center" />);

    expect(container.querySelector('figure')).toHaveClass('items-center', 'text-center');
  });

  it('la decoración va oculta a los lectores de pantalla y no tapa el texto', () => {
    const { container } = render(
      <QuoteCard
        quote={FRASE}
        decoration={<svg data-testid="trazo" viewBox="0 0 10 10"><path d="M0 0L10 10" /></svg>}
      />,
    );

    const trazo = screen.getByTestId('trazo');
    const envoltorio = trazo.closest('[aria-hidden="true"]') as HTMLElement;
    expect(envoltorio).not.toBeNull();
    expect(envoltorio).toHaveClass('absolute', 'pointer-events-none');

    // La frase queda fuera de la ranura oculta, así que sigue siendo accesible.
    expect(envoltorio).not.toContainElement(screen.getByText(FRASE));
    expect(container.querySelector('figure')).toContainElement(envoltorio);
  });

  it('sin decoración no pinta la ranura', () => {
    const { container } = render(<QuoteCard quote={FRASE} />);

    expect(container.querySelector('[data-slot="decoration"]')).toBeNull();
  });

  it('no lleva ningún color literal: todo sale de tokens --ui-*', () => {
    const { container } = render(
      <QuoteCard quote={FRASE} author="Marta Ruiz" eyebrow="Frase del día" tone="primary" />,
    );

    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  it('acepta className extra en el figure', () => {
    const { container } = render(<QuoteCard quote={FRASE} className="mi-clase" />);

    expect(container.querySelector('figure')).toHaveClass('mi-clase');
  });

  describe('accesibilidad (axe)', () => {
    it('no tiene violaciones con autor, antetítulo y decoración', async () => {
      const { container } = render(
        <QuoteCard
          quote={FRASE}
          author="Marta Ruiz"
          eyebrow="Frase del día"
          decoration={<svg viewBox="0 0 10 10"><path d="M0 0L10 10" /></svg>}
        />,
      );

      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones en el tono primary, tamaño lg y centrado', async () => {
      const { container } = render(
        <QuoteCard quote={FRASE} author="Marta Ruiz" tone="primary" size="lg" align="center" />,
      );

      await expectNoA11yViolations(container);
    });

    it('no tiene violaciones en su versión mínima', async () => {
      const { container } = render(<QuoteCard quote={FRASE} />);

      await expectNoA11yViolations(container);
    });
  });
});
