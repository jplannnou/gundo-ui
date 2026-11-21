import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionPreview, type SessionPreviewProps } from '../SessionPreview';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const BASE: SessionPreviewProps = {
  title: 'Fuerza de tren superior',
  primaryLabel: 'Empezar',
  onPrimary: () => {},
};

const FACTS = [
  { label: 'Duración', value: '45 min' },
  { label: 'Nivel', value: 'Intermedio' },
  { label: 'Material', value: 'Mancuernas' },
];

function renderFull(props: Partial<SessionPreviewProps> = {}) {
  return render(
    <SessionPreview
      {...BASE}
      eyebrow="Hoy"
      imageSrc="/sesion.jpg"
      imageAlt="Persona levantando mancuernas"
      facts={FACTS}
      description="Empuje y tirón con carga moderada."
      itemsTitle="Qué necesitas"
      items={['Mancuernas de 8 a 12 kg', 'Una esterilla', 'Una toalla']}
      secondaryLabel="Mover entreno"
      onSecondary={() => {}}
      {...props}
    />,
  );
}

describe('SessionPreview', () => {
  it('renders the minimum: a titled section and the primary action', () => {
    render(<SessionPreview {...BASE} />);

    const region = screen.getByRole('region', { name: 'Fuerza de tren superior' });
    expect(region.tagName).toBe('SECTION');
    expect(screen.getByRole('heading', { level: 1, name: 'Fuerza de tren superior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders eyebrow, description, cover, facts and items', () => {
    renderFull();

    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Empuje y tirón con carga moderada.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Persona levantando mancuernas' })).toHaveAttribute('src', '/sesion.jpg');
    expect(screen.getByRole('heading', { level: 2, name: 'Qué necesitas' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Qué necesitas' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getByText('Una esterilla')).toBeInTheDocument();
  });

  it('draws the facts as a description list with each label paired to its value', () => {
    const { container } = renderFull();
    const dl = container.querySelector('dl')!;

    expect(dl.querySelectorAll('dt')).toHaveLength(3);
    expect(dl.querySelectorAll('dd')).toHaveLength(3);
    const first = dl.querySelectorAll('dt')[0];
    expect(first).toHaveTextContent('Duración');
    expect(first.nextElementSibling).toHaveTextContent('45 min');
  });

  it('hides a cover without imageAlt from assistive tech', () => {
    const { container } = renderFull({ imageAlt: undefined });
    const img = container.querySelector('img')!;

    expect(img).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('omits facts, list and cover when they do not arrive or are empty', () => {
    const { container } = render(<SessionPreview {...BASE} facts={[]} items={[]} itemsTitle="Qué necesitas" />);

    expect(container.querySelector('dl')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('Qué necesitas')).not.toBeInTheDocument();
  });

  it('honours the heading level and nests the list heading one level below', () => {
    renderFull({ headingLevel: 2 });

    expect(screen.getByRole('heading', { level: 2, name: 'Fuerza de tren superior' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Qué necesitas' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('keeps the list without a heading when there is no itemsTitle', () => {
    renderFull({ itemsTitle: undefined });

    expect(screen.getByRole('list')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('calls onPrimary on click and is a focusable native button for the keyboard', () => {
    const onPrimary = vi.fn();
    renderFull({ onPrimary });
    const button = screen.getByRole('button', { name: 'Empezar' });

    fireEvent.click(button);
    expect(onPrimary).toHaveBeenCalledTimes(1);

    // jsdom no convierte Enter/Espacio en click (lo hace el navegador con un
    // <button> nativo), así que se comprueba lo que lo hace posible: que sea
    // un <button type="button"> enfocable y sin tabindex negativo.
    button.focus();
    expect(button).toHaveFocus();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  it('the primary action is at least 48 px tall, full width and uses the primary fill and ink', () => {
    renderFull();
    const button = screen.getByRole('button', { name: 'Empezar' });

    expect(button.style.minHeight).toBe('48px');
    expect(button.style.width).toBe('100%');
    // El relleno y la tinta salen de `.ui-btn-primary` (Button.css) vía --ui-primary-fill / --ui-primary-ink.
    expect(button.className).toContain('ui-btn-primary');
  });

  it('pins the actions to the bottom edge', () => {
    renderFull();
    const actions = screen.getByRole('button', { name: 'Empezar' }).parentElement!;

    expect(actions.style.position).toBe('sticky');
    expect(actions.style.bottom).toBe('0px');
  });

  it('shows the secondary action only with both label and handler, and calls it', () => {
    const onSecondary = vi.fn();
    const { rerender } = renderFull({ onSecondary });

    const button = screen.getByRole('button', { name: 'Mover entreno' });
    expect(button.style.minHeight).toBe('48px');
    fireEvent.click(button);
    expect(onSecondary).toHaveBeenCalledTimes(1);

    rerender(<SessionPreview {...BASE} secondaryLabel="Mover entreno" />);
    expect(screen.queryByRole('button', { name: 'Mover entreno' })).not.toBeInTheDocument();

    rerender(<SessionPreview {...BASE} onSecondary={onSecondary} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('keeps the primary action first in the tab order', () => {
    renderFull();
    const [first, second] = screen.getAllByRole('button');

    expect(first).toHaveTextContent('Empezar');
    expect(second).toHaveTextContent('Mover entreno');
  });

  it('renders the children slot above the actions', () => {
    renderFull({ children: <p>Calienta cinco minutos antes.</p> });
    const note = screen.getByText('Calienta cinco minutos antes.');
    const primary = screen.getByRole('button', { name: 'Empezar' });

    expect(note.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('merges a custom className on the section', () => {
    render(<SessionPreview {...BASE} className="mi-clase" />);

    expect(screen.getByRole('region')).toHaveClass('mi-clase');
  });

  it('has no hard-coded color in its inline styles', () => {
    const { container } = renderFull();
    const styled = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
      .map(el => el.getAttribute('style') ?? '')
      .join(';');

    expect(styled).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('has no axe violations with everything on', async () => {
    const { container } = renderFull();

    await expectNoA11yViolations(container);
  });

  it('has no axe violations with the minimum', async () => {
    const { container } = render(<SessionPreview {...BASE} />);

    await expectNoA11yViolations(container);
  });
});
