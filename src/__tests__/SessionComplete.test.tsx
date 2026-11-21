import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionComplete, type SessionCompleteProps } from '../SessionComplete';
import { expectNoA11yViolations } from './axe-helper';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

/** `setup.ts` deja `matchMedia` en «no»; aquí se fuerza el aviso de movimiento reducido. */
function preferReducedMotion(reduce: boolean) {
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

const BASE: SessionCompleteProps = {
  title: 'Sesión completada',
  primaryLabel: 'Listo',
  onPrimary: () => {},
};

const OPTIONS = [
  { value: 'hard', label: 'Duro', icon: <span>😓</span> },
  { value: 'ok', label: 'Bien', icon: <span>🙂</span> },
  { value: 'easy', label: 'Fácil', icon: <span>😎</span> },
];

const STATS = [
  { label: 'Duración', value: '42 min' },
  { label: 'Series', value: '18' },
];

function renderComplete(props: Partial<SessionCompleteProps> = {}) {
  return render(
    <SessionComplete
      {...BASE}
      question="¿Cómo te ha ido?"
      options={OPTIONS}
      onSelect={() => {}}
      {...props}
    />,
  );
}

/** Mantiene la respuesta como lo haría la app: el componente es controlado. */
function Harness({ onSelect, ...rest }: Partial<SessionCompleteProps>) {
  const [value, setValue] = useState<string | undefined>(rest.value);
  return (
    <SessionComplete
      {...BASE}
      question="¿Cómo te ha ido?"
      options={OPTIONS}
      {...rest}
      value={value}
      onSelect={next => {
        setValue(next);
        onSelect?.(next);
      }}
    />
  );
}

describe('SessionComplete', () => {
  it('renders the minimum: a titled section and the primary action', () => {
    render(<SessionComplete {...BASE} />);

    const region = screen.getByRole('region', { name: 'Sesión completada' });
    expect(region.tagName).toBe('SECTION');
    expect(screen.getByRole('heading', { level: 1, name: 'Sesión completada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Listo' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('term')).not.toBeInTheDocument();
  });

  it('renders eyebrow, description and a decorative mark hidden from assistive tech', () => {
    const { container } = render(
      <SessionComplete {...BASE} eyebrow="Entreno de hoy" description="Has cumplido con tu plan." />,
    );

    expect(screen.getByText('Entreno de hoy')).toBeInTheDocument();
    expect(screen.getByText('Has cumplido con tu plan.')).toBeInTheDocument();
    expect(container.querySelector('[data-part="mark"]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the stats as a description list', () => {
    const { container } = renderComplete({ stats: STATS });
    const dl = container.querySelector('dl')!;

    expect(dl.querySelectorAll('dt')).toHaveLength(2);
    expect(dl.querySelectorAll('dd')).toHaveLength(2);
    expect(dl.querySelectorAll('dt')[0].nextElementSibling).toHaveTextContent('42 min');
  });

  it('honours the heading level', () => {
    render(<SessionComplete {...BASE} headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Sesión completada' })).toBeInTheDocument();
  });

  /* ── la pregunta opcional ── */

  it('offers the options as a radiogroup named by the question, with none chosen', () => {
    renderComplete();

    const group = screen.getByRole('radiogroup', { name: '¿Cómo te ha ido?' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach(radio => expect(radio).toHaveAttribute('aria-checked', 'false'));
  });

  it('names each radio by its label only, not by its decorative icon', () => {
    renderComplete();

    expect(screen.getByRole('radio', { name: 'Bien' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Bien' }).querySelector('[aria-hidden="true"]')).toHaveTextContent('🙂');
  });

  it('every option is a touch target of at least 44 px', () => {
    renderComplete();

    screen.getAllByRole('radio').forEach(radio => {
      expect(parseInt(radio.style.minHeight, 10)).toBeGreaterThanOrEqual(44);
      expect(parseInt(radio.style.minWidth, 10)).toBeGreaterThanOrEqual(44);
    });
  });

  it('shows the question only with options and onSelect', () => {
    const { rerender } = render(<SessionComplete {...BASE} question="¿Cómo te ha ido?" options={OPTIONS} />);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Cómo te ha ido?')).not.toBeInTheDocument();

    rerender(<SessionComplete {...BASE} question="¿Cómo te ha ido?" options={[]} onSelect={() => {}} />);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Cómo te ha ido?')).not.toBeInTheDocument();
  });

  it('calls onSelect with the value on click, and not again on the chosen one', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Bien' }));
    expect(onSelect).toHaveBeenCalledWith('ok');
    expect(screen.getByRole('radio', { name: 'Bien' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: 'Bien' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('reflects a controlled value and lets the user change it', () => {
    render(<Harness value="easy" />);

    expect(screen.getByRole('radio', { name: 'Fácil' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Duro' }));
    expect(screen.getByRole('radio', { name: 'Duro' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Fácil' })).toHaveAttribute('aria-checked', 'false');
  });

  it('a chosen option differs by weight and border, not only by color', () => {
    renderComplete({ value: 'ok' });
    const chosen = screen.getByRole('radio', { name: 'Bien' });
    const other = screen.getByRole('radio', { name: 'Duro' });

    expect(chosen.style.fontWeight).toBe('700');
    expect(other.style.fontWeight).toBe('500');
    expect(chosen.style.border).toContain('2px');
    expect(other.style.border).toContain('1px');
  });

  it('uses a roving tab stop: the first option with none chosen, the chosen one otherwise', () => {
    const { rerender } = renderComplete();
    expect(screen.getByRole('radio', { name: 'Duro' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Bien' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Fácil' })).toHaveAttribute('tabindex', '-1');

    rerender(<SessionComplete {...BASE} question="¿Cómo te ha ido?" options={OPTIONS} onSelect={() => {}} value="easy" />);
    expect(screen.getByRole('radio', { name: 'Duro' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Fácil' })).toHaveAttribute('tabindex', '0');
  });

  it('arrows move focus and select, wrapping at both ends', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const [hard, ok, easy] = screen.getAllByRole('radio');

    hard.focus();
    fireEvent.keyDown(hard, { key: 'ArrowRight' });
    expect(ok).toHaveFocus();
    expect(ok).toHaveAttribute('aria-checked', 'true');
    expect(onSelect).toHaveBeenLastCalledWith('ok');

    fireEvent.keyDown(ok, { key: 'ArrowDown' });
    expect(easy).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('easy');

    fireEvent.keyDown(easy, { key: 'ArrowRight' });
    expect(hard).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('hard');

    fireEvent.keyDown(hard, { key: 'ArrowLeft' });
    expect(easy).toHaveFocus();
    fireEvent.keyDown(easy, { key: 'ArrowUp' });
    expect(ok).toHaveFocus();
  });

  it('Home and End jump to the first and last option', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} value="ok" />);
    const [hard, ok, easy] = screen.getAllByRole('radio');

    ok.focus();
    fireEvent.keyDown(ok, { key: 'End' });
    expect(easy).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('easy');

    fireEvent.keyDown(easy, { key: 'Home' });
    expect(hard).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('hard');
  });

  it('ignores other keys', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const [hard] = screen.getAllByRole('radio');

    hard.focus();
    fireEvent.keyDown(hard, { key: 'a' });
    fireEvent.keyDown(hard, { key: 'Tab' });
    expect(onSelect).not.toHaveBeenCalled();
    expect(hard).toHaveFocus();
  });

  /* ── contestar nunca es obligatorio ── */

  it('the primary action works without choosing anything', () => {
    const onPrimary = vi.fn();
    const onSelect = vi.fn();
    renderComplete({ onPrimary, onSelect });

    const primary = screen.getByRole('button', { name: 'Listo' });
    expect(primary).not.toBeDisabled();
    expect(primary).not.toHaveAttribute('aria-disabled');
    fireEvent.click(primary);

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('the primary action also works after choosing', () => {
    const onPrimary = vi.fn();
    render(<Harness onPrimary={onPrimary} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Fácil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it('the primary action is at least 48 px tall and full width', () => {
    renderComplete();
    const primary = screen.getByRole('button', { name: 'Listo' });

    expect(primary.style.minHeight).toBe('48px');
    expect(primary.style.width).toBe('100%');
    expect(primary.className).toContain('ui-btn-primary');
  });

  it('shows skip only with both label and handler, and calls it', () => {
    const onSkip = vi.fn();
    const { rerender } = renderComplete({ skipLabel: 'Ahora no', onSkip });

    const skip = screen.getByRole('button', { name: 'Ahora no' });
    expect(parseInt(skip.style.minHeight, 10)).toBeGreaterThanOrEqual(44);
    fireEvent.click(skip);
    expect(onSkip).toHaveBeenCalledTimes(1);

    rerender(<SessionComplete {...BASE} skipLabel="Ahora no" />);
    expect(screen.queryByRole('button', { name: 'Ahora no' })).not.toBeInTheDocument();

    rerender(<SessionComplete {...BASE} onSkip={onSkip} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('merges a custom className on the section', () => {
    renderComplete({ className: 'mi-clase' });

    expect(screen.getByRole('region')).toHaveClass('mi-clase');
  });

  it('has no hard-coded color in its inline styles', () => {
    const { container } = renderComplete({ value: 'ok', stats: STATS });
    const styled = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
      .map(el => el.getAttribute('style') ?? '')
      .join(';');

    expect(styled).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  /* ── movimiento ── */

  it('enters with a scale and fade over motion tokens, and ends at rest', async () => {
    renderComplete();
    const section = screen.getByRole('region');

    // Estado inicial: sin entrar todavía.
    expect(section.style.opacity).toBe('0');
    expect(section.style.transform).toBe('scale(0.96)');
    // Solo `opacity` y `transform`, con los tokens de theme.css.
    expect(section.style.transition).toContain('opacity var(--ui-duration-slow) var(--ui-easing-out)');
    expect(section.style.transition).toContain('transform var(--ui-duration-slow) var(--ui-easing-out)');
    expect(section.style.transition).not.toMatch(/\ball\b|width|height|margin|top|left|background/);

    await waitFor(() => expect(section.style.opacity).toBe('1'));
    expect(section.style.transform).toBe('none');
    expect(section).toHaveAttribute('data-entered');
  });

  it('the mark overshoots with the spring token, on transform only', async () => {
    const { container } = renderComplete();
    const mark = container.querySelector<HTMLElement>('[data-part="mark"]')!;

    expect(mark.style.transform).toBe('scale(0.5)');
    expect(mark.style.transition).toBe('transform var(--ui-duration-reveal) var(--ui-easing-spring)');
    await waitFor(() => expect(mark.style.transform).toBe('none'));
  });

  it('with prefers-reduced-motion it appears at rest, with no transition and no scale', () => {
    preferReducedMotion(true);
    const { container } = renderComplete();
    const section = screen.getByRole('region');
    const mark = container.querySelector<HTMLElement>('[data-part="mark"]')!;

    expect(section.style.opacity).toBe('1');
    expect(section.style.transform).toBe('none');
    expect(section.style.transition).toBe('none');
    expect(mark.style.transform).toBe('none');
    expect(mark.style.transition).toBe('none');
  });

  /* ── accesibilidad ── */

  it('has no axe violations with the minimum', async () => {
    const { container } = render(<SessionComplete {...BASE} />);

    await expectNoA11yViolations(container);
  });

  it('has no axe violations with everything on, none chosen', async () => {
    const { container } = renderComplete({
      eyebrow: 'Entreno de hoy',
      description: 'Has cumplido con tu plan.',
      stats: STATS,
      skipLabel: 'Ahora no',
      onSkip: () => {},
    });

    await expectNoA11yViolations(container);
  });

  it('has no axe violations with an option chosen', async () => {
    const { container } = renderComplete({ value: 'ok' });

    await expectNoA11yViolations(container);
  });
});
