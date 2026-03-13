import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarGrid, type CalendarEvent } from '../CalendarGrid';

const events: CalendarEvent[] = [
  { id: '1', title: 'Reunión equipo', date: '2026-03-10', color: '#ef4444' },
  { id: '2', title: 'Desayuno', date: '2026-03-10' },
  { id: '3', title: 'Review', date: '2026-03-15' },
];

describe('CalendarGrid', () => {
  it('renders grid with 7 column headers', () => {
    render(<CalendarGrid defaultDate="2026-03-13" />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
  });

  it('shows month name in header', () => {
    render(<CalendarGrid defaultDate="2026-03-13" view="month" />);
    expect(screen.getByText(/Marzo 2026/)).toBeInTheDocument();
  });

  it('calls onDateClick when day cell is clicked', () => {
    const onDateClick = vi.fn();
    render(<CalendarGrid defaultDate="2026-03-13" view="week" onDateClick={onDateClick} />);
    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[0]);
    expect(onDateClick).toHaveBeenCalledOnce();
  });

  it('renders events in day cells', () => {
    render(<CalendarGrid defaultDate="2026-03-10" view="week" events={events} />);
    expect(screen.getAllByText('Reunión equipo')[0]).toBeInTheDocument();
  });

  it('calls onEventClick when event button is clicked', () => {
    const onEventClick = vi.fn();
    render(
      <CalendarGrid
        defaultDate="2026-03-10"
        view="week"
        events={events}
        onEventClick={onEventClick}
      />,
    );
    fireEvent.click(screen.getAllByLabelText('Reunión equipo')[0]);
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('renders navigation buttons', () => {
    render(<CalendarGrid defaultDate="2026-03-13" />);
    expect(screen.getByLabelText('Semana/mes anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Semana/mes siguiente')).toBeInTheDocument();
  });

  it('navigates to next week on next button click', () => {
    render(<CalendarGrid defaultDate="2026-03-09" view="week" />);
    fireEvent.click(screen.getByLabelText('Semana/mes siguiente'));
    expect(screen.getByText(/Marzo 2026/)).toBeInTheDocument();
  });
});
