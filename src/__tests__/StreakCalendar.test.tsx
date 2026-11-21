import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  StreakCalendar,
  type StreakCalendarDayState,
  type StreakCalendarWeekday,
} from '../StreakCalendar';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const WEEKDAYS: StreakCalendarWeekday[] = [
  { label: 'L', ariaLabel: 'lunes' },
  { label: 'M', ariaLabel: 'martes' },
  { label: 'X', ariaLabel: 'miércoles' },
  { label: 'J', ariaLabel: 'jueves' },
  { label: 'V', ariaLabel: 'viernes' },
  { label: 'S', ariaLabel: 'sábado' },
  { label: 'D', ariaLabel: 'domingo' },
];

const STATE_TEXT: Record<StreakCalendarDayState, string> = {
  marked: 'entreno completado',
  empty: 'sin entreno',
  upcoming: 'por llegar',
};

const dayLabel = (date: string, state: StreakCalendarDayState) =>
  `${Number(date.slice(8))} de noviembre, ${STATE_TEXT[state]}`;

const NAME = 'Noviembre de 2026';

function renderNovember(props: Partial<Parameters<typeof StreakCalendar>[0]> = {}) {
  return render(
    <StreakCalendar
      month="2026-11"
      marked={['2026-11-02', '2026-11-04', '2026-11-20']}
      today="2026-11-21"
      weekdays={WEEKDAYS}
      ariaLabel={NAME}
      dayLabel={dayLabel}
      {...props}
    />,
  );
}

describe('StreakCalendar', () => {
  it('is a named table with seven weekday headers and one cell per day', () => {
    renderNovember();

    const table = screen.getByRole('table', { name: NAME });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(7);
    expect(table.querySelectorAll('td[data-state]')).toHaveLength(30);
  });

  it('starts the month under the right weekday', () => {
    // 1 November 2026 is a Sunday: with Monday first it sits in the last column.
    const { container } = renderNovember();
    const firstWeek = container.querySelectorAll('tbody tr')[0].querySelectorAll('td');

    expect(firstWeek).toHaveLength(7);
    expect(firstWeek[5]).toHaveAttribute('aria-hidden', 'true');
    expect(firstWeek[6]).toHaveTextContent('1 de noviembre');
  });

  it('honours a Sunday-first week', () => {
    const sundayFirst = [WEEKDAYS[6], ...WEEKDAYS.slice(0, 6)];
    const { container } = renderNovember({ firstDayOfWeek: 0, weekdays: sundayFirst });
    const firstWeek = container.querySelectorAll('tbody tr')[0].querySelectorAll('td');

    expect(firstWeek[0]).toHaveTextContent('1 de noviembre');
  });

  it('tells marked, empty and upcoming days apart in the accessible name', () => {
    renderNovember();

    expect(screen.getByText('2 de noviembre, entreno completado')).toBeInTheDocument();
    expect(screen.getByText('3 de noviembre, sin entreno')).toBeInTheDocument();
    expect(screen.getByText('22 de noviembre, por llegar')).toBeInTheDocument();
  });

  it('never reads a day after today as missed', () => {
    const { container } = renderNovember();

    expect(container.querySelectorAll('td[data-state="upcoming"]')).toHaveLength(9);
    expect(screen.queryByText('30 de noviembre, sin entreno')).not.toBeInTheDocument();
  });

  it('marks today with aria-current, and only today', () => {
    const { container } = renderNovember();
    const current = container.querySelectorAll('[aria-current="date"]');

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('21 de noviembre, sin entreno');
  });

  it('without today, no day is upcoming and none is current', () => {
    const { container } = renderNovember({ today: undefined });

    expect(container.querySelectorAll('td[data-state="upcoming"]')).toHaveLength(0);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
  });

  it('ignores marked days from another month', () => {
    const { container } = renderNovember({ marked: ['2026-10-31', '2026-12-01'] });

    expect(container.querySelectorAll('td[data-state="marked"]')).toHaveLength(0);
  });

  it('a marked day differs from an empty one by weight, not only by color', () => {
    renderNovember();
    const marked = screen.getByText('2 de noviembre, entreno completado').parentElement!;
    const empty = screen.getByText('3 de noviembre, sin entreno').parentElement!;

    expect(marked.style.fontWeight).toBe('700');
    expect(empty.style.fontWeight).toBe('500');
  });

  it('handles a leap February', () => {
    const { container } = renderNovember({ month: '2028-02', marked: [], today: undefined });

    expect(container.querySelectorAll('td[data-state]')).toHaveLength(29);
  });

  it('renders nothing for a malformed month', () => {
    const { container } = renderNovember({ month: '2026-13' });

    expect(container).toBeEmptyDOMElement();
  });

  it('has no axe violations', async () => {
    const { container } = renderNovember();

    await expectNoA11yViolations(container);
  });
});
