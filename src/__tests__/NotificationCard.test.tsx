import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationCard } from '../NotificationCard';

describe('NotificationCard', () => {
  it('renders title and body', () => {
    render(
      <NotificationCard
        type="kit_tracking"
        title="Tu kit está en camino"
        body="Entrega estimada: mañana"
        timestamp={new Date()}
      />,
    );
    expect(screen.getByText('Tu kit está en camino')).toBeInTheDocument();
    expect(screen.getByText(/mañana/)).toBeInTheDocument();
  });

  it('fires CTA click', () => {
    const onClick = vi.fn();
    render(
      <NotificationCard
        type="test_ready"
        title="Listo"
        body="x"
        timestamp={new Date()}
        cta={{ label: 'Ver', onClick }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(
      <NotificationCard
        type="alert"
        title="Alerta"
        body="x"
        timestamp={new Date()}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Descartar/ }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('applies read state', () => {
    render(
      <NotificationCard
        type="checkin_reminder"
        title="Check-in"
        body="Hacélo"
        timestamp={new Date()}
        read
      />,
    );
    // When read, the unread indicator should not be present
    expect(screen.queryByLabelText(/No leída/)).not.toBeInTheDocument();
  });
});
