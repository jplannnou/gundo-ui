import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroRow } from '../MacroRow';
import { expectNoA11yViolations } from './axe-helper';

/**
 * Matches the figure span by its full text. The unit is a child span
 * (`UnitSuffix`), so «62 / 120 g» is split across nodes and a plain string
 * matcher would only see «62 / 120 ».
 */
const figure = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === 'SPAN' &&
  el.textContent === text &&
  Array.from(el.children).every((child) => child.hasAttribute('data-gu-unit'));

describe('MacroRow', () => {
  it('builds cells from shorthand macro props', () => {
    render(<MacroRow calories={620} protein={42} carbs={48} fat={22} />);
    expect(screen.getByText('620')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('Carbos')).toBeInTheDocument();
  });

  it('renders explicit items in order', () => {
    render(
      <MacroRow
        items={[
          { label: 'Prot', value: 18, unit: 'g', kind: 'protein' },
          { label: 'Carb', value: 52, unit: 'g', kind: 'carbs' },
        ]}
      />,
    );
    expect(screen.getByText('Prot')).toBeInTheDocument();
    expect(screen.getByText('Carb')).toBeInTheDocument();
  });

  it('renders nothing when empty', () => {
    const { container } = render(<MacroRow />);
    expect(container.firstChild).toBeNull();
  });

  it('supports the compact strip variant', () => {
    const { container } = render(<MacroRow protein={18} carbs={52} fat={14} variant="strip" />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText(figure('18g'))).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toHaveClass('gu-text-text-secondary');
    expect(screen.getByText('Proteína')).not.toHaveClass('gu-text-text-muted');
  });
});

