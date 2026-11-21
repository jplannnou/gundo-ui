import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationInbox, type NotificationInboxItem } from '../NotificationInbox';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const ITEMS: NotificationInboxItem[] = [
  { id: 'a', title: 'Tu clase empieza en 30 minutos', body: 'Fuerza 01', time: 'hace 5 min' },
  { id: 'b', title: 'Nuevo programa disponible', time: 'ayer', dateTime: '2026-11-20', read: true },
];

function renderInbox(props: Partial<Parameters<typeof NotificationInbox>[0]> = {}) {
  return render(
    <NotificationInbox
      ariaLabel="Notificaciones"
      title="Notificaciones"
      items={ITEMS}
      unreadLabel="Sin leer"
      emptyTitle="No tienes avisos"
      emptyBody="Aquí verás los recordatorios de tus clases."
      {...props}
    />,
  );
}

describe('NotificationInbox', () => {
  it('pinta una región con nombre y un aviso por elemento de lista', () => {
    renderInbox();
    const region = screen.getByRole('region', { name: 'Notificaciones' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 2, name: 'Notificaciones' })).toBeTruthy();
  });

  it('lo no leído se anuncia con texto, no solo con el punto', () => {
    renderInbox();
    const [unread, read] = screen.getAllByRole('listitem');
    expect(unread.getAttribute('data-read')).toBe('false');
    expect(unread.textContent).toContain('Sin leer: Tu clase empieza en 30 minutos');
    expect(read.getAttribute('data-read')).toBe('true');
    expect(read.textContent).not.toContain('Sin leer');
  });

  it('la fecha lleva dateTime cuando llega', () => {
    renderInbox();
    expect(screen.getByText('ayer').getAttribute('datetime')).toBe('2026-11-20');
  });

  it('fila con href es un enlace y con onClick un botón', () => {
    const onClick = vi.fn();
    renderInbox({
      items: [
        { id: 'a', title: 'Con enlace', time: 'hoy', href: '/clases' },
        { id: 'b', title: 'Con acción', time: 'hoy', onClick },
        { id: 'c', title: 'Estática', time: 'hoy' },
      ],
    });
    expect(screen.getByRole('link', { name: /Con enlace/ }).getAttribute('href')).toBe('/clases');
    fireEvent.click(screen.getByRole('button', { name: /Con acción/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Estática/ })).toBeNull();
  });

  it('«marcar todo» solo sale con avisos sin leer y con manejador', () => {
    const onMarkAllRead = vi.fn();
    const { rerender } = renderInbox({ markAllReadLabel: 'Marcar todo como leído', onMarkAllRead });
    fireEvent.click(screen.getByRole('button', { name: 'Marcar todo como leído' }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);

    rerender(
      <NotificationInbox
        ariaLabel="Notificaciones"
        items={ITEMS.map((item) => ({ ...item, read: true }))}
        unreadLabel="Sin leer"
        emptyTitle="No tienes avisos"
        markAllReadLabel="Marcar todo como leído"
        onMarkAllRead={onMarkAllRead}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Marcar todo como leído' })).toBeNull();
  });

  it('sin avisos muestra el estado vacío y ninguna lista', () => {
    renderInbox({ items: [] });
    expect(screen.getByText('No tienes avisos')).toBeTruthy();
    expect(screen.getByText('Aquí verás los recordatorios de tus clases.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('respeta el nivel de encabezado', () => {
    renderInbox({ headingLevel: 3 });
    expect(screen.getByRole('heading', { level: 3, name: 'Notificaciones' })).toBeTruthy();
  });

  it('pasa axe con avisos y vacío', async () => {
    const withItems = renderInbox({
      markAllReadLabel: 'Marcar todo como leído',
      onMarkAllRead: () => {},
    });
    await expectNoA11yViolations(withItems.container);
    cleanup();
    const empty = renderInbox({ items: [] });
    await expectNoA11yViolations(empty.container);
  });
});
