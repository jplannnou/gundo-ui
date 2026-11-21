import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareSummary } from '../ShareSummary';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const STATS = [
  { label: 'Minutos', value: '132' },
  { label: 'Racha', value: '3 semanas' },
  { label: 'Programa', value: 'Fuerza 01' },
  { label: 'Sobra', value: 'no sale' },
];

function renderSummary(props: Partial<Parameters<typeof ShareSummary>[0]> = {}) {
  return render(
    <ShareSummary
      eyebrow="5T4D10"
      title="Semana completada"
      figure="4"
      figureLabel="entrenos esta semana"
      {...props}
    />,
  );
}

describe('ShareSummary', () => {
  it('pinta título, cifra y lo que cuenta', () => {
    renderSummary();
    expect(screen.getByRole('heading', { level: 2, name: 'Semana completada' })).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('entrenos esta semana')).toBeTruthy();
  });

  it('enseña como mucho tres datos, cada uno con su etiqueta', () => {
    renderSummary({ stats: STATS });
    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getByText('132')).toBeTruthy();
    expect(screen.queryByText('no sale')).toBeNull();
  });

  it('sin datos no deja una lista vacía', () => {
    const { container } = renderSummary();
    expect(container.querySelector('dl')).toBeNull();
  });

  it('el botón de compartir va fuera de la tarjeta y solo con manejador', () => {
    const onShare = vi.fn();
    const { container, rerender } = renderSummary({ shareLabel: 'Compartir', onShare });
    const button = screen.getByRole('button', { name: 'Compartir' });
    expect(container.querySelector('[data-share-card]')?.contains(button)).toBe(false);
    fireEvent.click(button);
    expect(onShare).toHaveBeenCalledTimes(1);

    rerender(
      <ShareSummary title="Semana completada" figure="4" figureLabel="entrenos" shareLabel="Compartir" />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marca, nota y forma llegan por props', () => {
    const { container } = renderSummary({
      brand: <span>marca</span>,
      footnote: '16–22 nov',
      aspect: '1/1',
      headingLevel: 3,
    });
    expect(screen.getByText('marca')).toBeTruthy();
    expect(screen.getByText('16–22 nov')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3 })).toBeTruthy();
    const card = container.querySelector('[data-share-card]') as HTMLElement;
    expect(card.style.aspectRatio.replaceAll(' ', '')).toBe('1/1');
  });

  it('pasa axe', async () => {
    const { container } = renderSummary({
      stats: STATS,
      brand: <span>marca</span>,
      footnote: '16–22 nov',
      shareLabel: 'Compartir',
      onShare: () => {},
    });
    await expectNoA11yViolations(container);
  });
});