describe('MacroRow · variant="progress"', () => {
  const ITEMS = [
    { label: 'Proteína', value: 62, target: 120, unit: 'g', kind: 'protein' },
    { label: 'Carbos', value: 140, target: 200, unit: 'g', kind: 'carbs' },
  ];

  it('shows "consumed / goal unit" with a progressbar per macro by default', () => {
    render(<MacroRow variant="progress" items={ITEMS} />);

    expect(screen.getByText(figure('62 / 120 g'))).toBeInTheDocument();
    expect(screen.getByText(figure('140 / 200 g'))).toBeInTheDocument();

    const bar = screen.getByRole('progressbar', { name: 'Proteína' });
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '120');
    expect(bar).toHaveAttribute('aria-valuetext', '62 / 120 g');
  });

  it('draws an 8 px bar with the surface-hover track and a fill at the consumed share', () => {
    render(<MacroRow variant="progress" items={ITEMS} />);

    const bar = screen.getByRole('progressbar', { name: 'Proteína' });
    expect(bar).toHaveClass('h-2');
    expect(bar.style.backgroundColor).toBe('var(--ui-surface-hover)');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe(`${(62 / 120) * 100}%`);
    expect(fill.style.backgroundColor).toBe('var(--ui-macro-protein)');
  });

  it('keeps the macro color on the bar only: figure in --ui-text, label secondary', () => {
    render(<MacroRow variant="progress" items={ITEMS} />);

    expect(screen.getByText(figure('62 / 120 g')).style.color).toBe('var(--ui-text)');
    expect(screen.getByText('Proteína')).toHaveClass('gu-text-text-secondary');
    expect(screen.getByText('Proteína').style.color).toBe('');
  });

  it('shows what is left in remaining mode, with the translated label', () => {
    render(<MacroRow variant="progress" items={ITEMS} progressMode="remaining" remainingLabel="restante" />);

    expect(screen.getByText(figure('58 g restante'))).toBeInTheDocument();
    expect(screen.getByText(figure('60 g restante'))).toBeInTheDocument();
    expect(screen.queryByText(figure('62 / 120 g'))).not.toBeInTheDocument();
    // The bar still fills with what was consumed.
    const bar = screen.getByRole('progressbar', { name: 'Proteína' });
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuetext', '58 g restante');
  });

  it('shows the excess with overLabel, caps the bar at 100% and never exceeds aria-valuemax', () => {
    render(
      <MacroRow
        variant="progress"
        items={[{ label: 'Grasas', value: 80, target: 68, unit: 'g', kind: 'fat' }]}
        overLabel="de más"
      />,
    );

    expect(screen.getByText(figure('12 g de más'))).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Grasas' });
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('100%');
    expect(bar).toHaveAttribute('aria-valuenow', '68');
    expect(bar).toHaveAttribute('aria-valuemax', '68');
    expect(bar).toHaveAttribute('aria-valuetext', '12 g de más');
  });

  it('says the same about the excess in remaining mode', () => {
    render(
      <MacroRow
        variant="progress"
        progressMode="remaining"
        remainingLabel="restante"
        overLabel="de más"
        items={[{ label: 'Grasas', value: 80, target: 68, unit: 'g', kind: 'fat' }]}
      />,
    );
    expect(screen.getByText(figure('12 g de más'))).toBeInTheDocument();
  });

  it('rounds the difference so floating point noise never reaches the screen', () => {
    render(
      <MacroRow
        variant="progress"
        progressMode="remaining"
        remainingLabel="restante"
        items={[{ label: 'Fibra', value: 62.3, target: 120, unit: 'g', kind: 'fiber' }]}
      />,
    );
    expect(screen.getByText(figure('57.7 g restante'))).toBeInTheDocument();
  });

  it('is exactly at the goal: full bar, zero remaining, no excess', () => {
    render(
      <MacroRow
        variant="progress"
        progressMode="remaining"
        remainingLabel="restante"
        overLabel="de más"
        items={[{ label: 'Proteína', value: 120, target: 120, unit: 'g', kind: 'protein' }]}
      />,
    );
    expect(screen.getByText(figure('0 g restante'))).toBeInTheDocument();
    expect(screen.queryByText(/de más/)).not.toBeInTheDocument();
    expect((screen.getByRole('progressbar').firstElementChild as HTMLElement).style.width).toBe('100%');
  });

  it('shows only the value, with no bar, for a cell without target', () => {
    render(
      <MacroRow
        variant="progress"
        items={[
          { label: 'Proteína', value: 62, target: 120, unit: 'g', kind: 'protein' },
          { label: 'Fibra', value: 9, unit: 'g', kind: 'fiber' },
        ]}
      />,
    );

    expect(screen.getByText(figure('9 g'))).toBeInTheDocument();
    expect(screen.getByText('Fibra')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByRole('progressbar', { name: 'Fibra' })).not.toBeInTheDocument();
  });

  it('treats a non-positive target as no target', () => {
    render(<MacroRow variant="progress" items={[{ label: 'Fibra', value: 9, target: 0, unit: 'g' }]} />);
    expect(screen.getByText(figure('9 g'))).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('keeps working when the unit is empty (kcal shorthand)', () => {
    render(<MacroRow variant="progress" calories={620} targets={{ calories: 2000 }} />);
    expect(screen.getByText('620 / 2000')).toBeInTheDocument();
  });

  it('feeds the bars from the shorthand props through `targets`', () => {
    render(
      <MacroRow
        variant="progress"
        protein={62}
        carbs={140}
        fat={30}
        targets={{ protein: 120, carbs: 200 }}
      />,
    );

    expect(screen.getByText(figure('62 / 120 g'))).toBeInTheDocument();
    expect(screen.getByText(figure('140 / 200 g'))).toBeInTheDocument();
    // `fat` has no goal: just the value.
    expect(screen.getByText(figure('30 g'))).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
  });

  it('renders nothing when empty', () => {
    const { container } = render(<MacroRow variant="progress" />);
    expect(container.firstChild).toBeNull();
  });

  it('leaves cells and strip untouched when targets are passed', () => {
    const { rerender } = render(<MacroRow protein={42} targets={{ protein: 120 }} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    rerender(<MacroRow protein={42} targets={{ protein: 120 }} variant="strip" />);
    expect(screen.getByText(figure('42g'))).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <MacroRow
        variant="progress"
        progressMode="remaining"
        remainingLabel="restante"
        overLabel="de más"
        items={[
          ...ITEMS,
          { label: 'Grasas', value: 80, target: 68, unit: 'g', kind: 'fat' },
          { label: 'Fibra', value: 9, unit: 'g', kind: 'fiber' },
        ]}
      />,
    );
    await expectNoA11yViolations(container);
  });
});

/**
 * Guarda del 24-nov-2026: en Estadio `--ui-font-serif` es Bebas Neue (solo
 * mayúsculas) y «50g» pegado se leía «506», «160g» se leía «1606». La unidad
 * tiene que ir aparte, en la fuente del cuerpo, en las tres variantes.
 */
describe('MacroRow · la unidad nunca usa la fuente del número', () => {
  const unitsOf = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('[data-gu-unit]'));

  it.each(['strip', 'cells'] as const)('variant="%s" con serif', (variant) => {
    const { container } = render(<MacroRow serif variant={variant} protein={50} carbs={160} fat={39} />);
    const units = unitsOf(container);
    expect(units.map((u) => u.textContent)).toEqual(['g', 'g', 'g']);
    for (const unit of units) {
      expect(unit.style.fontFamily).toBe('var(--ui-font-family)');
      expect(unit.style.textTransform).toBe('none');
      // La cifra sigue en la serif del tema; solo la unidad cambia de letra.
      expect(unit.parentElement!.style.fontFamily).toBe('var(--ui-font-serif)');
    }
  });

  it('variant="progress" con serif separa cada unidad', () => {
    const { container } = render(
      <MacroRow serif variant="progress" protein={62} fat={80} targets={{ protein: 120, fat: 68 }} overLabel="de más" />,
    );
    const units = unitsOf(container);
    expect(units).toHaveLength(2);
    for (const unit of units) expect(unit.style.fontFamily).toBe('var(--ui-font-family)');
    // El texto accesible no cambia: la barra sigue anunciando la cifra entera.
    expect(screen.getByRole('progressbar', { name: 'Proteína' })).toHaveAttribute('aria-valuetext', '62 / 120 g');
  });
});
